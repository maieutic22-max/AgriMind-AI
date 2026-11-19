from typing import List, Dict
from pydantic import BaseModel, Field

class ModuleInfo(BaseModel):
    id: str
    name: str
    lead_member: str
    deliverables_count: int
    status: str

class SystemInfoResponse(BaseModel):
    service: str = "AgriMind AI Platform"
    version: str = "1.0.0"
    environment: str
    architecture: str = "Decoupled Multi-Tier (FastAPI + React + Three.js + PostgreSQL)"
    core_capabilities_count: int = 26
    implementation_deliverables_count: int = 34
    modules: List[ModuleInfo]
