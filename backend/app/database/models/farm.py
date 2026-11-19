import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Farm(Base, TimestampMixin):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    total_acres = Column(Numeric(10, 2), nullable=False)
    boundary_geojson = Column(JSON, nullable=True)

    owner = relationship("User", back_populates="farms")
    fields = relationship("FarmField", back_populates="farm", cascade="all, delete-orphan")

class FarmField(Base, TimestampMixin):
    __tablename__ = "farm_fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    area_acres = Column(Numeric(10, 2), nullable=False)
    soil_type = Column(String(100), nullable=True)
    polygon_coords = Column(JSON, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)

    farm = relationship("Farm", back_populates="fields")
