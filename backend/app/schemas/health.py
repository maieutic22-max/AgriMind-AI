from datetime import datetime, timezone
from typing import Dict, Any
from pydantic import BaseModel, Field

class DatabaseHealth(BaseModel):
    status: str = Field(..., description="'connected' or 'disconnected / pending'")
    message: str = Field(..., description="Diagnostic details on database status")

class HealthResponse(BaseModel):
    status: str = Field("healthy", description="Overall API service health")
    service: str = Field("AgriMind AI API", description="Service identity")
    version: str = Field("1.0.0", description="API semver")
    database: DatabaseHealth
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
