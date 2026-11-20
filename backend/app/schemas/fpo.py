from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field


# --------------------------------------------------------------------------
# FPO Organization Schemas
# --------------------------------------------------------------------------
class FPOCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200, description="FPO legal registered name")
    registration_number: str = Field(..., min_length=3, max_length=100, description="CIN / Co-operative Society Reg No")
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    pin_code: Optional[str] = Field(None, max_length=10)
    primary_crops: str = Field(..., min_length=2, max_length=255, description="Comma-separated primary crops")
    contact_person: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[str] = None
    description: Optional[str] = None


class FPOResponse(BaseModel):
    id: str
    name: str
    registration_number: str
    state: str
    district: str
    pin_code: Optional[str] = None
    primary_crops: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    total_members_count: Optional[int] = 0
    total_pooled_quintals: Optional[float] = 0.0
    total_sales_realized: Optional[float] = 0.0


# --------------------------------------------------------------------------
# Membership Schemas
# --------------------------------------------------------------------------
class FPOMemberApply(BaseModel):
    farmer_name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    village: str = Field(..., min_length=2, max_length=150)
    district: str = Field(..., min_length=2, max_length=100)
    land_acres: float = Field(..., gt=0, description="Cultivated landholding in acres")
    primary_crops: str = Field(..., min_length=2, max_length=255)


class FPOMemberStatusUpdate(BaseModel):
    status: str = Field(..., description="APPROVED or REJECTED")
    rejection_reason: Optional[str] = None


class FPOMemberResponse(BaseModel):
    id: str
    fpo_id: str
    farmer_name: str
    phone: str
    village: str
    district: str
    land_acres: float
    primary_crops: str
    status: str  # PENDING, APPROVED, REJECTED
    applied_date: Optional[str] = None
    approved_date: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: Optional[str] = None


# --------------------------------------------------------------------------
# Individual Farmer Produce Listing Schemas
# --------------------------------------------------------------------------
class ProduceListingCreate(BaseModel):
    member_id: Optional[str] = None
    farmer_name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    crop_name: str = Field(..., min_length=2, max_length=100)
    variety: str = Field(default="Standard", max_length=100)
    quantity_quintals: float = Field(..., gt=0, description="Available harvest in quintals")
    asking_price_per_qtl: float = Field(..., gt=0, description="Target price per quintal in ₹")
    quality_grade: str = Field(default="Grade A", max_length=20)
    harvest_date: Optional[str] = None


class ProduceListingResponse(BaseModel):
    id: str
    fpo_id: str
    member_id: Optional[str] = None
    farmer_name: str
    phone: str
    crop_name: str
    variety: str
    quantity_quintals: float
    asking_price_per_qtl: float
    quality_grade: str
    harvest_date: Optional[str] = None
    status: str  # AVAILABLE, POOLED, SOLD
    pooled_lot_id: Optional[str] = None
    created_at: Optional[str] = None


# --------------------------------------------------------------------------
# Collective Lot Schemas
# --------------------------------------------------------------------------
class PoolProduceRequest(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=100)
    variety: Optional[str] = "Standard Grade"
    quality_grade: Optional[str] = "Grade A"
    listing_ids: List[str] = Field(..., min_length=1, description="List of individual produce listing IDs to combine")
    custom_lot_code: Optional[str] = None
    notes: Optional[str] = None


class CollectiveLotResponse(BaseModel):
    id: str
    fpo_id: str
    lot_code: str
    crop_name: str
    variety: str
    quality_grade: str
    total_quantity_quintals: float
    weighted_avg_asking_price: float
    contributing_farmers_count: int
    status: str  # OPEN_FOR_BIDS, OFFER_RECEIVED, DEAL_ACCEPTED, COMPLETED
    notes: Optional[str] = None
    created_at: Optional[str] = None
    highest_offer_price: Optional[float] = None
    total_offers_count: Optional[int] = 0


# --------------------------------------------------------------------------
# Buyer Offers Schemas
# --------------------------------------------------------------------------
class BuyerOfferCreate(BaseModel):
    buyer_name: str = Field(..., min_length=2, max_length=150, description="Corporate buyer, processor, or aggregator")
    contact_person: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    offered_price_per_qtl: float = Field(..., gt=0, description="Offered bid price per quintal in ₹")
    quantity_quintals: float = Field(..., gt=0, description="Required quantity in quintals")
    validity_days: int = Field(default=7, ge=1, le=60)
    payment_terms: Optional[str] = "Immediate e-NAM / Bank Transfer upon weighment"
    notes: Optional[str] = None


class BuyerOfferStatusUpdate(BaseModel):
    status: str = Field(..., description="ACCEPTED or REJECTED")


class BuyerOfferResponse(BaseModel):
    id: str
    lot_id: str
    buyer_name: str
    contact_person: str
    phone: str
    offered_price_per_qtl: float
    quantity_quintals: float
    status: str  # PENDING, ACCEPTED, REJECTED
    offer_date: Optional[str] = None
    validity_days: int
    payment_terms: str
    notes: Optional[str] = None
    created_at: Optional[str] = None


# --------------------------------------------------------------------------
# Collective Transaction & Dashboard Schemas
# --------------------------------------------------------------------------
class CollectiveTransactionResponse(BaseModel):
    id: str
    fpo_id: str
    lot_id: str
    offer_id: Optional[str] = None
    buyer_name: str
    crop_name: str
    quantity_quintals: float
    agreed_price_per_qtl: float
    total_transaction_value: float
    contributing_farmers_count: int
    transaction_date: Optional[str] = None
    settlement_status: str
    created_at: Optional[str] = None


class FPODashboardSummary(BaseModel):
    fpo_id: str
    fpo_name: str
    total_approved_members: int
    pending_membership_requests: int
    total_available_produce_quintals: float
    total_pooled_produce_quintals: float
    active_collective_lots_count: int
    pending_buyer_offers_count: int
    total_completed_sales_value: float
    total_sales_volume_quintals: float
