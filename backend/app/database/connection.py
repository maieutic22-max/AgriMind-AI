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

def _is_host_reachable(url_str: str, timeout: float = 1.0) -> Tuple[bool, str]:
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

def _get_or_create_engine():
    """Lazily initializes the engine and SessionLocal if needed."""
    global engine, SessionLocal, _db_init_error
    if engine is None:
        try:
            engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True
            )
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            _db_init_error = None
        except Exception as exc:
            _db_init_error = f"Database driver or URL configuration error: {type(exc).__name__}: {str(exc)}"
            logger.warning(_db_init_error)
    return engine

try:
    _get_or_create_engine()
except Exception as exc:
    _db_init_error = str(exc)

def check_database_connection() -> Tuple[bool, str]:
    """
    Safely tests database connectivity without blocking or raising unhandled exceptions.
    Returns (is_connected: bool, message: str).
    """
    global engine, _db_init_error
    
    # Ensure engine is initialized
    _get_or_create_engine()
    if _db_init_error:
        return False, _db_init_error
    if engine is None:
        return False, "Database engine not initialized"

    # Fast socket probe first to avoid TCP SYN timeouts if PostgreSQL is not running
    reachable, probe_msg = _is_host_reachable(settings.DATABASE_URL, timeout=1.0)
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

def init_db() -> Tuple[bool, str]:
    """
    Safely creates all database tables for registered SQLAlchemy models
    (User, FarmerProfile, Farm, FarmField) if they do not already exist.
    Does not drop or delete existing data.
    """
    global engine
    _get_or_create_engine()
    if engine is None:
        return False, "Database engine not initialized"
    try:
        from app.database.base import Base
        import app.database.models  # noqa: F401 - ensures models are registered
        Base.metadata.create_all(bind=engine)
        return True, "Tables verified/created successfully"
    except Exception as exc:
        return False, f"Failed to create tables: {type(exc).__name__}: {str(exc)}"

_db_status_checked = False
_db_is_available = False

def get_db() -> Generator[Optional[Session], None, None]:
    """FastAPI dependency for database sessions. Returns None if DB not configured."""
    global _db_status_checked, _db_is_available
    if SessionLocal is None:
        yield None
        return

    if not _db_status_checked:
        _db_is_available, _ = check_database_connection()
        _db_status_checked = True

    if not _db_is_available:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
