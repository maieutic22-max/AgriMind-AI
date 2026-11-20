import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin


class FPO(Base, TimestampMixin):
    """
    Farmer Producer Organization (FPO) / Farmer Producer Company (FPC).
    """
    __tablename__ = "fpos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(200), nullable=False, index=True)
    registration_number = Column(String(100), nullable=False, unique=True, index=True)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    pin_code = Column(String(10), nullable=True)
    primary_crops = Column(String(255), nullable=False)  # e.g. "Maize, Soybean, Tomato"
    contact_person = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "registration_number": self.registration_number,
            "state": self.state,
            "district": self.district,
            "pin_code": self.pin_code,
            "primary_crops": self.primary_crops,
            "contact_person": self.contact_person,
            "phone": self.phone,
            "email": self.email,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class FPOMember(Base, TimestampMixin):
    """
    Registered or applicant member farmer of an FPO.
    """
    __tablename__ = "fpo_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    fpo_id = Column(UUID(as_uuid=True), ForeignKey("fpos.id", ondelete="CASCADE"), nullable=False, index=True)
    farmer_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    village = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False)
    land_acres = Column(Float, nullable=False, default=1.0)
    primary_crops = Column(String(255), nullable=False)
    
    # Status: PENDING, APPROVED, REJECTED
    status = Column(String(30), nullable=False, default="PENDING", index=True)
    applied_date = Column(Date, default=date.today)
    approved_date = Column(Date, nullable=True)
    rejection_reason = Column(String(255), nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "fpo_id": str(self.fpo_id),
            "farmer_name": self.farmer_name,
            "phone": self.phone,
            "village": self.village,
            "district": self.district,
            "land_acres": self.land_acres,
            "primary_crops": self.primary_crops,
            "status": self.status,
            "applied_date": self.applied_date.isoformat() if self.applied_date else None,
            "approved_date": self.approved_date.isoformat() if self.approved_date else None,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CollectiveProduceLot(Base, TimestampMixin):
    """
    Aggregated / Combined produce lot combining quantities from multiple farmers.
    """
    __tablename__ = "collective_produce_lots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    fpo_id = Column(UUID(as_uuid=True), ForeignKey("fpos.id", ondelete="CASCADE"), nullable=False, index=True)
    lot_code = Column(String(50), nullable=False, unique=True, index=True)  # e.g. "LOT-MAIZE-2026-01"
    crop_name = Column(String(100), nullable=False, index=True)
    variety = Column(String(100), default="Standard Grade")
    quality_grade = Column(String(10), default="Grade A")
    
    total_quantity_quintals = Column(Float, nullable=False, default=0.0)
    weighted_avg_asking_price = Column(Float, nullable=False, default=0.0)  # ₹ / quintal
    contributing_farmers_count = Column(Integer, default=1)
    
    # Status: OPEN_FOR_BIDS, OFFER_RECEIVED, DEAL_ACCEPTED, COMPLETED
    status = Column(String(50), nullable=False, default="OPEN_FOR_BIDS", index=True)
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "fpo_id": str(self.fpo_id),
            "lot_code": self.lot_code,
            "crop_name": self.crop_name,
            "variety": self.variety,
            "quality_grade": self.quality_grade,
            "total_quantity_quintals": self.total_quantity_quintals,
            "weighted_avg_asking_price": self.weighted_avg_asking_price,
            "contributing_farmers_count": self.contributing_farmers_count,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class FarmerProduceListing(Base, TimestampMixin):
    """
    Individual produce lot contributed by an approved farmer member.
    """
    __tablename__ = "farmer_produce_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    fpo_id = Column(UUID(as_uuid=True), ForeignKey("fpos.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(UUID(as_uuid=True), ForeignKey("fpo_members.id", ondelete="CASCADE"), nullable=True, index=True)
    farmer_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    crop_name = Column(String(100), nullable=False, index=True)
    variety = Column(String(100), default="Standard")
    quantity_quintals = Column(Float, nullable=False)
    asking_price_per_qtl = Column(Float, nullable=False)
    quality_grade = Column(String(20), default="Grade A")
    harvest_date = Column(Date, default=date.today)
    
    # Status: AVAILABLE, POOLED, SOLD
    status = Column(String(30), default="AVAILABLE", index=True)
    pooled_lot_id = Column(UUID(as_uuid=True), ForeignKey("collective_produce_lots.id", ondelete="SET NULL"), nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "fpo_id": str(self.fpo_id),
            "member_id": str(self.member_id) if self.member_id else None,
            "farmer_name": self.farmer_name,
            "phone": self.phone,
            "crop_name": self.crop_name,
            "variety": self.variety,
            "quantity_quintals": self.quantity_quintals,
            "asking_price_per_qtl": self.asking_price_per_qtl,
            "quality_grade": self.quality_grade,
            "harvest_date": self.harvest_date.isoformat() if self.harvest_date else None,
            "status": self.status,
            "pooled_lot_id": str(self.pooled_lot_id) if self.pooled_lot_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class BuyerOffer(Base, TimestampMixin):
    """
    Purchase offer submitted by an institutional buyer / corporate aggregator on a collective lot.
    """
    __tablename__ = "buyer_offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    lot_id = Column(UUID(as_uuid=True), ForeignKey("collective_produce_lots.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_name = Column(String(150), nullable=False)
    contact_person = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    offered_price_per_qtl = Column(Float, nullable=False)  # ₹ / quintal
    quantity_quintals = Column(Float, nullable=False)
    
    # Status: PENDING, ACCEPTED, REJECTED
    status = Column(String(30), default="PENDING", index=True)
    offer_date = Column(Date, default=date.today)
    validity_days = Column(Integer, default=7)
    payment_terms = Column(String(100), default="Immediate e-NAM / Bank Transfer upon weighment")
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "lot_id": str(self.lot_id),
            "buyer_name": self.buyer_name,
            "contact_person": self.contact_person,
            "phone": self.phone,
            "offered_price_per_qtl": self.offered_price_per_qtl,
            "quantity_quintals": self.quantity_quintals,
            "status": self.status,
            "offer_date": self.offer_date.isoformat() if self.offer_date else None,
            "validity_days": self.validity_days,
            "payment_terms": self.payment_terms,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CollectiveTransaction(Base, TimestampMixin):
    """
    Completed collective selling deal and revenue distribution.
    """
    __tablename__ = "collective_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    fpo_id = Column(UUID(as_uuid=True), ForeignKey("fpos.id", ondelete="CASCADE"), nullable=False, index=True)
    lot_id = Column(UUID(as_uuid=True), ForeignKey("collective_produce_lots.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("buyer_offers.id", ondelete="CASCADE"), nullable=True)
    
    buyer_name = Column(String(150), nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    agreed_price_per_qtl = Column(Float, nullable=False)
    total_transaction_value = Column(Float, nullable=False)  # quantity * agreed_price
    
    contributing_farmers_count = Column(Integer, default=1)
    transaction_date = Column(Date, default=date.today)
    settlement_status = Column(String(50), default="SETTLED_TO_FARMERS")  # PENDING_DISBURSEMENT, SETTLED_TO_FARMERS

    def to_dict(self):
        return {
            "id": str(self.id),
            "fpo_id": str(self.fpo_id),
            "lot_id": str(self.lot_id),
            "offer_id": str(self.offer_id) if self.offer_id else None,
            "buyer_name": self.buyer_name,
            "crop_name": self.crop_name,
            "quantity_quintals": self.quantity_quintals,
            "agreed_price_per_qtl": self.agreed_price_per_qtl,
            "total_transaction_value": self.total_transaction_value,
            "contributing_farmers_count": self.contributing_farmers_count,
            "transaction_date": self.transaction_date.isoformat() if self.transaction_date else None,
            "settlement_status": self.settlement_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
