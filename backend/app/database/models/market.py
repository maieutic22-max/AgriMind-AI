import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin


class MandiPriceRecord(Base, TimestampMixin):
    """
    Official Agricultural Produce Market Committee (APMC) Mandi Price Record.
    Aligned with AGMARKNET (agmarknet.gov.in) and data.gov.in standard schemas.
    """
    __tablename__ = "mandi_price_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    commodity = Column(String(100), nullable=False, index=True)  # Maize, Paddy, Wheat, Tomato, Onion, Soybean
    variety = Column(String(100), nullable=False, default="Local / Hybrid")
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    market = Column(String(150), nullable=False, index=True)  # e.g. Nashik APMC, Lasalgaon APMC
    
    # Official price benchmarks in ₹ / Quintal
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)  # Most frequent prevailing price
    
    arrival_tonnes = Column(Float, default=0.0)  # Daily traded volume in Metric Tonnes
    price_date = Column(Date, nullable=False, default=date.today)
    
    source = Column(String(200), default="AGMARKNET / Directorate of Marketing & Inspection (DMI)")
    data_status = Column(String(50), default="verified_agmarknet")  # verified_agmarknet, delayed, unavailable
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "commodity": self.commodity,
            "variety": self.variety,
            "state": self.state,
            "district": self.district,
            "market": self.market,
            "min_price": self.min_price,
            "max_price": self.max_price,
            "modal_price": self.modal_price,
            "arrival_tonnes": self.arrival_tonnes,
            "price_date": self.price_date.isoformat() if self.price_date else None,
            "source": self.source,
            "data_status": self.data_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
