import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, Text, Float, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class FarmSimulation(Base, TimestampMixin):
    __tablename__ = "farm_simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    crop_name = Column(String(100), nullable=False, index=True)
    area_acres = Column(Numeric(10, 2), nullable=False)
    
    # Granular Input Costs (Total for the farm area)
    seed_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    fertilizer_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    pesticide_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    labour_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    irrigation_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    machinery_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    other_cost = Column(Numeric(12, 2), default=0.0, nullable=False)
    
    # Production & Market Price
    expected_yield_per_acre = Column(Numeric(10, 2), nullable=False)  # in quintals
    expected_selling_price_per_qtl = Column(Numeric(12, 2), nullable=False)  # in ₹
    
    # Computed Economic Metrics
    total_expenses = Column(Numeric(12, 2), nullable=False)
    total_revenue = Column(Numeric(12, 2), nullable=False)
    net_profit = Column(Numeric(12, 2), nullable=False)
    profit_per_acre = Column(Numeric(12, 2), nullable=False)
    roi_percentage = Column(Float, nullable=False)
    breakeven_yield_per_acre = Column(Numeric(10, 2), nullable=True)
    breakeven_price_per_qtl = Column(Numeric(12, 2), nullable=True)
    
    comparison_crops = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    farm = relationship("Farm", foreign_keys=[farm_id], lazy="joined")
