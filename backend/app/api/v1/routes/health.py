from fastapi import APIRouter
from app.schemas.health import HealthResponse, DatabaseHealth
from app.database.connection import check_database_connection
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse, summary="System Health & Database Probe")
def get_health():
    """
    Returns system liveness, API version, and live probe of the PostgreSQL database connection.
    Does not crash if PostgreSQL is disconnected or pending configuration.
    """
    is_db_connected, db_msg = check_database_connection()
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        database=DatabaseHealth(
            status="connected" if is_db_connected else "disconnected",
            message=db_msg
        )
    )
