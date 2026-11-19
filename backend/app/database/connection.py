import logging
import socket
from typing import Generator, Tuple, Optional
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("agrimind.database")

engine = None
SessionLocal = None
_db_init_error = None

def _is_host_reachable(url_str: str, timeout: float = 0.2) -> Tuple[bool, str]:
    """Fast socket-level probe without DNS getaddrinfo delay."""
    try:
        parsed = urlparse(url_str)
        host = parsed.hostname or "127.0.0.1"
        if host.lower() == "localhost":
            host = "127.0.0.1"
        port = parsed.port or 5432
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            s.connect((host, port))
            return True, f"Port {port} on {host} is reachable"
    except Exception as e:
        return False, f"PostgreSQL port unreachable ({type(e).__name__})"

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as exc:
    _db_init_error = f"Database driver or URL configuration error: {type(exc).__name__}: {str(exc)}"
    logger.warning(_db_init_error)

def check_database_connection() -> Tuple[bool, str]:
    """
    Safely tests database connectivity without blocking or raising unhandled exceptions.
    Returns (is_connected: bool, message: str).
    """
    global engine, _db_init_error
    if _db_init_error:
        return False, _db_init_error
    if engine is None:
        return False, "Database engine not initialized"

    # Fast socket probe first to avoid TCP SYN timeouts if PostgreSQL is not running
    reachable, probe_msg = _is_host_reachable(settings.DATABASE_URL, timeout=0.2)
    if not reachable:
        return False, f"PostgreSQL pending configuration: {probe_msg}"
        
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return True, "PostgreSQL connected successfully"
    except Exception as exc:
        msg = f"PostgreSQL connection failed: {type(exc).__name__}"
        logger.warning(msg)
        return False, msg

def get_db() -> Generator[Optional[Session], None, None]:
    """FastAPI dependency for database sessions. Returns None if DB not configured."""
    if SessionLocal is None:
        yield None
        return
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
