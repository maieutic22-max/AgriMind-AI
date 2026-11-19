from fastapi import APIRouter
from app.schemas.system import SystemInfoResponse, ModuleInfo
from app.core.config import settings

router = APIRouter(tags=["System"])

@router.get("/system/info", response_model=SystemInfoResponse, summary="System & Architecture Information")
def get_system_info():
    """
    Returns platform architecture, active modules, and implementation scope.
    """
    modules = [
        ModuleInfo(
            id="module_1",
            name="Digital Twin, Simulation & Farm Interface",
            lead_member="Member 1",
            deliverables_count=10,
            status="Foundation Initialized"
        ),
        ModuleInfo(
            id="module_2",
            name="Crop, Soil & Agricultural Intelligence",
            lead_member="Member 2",
            deliverables_count=8,
            status="Architecture Specified"
        ),
        ModuleInfo(
            id="module_3",
            name="Farm Business & Operations",
            lead_member="Member 3",
            deliverables_count=8,
            status="Architecture Specified"
        ),
        ModuleInfo(
            id="module_4",
            name="AI Assistant & Farmer Services",
            lead_member="Member 4",
            deliverables_count=8,
            status="Architecture Specified"
        )
    ]
    
    return SystemInfoResponse(
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        architecture="Decoupled Multi-Tier (FastAPI + React + Three.js + PostgreSQL)",
        core_capabilities_count=26,
        implementation_deliverables_count=34,
        modules=modules
    )
