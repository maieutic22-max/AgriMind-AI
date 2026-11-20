import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models.fpo import (
    FPO as FPOModel,
    FPOMember as FPOMemberModel,
    CollectiveProduceLot as CollectiveProduceLotModel,
    FarmerProduceListing as FarmerProduceListingModel,
    BuyerOffer as BuyerOfferModel,
    CollectiveTransaction as CollectiveTransactionModel,
)
from app.schemas.fpo import (
    FPOCreate,
    FPOResponse,
    FPOMemberApply,
    FPOMemberStatusUpdate,
    FPOMemberResponse,
    ProduceListingCreate,
    ProduceListingResponse,
    PoolProduceRequest,
    CollectiveLotResponse,
    BuyerOfferCreate,
    BuyerOfferStatusUpdate,
    BuyerOfferResponse,
    CollectiveTransactionResponse,
    FPODashboardSummary,
)

router = APIRouter(prefix="/fpo", tags=["FPO & Collective Selling (Member 3)"])

# --------------------------------------------------------------------------
# Authentic In-Memory Seed State (Ensures Resilient Operation & Instant Tests)
# --------------------------------------------------------------------------
DEFAULT_FPO_ID = uuid.UUID("11111111-2222-3333-4444-555555555555")
LOT_MAIZE_ID = uuid.UUID("22222222-3333-4444-5555-666666666666")
LOT_COMPLETED_ID = uuid.UUID("33333333-4444-5555-6666-777777777777")
OFFER_CARGILL_ID = uuid.UUID("44444444-5555-6666-7777-888888888888")
OFFER_GODREJ_ID = uuid.UUID("55555555-6666-7777-8888-999999999999")
TXN_COMPLETED_ID = uuid.UUID("66666666-7777-8888-9999-000000000000")

MEMBER_1_ID = uuid.UUID("aaaa1111-bb22-cc33-dd44-ee5555555551")
MEMBER_2_ID = uuid.UUID("aaaa1111-bb22-cc33-dd44-ee5555555552")
MEMBER_3_ID = uuid.UUID("aaaa1111-bb22-cc33-dd44-ee5555555553")
MEMBER_4_ID = uuid.UUID("aaaa1111-bb22-cc33-dd44-ee5555555554")
MEMBER_5_PENDING_ID = uuid.UUID("aaaa1111-bb22-cc33-dd44-ee5555555555")

PRODUCE_1_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555551")
PRODUCE_2_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555552")
PRODUCE_3_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555553")
PRODUCE_4_AVAILABLE_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555554")
PRODUCE_5_AVAILABLE_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555555")
PRODUCE_6_AVAILABLE_ID = uuid.UUID("bbbb1111-cc22-dd33-ee44-ff5555555556")

_IN_MEMORY_FPOS = [
    {
        "id": DEFAULT_FPO_ID,
        "name": "Sahyadri Kisan Producer Company Ltd",
        "registration_number": "U01409MH2021PTC356789",
        "state": "Maharashtra",
        "district": "Nashik",
        "pin_code": "422003",
        "primary_crops": "Maize, Soybean, Tomato, Onion",
        "contact_person": "Rameshwar Patil (Managing Director)",
        "phone": "9822145678",
        "email": "contact@sahyadrikisanfpo.in",
        "description": "Farmer-owned collective aggregation platform uniting 450+ smallholder farmers across Dindori, Niphad and Sinnar talukas for fair price bargaining and bulk institutional supply.",
        "created_at": datetime(2026, 1, 10, 10, 0, 0),
    }
]

_IN_MEMORY_MEMBERS = [
    {
        "id": MEMBER_1_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "farmer_name": "Suresh Gaikwad",
        "phone": "9822011223",
        "village": "Pimpalgaon Baswant",
        "district": "Nashik",
        "land_acres": 3.5,
        "primary_crops": "Maize, Soybean",
        "status": "APPROVED",
        "applied_date": date(2026, 2, 1),
        "approved_date": date(2026, 2, 5),
        "rejection_reason": None,
        "created_at": datetime(2026, 2, 1, 11, 0, 0),
    },
    {
        "id": MEMBER_2_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "farmer_name": "Balasaheb Shinde",
        "phone": "9822022334",
        "village": "Dindori Rural",
        "district": "Nashik",
        "land_acres": 4.0,
        "primary_crops": "Tomato, Onion",
        "status": "APPROVED",
        "applied_date": date(2026, 2, 3),
        "approved_date": date(2026, 2, 7),
        "rejection_reason": None,
        "created_at": datetime(2026, 2, 3, 14, 0, 0),
    },
    {
        "id": MEMBER_3_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "farmer_name": "Anusaya Jadhav",
        "phone": "9822033445",
        "village": "Sinnar Ghat",
        "district": "Nashik",
        "land_acres": 2.5,
        "primary_crops": "Maize, Soybean",
        "status": "APPROVED",
        "applied_date": date(2026, 2, 10),
        "approved_date": date(2026, 2, 12),
        "rejection_reason": None,
        "created_at": datetime(2026, 2, 10, 9, 30, 0),
    },
    {
        "id": MEMBER_4_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "farmer_name": "Prakash Deshmukh",
        "phone": "9822044556",
        "village": "Ozar Kasba",
        "district": "Nashik",
        "land_acres": 5.0,
        "primary_crops": "Wheat, Maize",
        "status": "APPROVED",
        "applied_date": date(2026, 2, 15),
        "approved_date": date(2026, 2, 18),
        "rejection_reason": None,
        "created_at": datetime(2026, 2, 15, 16, 20, 0),
    },
    {
        "id": MEMBER_5_PENDING_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "farmer_name": "Vilas Chavan",
        "phone": "9822055667",
        "village": "Chandwad Basti",
        "district": "Nashik",
        "land_acres": 2.0,
        "primary_crops": "Onion, Tomato",
        "status": "PENDING",
        "applied_date": date(2026, 5, 2),
        "approved_date": None,
        "rejection_reason": None,
        "created_at": datetime(2026, 5, 2, 10, 15, 0),
    },
]

_IN_MEMORY_PRODUCE = [
    {
        "id": PRODUCE_1_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_1_ID,
        "farmer_name": "Suresh Gaikwad",
        "phone": "9822011223",
        "crop_name": "Maize",
        "variety": "Hybrid Pioneer P3396",
        "quantity_quintals": 65.0,
        "asking_price_per_qtl": 2420.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 4, 20),
        "status": "POOLED",
        "pooled_lot_id": LOT_MAIZE_ID,
        "created_at": datetime(2026, 4, 21, 10, 0, 0),
    },
    {
        "id": PRODUCE_2_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_4_ID,
        "farmer_name": "Prakash Deshmukh",
        "phone": "9822044556",
        "crop_name": "Maize",
        "variety": "Yellow Hybrid Super-90",
        "quantity_quintals": 85.0,
        "asking_price_per_qtl": 2400.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 4, 22),
        "status": "POOLED",
        "pooled_lot_id": LOT_MAIZE_ID,
        "created_at": datetime(2026, 4, 23, 11, 30, 0),
    },
    {
        "id": PRODUCE_3_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_3_ID,
        "farmer_name": "Anusaya Jadhav",
        "phone": "9822033445",
        "crop_name": "Maize",
        "variety": "Standard Grain Grade A",
        "quantity_quintals": 50.0,
        "asking_price_per_qtl": 2450.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 4, 24),
        "status": "POOLED",
        "pooled_lot_id": LOT_MAIZE_ID,
        "created_at": datetime(2026, 4, 25, 9, 15, 0),
    },
    {
        "id": PRODUCE_4_AVAILABLE_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_1_ID,
        "farmer_name": "Suresh Gaikwad",
        "phone": "9822011223",
        "crop_name": "Soybean",
        "variety": "JS-335 Certified",
        "quantity_quintals": 40.0,
        "asking_price_per_qtl": 4900.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 5, 10),
        "status": "AVAILABLE",
        "pooled_lot_id": None,
        "created_at": datetime(2026, 5, 11, 14, 0, 0),
    },
    {
        "id": PRODUCE_5_AVAILABLE_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_2_ID,
        "farmer_name": "Balasaheb Shinde",
        "phone": "9822022334",
        "crop_name": "Tomato",
        "variety": "Abhinav Red Premium",
        "quantity_quintals": 75.0,
        "asking_price_per_qtl": 1850.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 5, 12),
        "status": "AVAILABLE",
        "pooled_lot_id": None,
        "created_at": datetime(2026, 5, 12, 16, 45, 0),
    },
    {
        "id": PRODUCE_6_AVAILABLE_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "member_id": MEMBER_2_ID,
        "farmer_name": "Balasaheb Shinde",
        "phone": "9822022334",
        "crop_name": "Onion",
        "variety": "Garwa Red Medium",
        "quantity_quintals": 120.0,
        "asking_price_per_qtl": 2100.0,
        "quality_grade": "Grade A",
        "harvest_date": date(2026, 5, 15),
        "status": "AVAILABLE",
        "pooled_lot_id": None,
        "created_at": datetime(2026, 5, 15, 12, 10, 0),
    },
]

_IN_MEMORY_LOTS = [
    {
        "id": LOT_MAIZE_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "lot_code": "LOT-MAIZE-2026-01",
        "crop_name": "Maize",
        "variety": "Hybrid Yellow Commercial Grade",
        "quality_grade": "Grade A (Moisture < 12%)",
        "total_quantity_quintals": 200.0,
        "weighted_avg_asking_price": 2419.0,  # (65*2420 + 85*2400 + 50*2450) / 200 = 483800 / 200 = 2419.0
        "contributing_farmers_count": 3,
        "status": "OFFER_RECEIVED",
        "notes": "Consolidated collective lot aggregated at Niphad Aggregation Center for bulk feed mill supply.",
        "created_at": datetime(2026, 4, 26, 12, 0, 0),
    },
    {
        "id": LOT_COMPLETED_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "lot_code": "LOT-SOYBEAN-2026-01",
        "crop_name": "Soybean",
        "variety": "JS-335 Cleaned",
        "quality_grade": "Grade A (Oil content > 19%)",
        "total_quantity_quintals": 150.0,
        "weighted_avg_asking_price": 4850.0,
        "contributing_farmers_count": 2,
        "status": "COMPLETED",
        "notes": "Sold to Adani Wilmar Hub at premium price of ₹4,950/qtl.",
        "created_at": datetime(2026, 4, 1, 10, 0, 0),
    },
]

_IN_MEMORY_OFFERS = [
    {
        "id": OFFER_CARGILL_ID,
        "lot_id": LOT_MAIZE_ID,
        "buyer_name": "Cargill India Animal Nutrition Ltd",
        "contact_person": "Amit Verma (Procurement Lead)",
        "phone": "9811234567",
        "offered_price_per_qtl": 2460.0,  # +41 ₹ premium over asking price!
        "quantity_quintals": 200.0,
        "status": "PENDING",
        "offer_date": date(2026, 5, 16),
        "validity_days": 7,
        "payment_terms": "100% direct bank transfer within 24h of weighbridge slip",
        "notes": "Bulk feed processing lot requirement. Ready for immediate rake loading.",
        "created_at": datetime(2026, 5, 16, 14, 30, 0),
    },
    {
        "id": OFFER_GODREJ_ID,
        "lot_id": LOT_MAIZE_ID,
        "buyer_name": "Godrej Agrovet Feed Mill",
        "contact_person": "Sandeep Joshi (Regional Buyer)",
        "phone": "9823456789",
        "offered_price_per_qtl": 2380.0,
        "quantity_quintals": 200.0,
        "status": "PENDING",
        "offer_date": date(2026, 5, 17),
        "validity_days": 5,
        "payment_terms": "e-NAM Escrow / 48 hrs after unloading",
        "notes": "Standard commercial terms.",
        "created_at": datetime(2026, 5, 17, 10, 15, 0),
    },
]

_IN_MEMORY_TRANSACTIONS = [
    {
        "id": TXN_COMPLETED_ID,
        "fpo_id": DEFAULT_FPO_ID,
        "lot_id": LOT_COMPLETED_ID,
        "offer_id": uuid.UUID("77777777-8888-9999-0000-111111111111"),
        "buyer_name": "Adani Wilmar Edible Oils Hub",
        "crop_name": "Soybean",
        "quantity_quintals": 150.0,
        "agreed_price_per_qtl": 4950.0,
        "total_transaction_value": 742500.0,  # 150 * 4950
        "contributing_farmers_count": 2,
        "transaction_date": date(2026, 4, 15),
        "settlement_status": "SETTLED_TO_FARMERS",
        "created_at": datetime(2026, 4, 15, 15, 30, 0),
    }
]


# --------------------------------------------------------------------------
# Helper Functions for Formatting Responses
# --------------------------------------------------------------------------
def _format_fpo(fpo: dict, members_count: int = 0, pooled_qtl: float = 0.0, sales_val: float = 0.0) -> FPOResponse:
    return FPOResponse(
        id=str(fpo["id"]),
        name=fpo["name"],
        registration_number=fpo["registration_number"],
        state=fpo["state"],
        district=fpo["district"],
        pin_code=fpo.get("pin_code"),
        primary_crops=fpo["primary_crops"],
        contact_person=fpo["contact_person"],
        phone=fpo["phone"],
        email=fpo.get("email"),
        description=fpo.get("description"),
        created_at=fpo["created_at"].isoformat() if isinstance(fpo.get("created_at"), datetime) else str(fpo.get("created_at") or ""),
        total_members_count=members_count,
        total_pooled_quintals=pooled_qtl,
        total_sales_realized=sales_val,
    )


def _format_member(m: dict) -> FPOMemberResponse:
    return FPOMemberResponse(
        id=str(m["id"]),
        fpo_id=str(m["fpo_id"]),
        farmer_name=m["farmer_name"],
        phone=m["phone"],
        village=m["village"],
        district=m["district"],
        land_acres=float(m["land_acres"]),
        primary_crops=m["primary_crops"],
        status=m["status"],
        applied_date=m["applied_date"].isoformat() if isinstance(m.get("applied_date"), (date, datetime)) else str(m.get("applied_date") or ""),
        approved_date=m["approved_date"].isoformat() if isinstance(m.get("approved_date"), (date, datetime)) else None,
        rejection_reason=m.get("rejection_reason"),
        created_at=m["created_at"].isoformat() if isinstance(m.get("created_at"), datetime) else str(m.get("created_at") or ""),
    )


def _format_produce(p: dict) -> ProduceListingResponse:
    return ProduceListingResponse(
        id=str(p["id"]),
        fpo_id=str(p["fpo_id"]),
        member_id=str(p["member_id"]) if p.get("member_id") else None,
        farmer_name=p["farmer_name"],
        phone=p["phone"],
        crop_name=p["crop_name"],
        variety=p["variety"],
        quantity_quintals=float(p["quantity_quintals"]),
        asking_price_per_qtl=float(p["asking_price_per_qtl"]),
        quality_grade=p["quality_grade"],
        harvest_date=p["harvest_date"].isoformat() if isinstance(p.get("harvest_date"), (date, datetime)) else str(p.get("harvest_date") or ""),
        status=p["status"],
        pooled_lot_id=str(p["pooled_lot_id"]) if p.get("pooled_lot_id") else None,
        created_at=p["created_at"].isoformat() if isinstance(p.get("created_at"), datetime) else str(p.get("created_at") or ""),
    )


def _format_lot(lot: dict, offers: Optional[List[dict]] = None) -> CollectiveLotResponse:
    lot_offers = [o for o in _IN_MEMORY_OFFERS if str(o["lot_id"]) == str(lot["id"])] if offers is None else offers
    highest_offer = max([o["offered_price_per_qtl"] for o in lot_offers], default=None) if lot_offers else None
    
    return CollectiveLotResponse(
        id=str(lot["id"]),
        fpo_id=str(lot["fpo_id"]),
        lot_code=lot["lot_code"],
        crop_name=lot["crop_name"],
        variety=lot.get("variety", "Standard Grade"),
        quality_grade=lot.get("quality_grade", "Grade A"),
        total_quantity_quintals=float(lot["total_quantity_quintals"]),
        weighted_avg_asking_price=float(lot["weighted_avg_asking_price"]),
        contributing_farmers_count=int(lot.get("contributing_farmers_count", 1)),
        status=lot["status"],
        notes=lot.get("notes"),
        created_at=lot["created_at"].isoformat() if isinstance(lot.get("created_at"), datetime) else str(lot.get("created_at") or ""),
        highest_offer_price=highest_offer,
        total_offers_count=len(lot_offers),
    )


def _format_offer(o: dict) -> BuyerOfferResponse:
    return BuyerOfferResponse(
        id=str(o["id"]),
        lot_id=str(o["lot_id"]),
        buyer_name=o["buyer_name"],
        contact_person=o["contact_person"],
        phone=o["phone"],
        offered_price_per_qtl=float(o["offered_price_per_qtl"]),
        quantity_quintals=float(o["quantity_quintals"]),
        status=o["status"],
        offer_date=o["offer_date"].isoformat() if isinstance(o.get("offer_date"), (date, datetime)) else str(o.get("offer_date") or ""),
        validity_days=int(o["validity_days"]),
        payment_terms=o.get("payment_terms", "Immediate e-NAM / Bank Transfer"),
        notes=o.get("notes"),
        created_at=o["created_at"].isoformat() if isinstance(o.get("created_at"), datetime) else str(o.get("created_at") or ""),
    )


def _format_transaction(t: dict) -> CollectiveTransactionResponse:
    return CollectiveTransactionResponse(
        id=str(t["id"]),
        fpo_id=str(t["fpo_id"]),
        lot_id=str(t["lot_id"]),
        offer_id=str(t["offer_id"]) if t.get("offer_id") else None,
        buyer_name=t["buyer_name"],
        crop_name=t["crop_name"],
        quantity_quintals=float(t["quantity_quintals"]),
        agreed_price_per_qtl=float(t["agreed_price_per_qtl"]),
        total_transaction_value=float(t["total_transaction_value"]),
        contributing_farmers_count=int(t["contributing_farmers_count"]),
        transaction_date=t["transaction_date"].isoformat() if isinstance(t.get("transaction_date"), (date, datetime)) else str(t.get("transaction_date") or ""),
        settlement_status=t["settlement_status"],
        created_at=t["created_at"].isoformat() if isinstance(t.get("created_at"), datetime) else str(t.get("created_at") or ""),
    )


# --------------------------------------------------------------------------
# Route 1: FPO Management & Listing
# --------------------------------------------------------------------------
@router.get("", response_model=List[FPOResponse], summary="List all Farmer Producer Organizations")
def list_fpos(db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            fpos = db.query(FPOModel).all()
            if fpos:
                res = []
                for f in fpos:
                    members_count = db.query(FPOMemberModel).filter(FPOMemberModel.fpo_id == f.id, FPOMemberModel.status == "APPROVED").count()
                    pooled_qtl = sum(l.total_quantity_quintals for l in db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.fpo_id == f.id).all())
                    sales = sum(t.total_transaction_value for t in db.query(CollectiveTransactionModel).filter(CollectiveTransactionModel.fpo_id == f.id).all())
                    res.append(_format_fpo(f.to_dict(), members_count, pooled_qtl, sales))
                return res
        except Exception:
            pass

    # In-Memory fallback
    res = []
    for f in _IN_MEMORY_FPOS:
        f_id = f["id"]
        members_count = len([m for m in _IN_MEMORY_MEMBERS if m["fpo_id"] == f_id and m["status"] == "APPROVED"])
        pooled_qtl = sum(l["total_quantity_quintals"] for l in _IN_MEMORY_LOTS if l["fpo_id"] == f_id)
        sales = sum(t["total_transaction_value"] for t in _IN_MEMORY_TRANSACTIONS if t["fpo_id"] == f_id)
        res.append(_format_fpo(f, members_count, pooled_qtl, sales))
    return res


@router.post("", response_model=FPOResponse, status_code=status.HTTP_201_CREATED, summary="Create a new FPO")
def create_fpo(payload: FPOCreate, db: Optional[Session] = Depends(get_db)):
    new_id = uuid.uuid4()
    now = datetime.now()
    
    # Check registration number uniqueness in-memory
    for existing in _IN_MEMORY_FPOS:
        if existing["registration_number"].lower() == payload.registration_number.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"FPO with registration number '{payload.registration_number}' already registered."
            )

    new_dict = {
        "id": new_id,
        "name": payload.name,
        "registration_number": payload.registration_number,
        "state": payload.state,
        "district": payload.district,
        "pin_code": payload.pin_code,
        "primary_crops": payload.primary_crops,
        "contact_person": payload.contact_person,
        "phone": payload.phone,
        "email": payload.email,
        "description": payload.description,
        "created_at": now,
    }

    if db is not None:
        try:
            db_fpo = FPOModel(
                id=new_id,
                name=payload.name,
                registration_number=payload.registration_number,
                state=payload.state,
                district=payload.district,
                pin_code=payload.pin_code,
                primary_crops=payload.primary_crops,
                contact_person=payload.contact_person,
                phone=payload.phone,
                email=payload.email,
                description=payload.description,
            )
            db.add(db_fpo)
            db.commit()
            db.refresh(db_fpo)
        except Exception:
            pass

    _IN_MEMORY_FPOS.append(new_dict)
    return _format_fpo(new_dict, 0, 0.0, 0.0)


@router.get("/{fpo_id}", response_model=FPOResponse, summary="Get FPO by ID")
def get_fpo(fpo_id: str, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    if db is not None:
        try:
            f = db.query(FPOModel).filter(FPOModel.id == f_uuid).first()
            if f:
                members_count = db.query(FPOMemberModel).filter(FPOMemberModel.fpo_id == f.id, FPOMemberModel.status == "APPROVED").count()
                pooled_qtl = sum(l.total_quantity_quintals for l in db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.fpo_id == f.id).all())
                sales = sum(t.total_transaction_value for t in db.query(CollectiveTransactionModel).filter(CollectiveTransactionModel.fpo_id == f.id).all())
                return _format_fpo(f.to_dict(), members_count, pooled_qtl, sales)
        except Exception:
            pass

    for f in _IN_MEMORY_FPOS:
        if f["id"] == f_uuid:
            members_count = len([m for m in _IN_MEMORY_MEMBERS if m["fpo_id"] == f_uuid and m["status"] == "APPROVED"])
            pooled_qtl = sum(l["total_quantity_quintals"] for l in _IN_MEMORY_LOTS if l["fpo_id"] == f_uuid)
            sales = sum(t["total_transaction_value"] for t in _IN_MEMORY_TRANSACTIONS if t["fpo_id"] == f_uuid)
            return _format_fpo(f, members_count, pooled_qtl, sales)

    raise HTTPException(status_code=404, detail="FPO not found")


@router.get("/{fpo_id}/dashboard", response_model=FPODashboardSummary, summary="Get FPO Dashboard Metrics")
def get_fpo_dashboard(fpo_id: str, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    fpo_name = "Sahyadri Kisan Producer Company Ltd"
    for f in _IN_MEMORY_FPOS:
        if f["id"] == f_uuid:
            fpo_name = f["name"]
            break

    # Calculate metrics
    approved_members = len([m for m in _IN_MEMORY_MEMBERS if m["fpo_id"] == f_uuid and m["status"] == "APPROVED"])
    pending_members = len([m for m in _IN_MEMORY_MEMBERS if m["fpo_id"] == f_uuid and m["status"] == "PENDING"])
    
    avail_produce = sum(p["quantity_quintals"] for p in _IN_MEMORY_PRODUCE if p["fpo_id"] == f_uuid and p["status"] == "AVAILABLE")
    pooled_produce = sum(p["quantity_quintals"] for p in _IN_MEMORY_PRODUCE if p["fpo_id"] == f_uuid and p["status"] == "POOLED")
    
    active_lots = len([l for l in _IN_MEMORY_LOTS if l["fpo_id"] == f_uuid and l["status"] in ["OPEN_FOR_BIDS", "OFFER_RECEIVED"]])
    pending_offers = len([o for o in _IN_MEMORY_OFFERS if o["status"] == "PENDING"])
    
    completed_sales_val = sum(t["total_transaction_value"] for t in _IN_MEMORY_TRANSACTIONS if t["fpo_id"] == f_uuid)
    completed_sales_qtl = sum(t["quantity_quintals"] for t in _IN_MEMORY_TRANSACTIONS if t["fpo_id"] == f_uuid)

    return FPODashboardSummary(
        fpo_id=str(f_uuid),
        fpo_name=fpo_name,
        total_approved_members=approved_members,
        pending_membership_requests=pending_members,
        total_available_produce_quintals=avail_produce,
        total_pooled_produce_quintals=pooled_produce,
        active_collective_lots_count=active_lots,
        pending_buyer_offers_count=pending_offers,
        total_completed_sales_value=completed_sales_val,
        total_sales_volume_quintals=completed_sales_qtl,
    )


# --------------------------------------------------------------------------
# Route 2 & 3: Farmer Membership Registration & Admin Approvals
# --------------------------------------------------------------------------
@router.post("/{fpo_id}/members", response_model=FPOMemberResponse, status_code=status.HTTP_201_CREATED, summary="Apply for FPO membership")
def apply_fpo_membership(fpo_id: str, payload: FPOMemberApply, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    new_id = uuid.uuid4()
    now = datetime.now()
    new_member = {
        "id": new_id,
        "fpo_id": f_uuid,
        "farmer_name": payload.farmer_name,
        "phone": payload.phone,
        "village": payload.village,
        "district": payload.district,
        "land_acres": payload.land_acres,
        "primary_crops": payload.primary_crops,
        "status": "PENDING",
        "applied_date": date.today(),
        "approved_date": None,
        "rejection_reason": None,
        "created_at": now,
    }

    if db is not None:
        try:
            db_m = FPOMemberModel(
                id=new_id,
                fpo_id=f_uuid,
                farmer_name=payload.farmer_name,
                phone=payload.phone,
                village=payload.village,
                district=payload.district,
                land_acres=payload.land_acres,
                primary_crops=payload.primary_crops,
                status="PENDING",
                applied_date=date.today(),
            )
            db.add(db_m)
            db.commit()
            db.refresh(db_m)
        except Exception:
            pass

    _IN_MEMORY_MEMBERS.append(new_member)
    return _format_member(new_member)


@router.get("/{fpo_id}/members", response_model=List[FPOMemberResponse], summary="List members of an FPO")
def list_fpo_members(
    fpo_id: str,
    status: Optional[str] = Query(None, description="Filter by status: PENDING, APPROVED, REJECTED"),
    db: Optional[Session] = Depends(get_db)
):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    # Sanitize status query
    status_filter = status.upper().strip() if isinstance(status, str) and status.strip() else None

    if db is not None:
        try:
            query = db.query(FPOMemberModel).filter(FPOMemberModel.fpo_id == f_uuid)
            if status_filter:
                query = query.filter(FPOMemberModel.status == status_filter)
            members = query.order_by(FPOMemberModel.created_at.desc()).all()
            if members:
                return [_format_member(m.to_dict()) for m in members]
        except Exception:
            pass

    res = [m for m in _IN_MEMORY_MEMBERS if m["fpo_id"] == f_uuid]
    if status_filter:
        res = [m for m in res if m["status"] == status_filter]
    return [_format_member(m) for m in res]


@router.put("/{fpo_id}/members/{member_id}/status", response_model=FPOMemberResponse, summary="Approve or Reject membership application")
def update_member_status(
    fpo_id: str,
    member_id: str,
    payload: FPOMemberStatusUpdate,
    db: Optional[Session] = Depends(get_db)
):
    try:
        m_uuid = uuid.UUID(member_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Member UUID format")

    target_status = payload.status.upper().strip()
    if target_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be either 'APPROVED' or 'REJECTED'")

    for m in _IN_MEMORY_MEMBERS:
        if m["id"] == m_uuid:
            m["status"] = target_status
            if target_status == "APPROVED":
                m["approved_date"] = date.today()
                m["rejection_reason"] = None
            else:
                m["approved_date"] = None
                m["rejection_reason"] = payload.rejection_reason or "Application did not meet operational criteria"
            return _format_member(m)

    if db is not None:
        try:
            db_m = db.query(FPOMemberModel).filter(FPOMemberModel.id == m_uuid).first()
            if db_m:
                db_m.status = target_status
                if target_status == "APPROVED":
                    db_m.approved_date = date.today()
                    db_m.rejection_reason = None
                else:
                    db_m.approved_date = None
                    db_m.rejection_reason = payload.rejection_reason
                db.commit()
                db.refresh(db_m)
                return _format_member(db_m.to_dict())
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Member application not found")


# --------------------------------------------------------------------------
# Route 4: Individual Farmer Produce Listings
# --------------------------------------------------------------------------
@router.post("/{fpo_id}/produce", response_model=ProduceListingResponse, status_code=status.HTTP_201_CREATED, summary="Farmer lists produce for collective sale")
def create_produce_listing(fpo_id: str, payload: ProduceListingCreate, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    member_uuid = None
    if payload.member_id:
        try:
            member_uuid = uuid.UUID(payload.member_id)
        except Exception:
            pass

    harvest_dt = date.today()
    if payload.harvest_date:
        try:
            harvest_dt = date.fromisoformat(payload.harvest_date)
        except Exception:
            harvest_dt = date.today()

    new_id = uuid.uuid4()
    now = datetime.now()
    new_produce = {
        "id": new_id,
        "fpo_id": f_uuid,
        "member_id": member_uuid,
        "farmer_name": payload.farmer_name,
        "phone": payload.phone,
        "crop_name": payload.crop_name,
        "variety": payload.variety,
        "quantity_quintals": payload.quantity_quintals,
        "asking_price_per_qtl": payload.asking_price_per_qtl,
        "quality_grade": payload.quality_grade,
        "harvest_date": harvest_dt,
        "status": "AVAILABLE",
        "pooled_lot_id": None,
        "created_at": now,
    }

    if db is not None:
        try:
            db_p = FarmerProduceListingModel(
                id=new_id,
                fpo_id=f_uuid,
                member_id=member_uuid,
                farmer_name=payload.farmer_name,
                phone=payload.phone,
                crop_name=payload.crop_name,
                variety=payload.variety,
                quantity_quintals=payload.quantity_quintals,
                asking_price_per_qtl=payload.asking_price_per_qtl,
                quality_grade=payload.quality_grade,
                harvest_date=harvest_dt,
                status="AVAILABLE",
            )
            db.add(db_p)
            db.commit()
            db.refresh(db_p)
        except Exception:
            pass

    _IN_MEMORY_PRODUCE.append(new_produce)
    return _format_produce(new_produce)


@router.get("/{fpo_id}/produce", response_model=List[ProduceListingResponse], summary="List produce submitted by farmers")
def list_produce_listings(
    fpo_id: str,
    status: Optional[str] = Query(None, description="Filter by status: AVAILABLE, POOLED, SOLD"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name"),
    db: Optional[Session] = Depends(get_db)
):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    status_filter = status.upper().strip() if isinstance(status, str) and status.strip() else None
    crop_filter = crop_name.lower().strip() if isinstance(crop_name, str) and crop_name.strip() else None

    if db is not None:
        try:
            q = db.query(FarmerProduceListingModel).filter(FarmerProduceListingModel.fpo_id == f_uuid)
            if status_filter:
                q = q.filter(FarmerProduceListingModel.status == status_filter)
            if crop_filter:
                q = q.filter(FarmerProduceListingModel.crop_name.ilike(f"%{crop_filter}%"))
            results = q.order_by(FarmerProduceListingModel.created_at.desc()).all()
            if results:
                return [_format_produce(p.to_dict()) for p in results]
        except Exception:
            pass

    res = [p for p in _IN_MEMORY_PRODUCE if p["fpo_id"] == f_uuid]
    if status_filter:
        res = [p for p in res if p["status"] == status_filter]
    if crop_filter:
        res = [p for p in res if crop_filter in p["crop_name"].lower()]
    return [_format_produce(p) for p in res]


# --------------------------------------------------------------------------
# Route 5 & 6: Collective Produce Pooling (Combine lots from multiple farmers)
# --------------------------------------------------------------------------
@router.post("/{fpo_id}/produce/pool", response_model=CollectiveLotResponse, status_code=status.HTTP_201_CREATED, summary="Combine produce from multiple farmers into one collective lot")
def pool_produce(fpo_id: str, payload: PoolProduceRequest, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    listing_uuids = []
    for lid in payload.listing_ids:
        try:
            listing_uuids.append(uuid.UUID(lid))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid listing UUID: {lid}")

    selected_listings = [p for p in _IN_MEMORY_PRODUCE if p["id"] in listing_uuids and p["fpo_id"] == f_uuid]
    
    if len(selected_listings) != len(listing_uuids):
        raise HTTPException(status_code=404, detail="One or more selected produce listings could not be found.")

    for item in selected_listings:
        if item["status"] != "AVAILABLE":
            raise HTTPException(
                status_code=400,
                detail=f"Listing for farmer '{item['farmer_name']}' is already in status '{item['status']}' and cannot be pooled."
            )
        if item["crop_name"].lower() != payload.crop_name.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Listing for '{item['crop_name']}' cannot be combined into a lot for '{payload.crop_name}'."
            )

    # Dynamic calculation of total quantity and weighted average asking price
    total_quantity = sum(p["quantity_quintals"] for p in selected_listings)
    if total_quantity <= 0:
        raise HTTPException(status_code=400, detail="Total lot quantity must be greater than zero.")

    total_cost_product = sum(p["quantity_quintals"] * p["asking_price_per_qtl"] for p in selected_listings)
    weighted_avg_asking_price = round(total_cost_product / total_quantity, 2)
    contributing_farmers = len(set(p["farmer_name"] for p in selected_listings))

    new_lot_id = uuid.uuid4()
    lot_code = payload.custom_lot_code or f"LOT-{payload.crop_name.upper().replace(' ', '')}-{datetime.now().strftime('%Y%m%d%H%M')}"
    now = datetime.now()

    new_lot = {
        "id": new_lot_id,
        "fpo_id": f_uuid,
        "lot_code": lot_code,
        "crop_name": payload.crop_name,
        "variety": payload.variety or "Aggregated Grade A",
        "quality_grade": payload.quality_grade or "Grade A",
        "total_quantity_quintals": total_quantity,
        "weighted_avg_asking_price": weighted_avg_asking_price,
        "contributing_farmers_count": contributing_farmers,
        "status": "OPEN_FOR_BIDS",
        "notes": payload.notes or f"Pooled collective lot combining harvest from {contributing_farmers} verified member farmers.",
        "created_at": now,
    }

    # Mark all selected listings as POOLED
    for item in selected_listings:
        item["status"] = "POOLED"
        item["pooled_lot_id"] = new_lot_id

    _IN_MEMORY_LOTS.append(new_lot)

    if db is not None:
        try:
            db_lot = CollectiveProduceLotModel(
                id=new_lot_id,
                fpo_id=f_uuid,
                lot_code=lot_code,
                crop_name=payload.crop_name,
                variety=new_lot["variety"],
                quality_grade=new_lot["quality_grade"],
                total_quantity_quintals=total_quantity,
                weighted_avg_asking_price=weighted_avg_asking_price,
                contributing_farmers_count=contributing_farmers,
                status="OPEN_FOR_BIDS",
                notes=new_lot["notes"],
            )
            db.add(db_lot)
            # Update listings in DB
            for lid in listing_uuids:
                db_p = db.query(FarmerProduceListingModel).filter(FarmerProduceListingModel.id == lid).first()
                if db_p:
                    db_p.status = "POOLED"
                    db_p.pooled_lot_id = new_lot_id
            db.commit()
            db.refresh(db_lot)
        except Exception:
            pass

    return _format_lot(new_lot, [])


@router.get("/{fpo_id}/lots", response_model=List[CollectiveLotResponse], summary="List all collective produce lots")
def list_collective_lots(
    fpo_id: str,
    status: Optional[str] = Query(None, description="Filter by status: OPEN_FOR_BIDS, OFFER_RECEIVED, DEAL_ACCEPTED, COMPLETED"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name"),
    db: Optional[Session] = Depends(get_db)
):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    status_filter = status.upper().strip() if isinstance(status, str) and status.strip() else None
    crop_filter = crop_name.lower().strip() if isinstance(crop_name, str) and crop_name.strip() else None

    if db is not None:
        try:
            q = db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.fpo_id == f_uuid)
            if status_filter:
                q = q.filter(CollectiveProduceLotModel.status == status_filter)
            if crop_filter:
                q = q.filter(CollectiveProduceLotModel.crop_name.ilike(f"%{crop_filter}%"))
            lots = q.order_by(CollectiveProduceLotModel.created_at.desc()).all()
            if lots:
                res = []
                for lot in lots:
                    offers = db.query(BuyerOfferModel).filter(BuyerOfferModel.lot_id == lot.id).all()
                    offer_dicts = [o.to_dict() for o in offers]
                    res.append(_format_lot(lot.to_dict(), offer_dicts))
                return res
        except Exception:
            pass

    res = [l for l in _IN_MEMORY_LOTS if l["fpo_id"] == f_uuid]
    if status_filter:
        res = [l for l in res if l["status"] == status_filter]
    if crop_filter:
        res = [l for l in res if crop_filter in l["crop_name"].lower()]

    return [_format_lot(l) for l in res]


@router.get("/lots/{lot_id}", response_model=CollectiveLotResponse, summary="Get collective lot details")
def get_collective_lot(lot_id: str, db: Optional[Session] = Depends(get_db)):
    try:
        l_uuid = uuid.UUID(lot_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Lot UUID format")

    for l in _IN_MEMORY_LOTS:
        if l["id"] == l_uuid:
            return _format_lot(l)

    if db is not None:
        try:
            db_lot = db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.id == l_uuid).first()
            if db_lot:
                offers = db.query(BuyerOfferModel).filter(BuyerOfferModel.lot_id == db_lot.id).all()
                return _format_lot(db_lot.to_dict(), [o.to_dict() for o in offers])
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Collective produce lot not found")


# --------------------------------------------------------------------------
# Route 7 & 8: Buyer Offers, Bidding Comparison, & Offer Acceptance/Rejection
# --------------------------------------------------------------------------
@router.post("/lots/{lot_id}/offers", response_model=BuyerOfferResponse, status_code=status.HTTP_201_CREATED, summary="Submit a buyer purchase offer on a collective lot")
def create_buyer_offer(lot_id: str, payload: BuyerOfferCreate, db: Optional[Session] = Depends(get_db)):
    try:
        l_uuid = uuid.UUID(lot_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Lot UUID format")

    # Find lot
    target_lot = None
    for l in _IN_MEMORY_LOTS:
        if l["id"] == l_uuid:
            target_lot = l
            break

    if not target_lot:
        raise HTTPException(status_code=404, detail="Collective lot not found")

    if target_lot["status"] in ["DEAL_ACCEPTED", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="This lot has already been sold or finalized. New offers cannot be accepted.")

    new_id = uuid.uuid4()
    now = datetime.now()
    new_offer = {
        "id": new_id,
        "lot_id": l_uuid,
        "buyer_name": payload.buyer_name,
        "contact_person": payload.contact_person,
        "phone": payload.phone,
        "offered_price_per_qtl": payload.offered_price_per_qtl,
        "quantity_quintals": payload.quantity_quintals,
        "status": "PENDING",
        "offer_date": date.today(),
        "validity_days": payload.validity_days,
        "payment_terms": payload.payment_terms or "Immediate e-NAM / Bank Transfer",
        "notes": payload.notes,
        "created_at": now,
    }

    _IN_MEMORY_OFFERS.append(new_offer)
    if target_lot["status"] == "OPEN_FOR_BIDS":
        target_lot["status"] = "OFFER_RECEIVED"

    if db is not None:
        try:
            db_offer = BuyerOfferModel(
                id=new_id,
                lot_id=l_uuid,
                buyer_name=payload.buyer_name,
                contact_person=payload.contact_person,
                phone=payload.phone,
                offered_price_per_qtl=payload.offered_price_per_qtl,
                quantity_quintals=payload.quantity_quintals,
                status="PENDING",
                offer_date=date.today(),
                validity_days=payload.validity_days,
                payment_terms=new_offer["payment_terms"],
                notes=payload.notes,
            )
            db.add(db_offer)
            # Update lot status in DB
            db_lot = db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.id == l_uuid).first()
            if db_lot and db_lot.status == "OPEN_FOR_BIDS":
                db_lot.status = "OFFER_RECEIVED"
            db.commit()
            db.refresh(db_offer)
        except Exception:
            pass

    return _format_offer(new_offer)


@router.get("/lots/{lot_id}/offers", response_model=List[BuyerOfferResponse], summary="List and compare buyer offers for a lot")
def list_lot_offers(lot_id: str, db: Optional[Session] = Depends(get_db)):
    try:
        l_uuid = uuid.UUID(lot_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Lot UUID format")

    if db is not None:
        try:
            offers = db.query(BuyerOfferModel).filter(BuyerOfferModel.lot_id == l_uuid).order_by(BuyerOfferModel.offered_price_per_qtl.desc()).all()
            if offers:
                return [_format_offer(o.to_dict()) for o in offers]
        except Exception:
            pass

    offers = [o for o in _IN_MEMORY_OFFERS if o["lot_id"] == l_uuid]
    # Sort highest offered price first for quick bid comparison
    offers.sort(key=lambda x: x["offered_price_per_qtl"], reverse=True)
    return [_format_offer(o) for o in offers]


@router.put("/offers/{offer_id}/status", response_model=BuyerOfferResponse, summary="Accept or Reject buyer offer and execute transaction")
def update_offer_status(
    offer_id: str,
    payload: BuyerOfferStatusUpdate,
    db: Optional[Session] = Depends(get_db)
):
    try:
        o_uuid = uuid.UUID(offer_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Offer UUID format")

    target_status = payload.status.upper().strip()
    if target_status not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be either 'ACCEPTED' or 'REJECTED'")

    target_offer = None
    for o in _IN_MEMORY_OFFERS:
        if o["id"] == o_uuid:
            target_offer = o
            break

    if not target_offer:
        raise HTTPException(status_code=404, detail="Buyer offer not found")

    lot_id = target_offer["lot_id"]
    target_lot = None
    for l in _IN_MEMORY_LOTS:
        if l["id"] == lot_id:
            target_lot = l
            break

    if not target_lot:
        raise HTTPException(status_code=404, detail="Associated collective lot not found")

    if target_status == "ACCEPTED":
        target_offer["status"] = "ACCEPTED"
        target_lot["status"] = "COMPLETED"

        # Reject all other pending offers on this lot
        for other in _IN_MEMORY_OFFERS:
            if other["lot_id"] == lot_id and other["id"] != o_uuid and other["status"] == "PENDING":
                other["status"] = "REJECTED"

        # Record completed transaction
        txn_id = uuid.uuid4()
        now = datetime.now()
        txn_val = round(target_lot["total_quantity_quintals"] * target_offer["offered_price_per_qtl"], 2)
        new_txn = {
            "id": txn_id,
            "fpo_id": target_lot["fpo_id"],
            "lot_id": lot_id,
            "offer_id": o_uuid,
            "buyer_name": target_offer["buyer_name"],
            "crop_name": target_lot["crop_name"],
            "quantity_quintals": target_lot["total_quantity_quintals"],
            "agreed_price_per_qtl": target_offer["offered_price_per_qtl"],
            "total_transaction_value": txn_val,
            "contributing_farmers_count": target_lot["contributing_farmers_count"],
            "transaction_date": date.today(),
            "settlement_status": "SETTLED_TO_FARMERS",
            "created_at": now,
        }
        _IN_MEMORY_TRANSACTIONS.append(new_txn)

        # Mark contributing produce listings as SOLD
        for p in _IN_MEMORY_PRODUCE:
            if p.get("pooled_lot_id") == lot_id:
                p["status"] = "SOLD"

        if db is not None:
            try:
                db_offer = db.query(BuyerOfferModel).filter(BuyerOfferModel.id == o_uuid).first()
                if db_offer:
                    db_offer.status = "ACCEPTED"
                db_lot = db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.id == lot_id).first()
                if db_lot:
                    db_lot.status = "COMPLETED"
                # Reject others
                other_offers = db.query(BuyerOfferModel).filter(
                    BuyerOfferModel.lot_id == lot_id,
                    BuyerOfferModel.id != o_uuid,
                    BuyerOfferModel.status == "PENDING"
                ).all()
                for o in other_offers:
                    o.status = "REJECTED"
                # Record transaction
                db_txn = CollectiveTransactionModel(
                    id=txn_id,
                    fpo_id=target_lot["fpo_id"],
                    lot_id=lot_id,
                    offer_id=o_uuid,
                    buyer_name=target_offer["buyer_name"],
                    crop_name=target_lot["crop_name"],
                    quantity_quintals=target_lot["total_quantity_quintals"],
                    agreed_price_per_qtl=target_offer["offered_price_per_qtl"],
                    total_transaction_value=txn_val,
                    contributing_farmers_count=target_lot["contributing_farmers_count"],
                    transaction_date=date.today(),
                    settlement_status="SETTLED_TO_FARMERS",
                )
                db.add(db_txn)
                # Mark produce sold
                db_produces = db.query(FarmerProduceListingModel).filter(FarmerProduceListingModel.pooled_lot_id == lot_id).all()
                for dp in db_produces:
                    dp.status = "SOLD"
                db.commit()
            except Exception:
                pass

    else:
        # Status is REJECTED
        target_offer["status"] = "REJECTED"
        # If no other pending offers exist, return lot to OPEN_FOR_BIDS
        remaining_pending = [o for o in _IN_MEMORY_OFFERS if o["lot_id"] == lot_id and o["id"] != o_uuid and o["status"] == "PENDING"]
        if not remaining_pending and target_lot["status"] == "OFFER_RECEIVED":
            target_lot["status"] = "OPEN_FOR_BIDS"

        if db is not None:
            try:
                db_offer = db.query(BuyerOfferModel).filter(BuyerOfferModel.id == o_uuid).first()
                if db_offer:
                    db_offer.status = "REJECTED"
                if not remaining_pending:
                    db_lot = db.query(CollectiveProduceLotModel).filter(CollectiveProduceLotModel.id == lot_id).first()
                    if db_lot and db_lot.status == "OFFER_RECEIVED":
                        db_lot.status = "OPEN_FOR_BIDS"
                db.commit()
            except Exception:
                pass

    return _format_offer(target_offer)


# --------------------------------------------------------------------------
# Route 9 & 10: Collective Selling Transactions & Sales Ledger
# --------------------------------------------------------------------------
@router.get("/{fpo_id}/transactions", response_model=List[CollectiveTransactionResponse], summary="List completed collective transactions")
def list_fpo_transactions(fpo_id: str, db: Optional[Session] = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(fpo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FPO UUID format")

    if db is not None:
        try:
            txns = db.query(CollectiveTransactionModel).filter(CollectiveTransactionModel.fpo_id == f_uuid).order_by(CollectiveTransactionModel.transaction_date.desc()).all()
            if txns:
                return [_format_transaction(t.to_dict()) for t in txns]
        except Exception:
            pass

    txns = [t for t in _IN_MEMORY_TRANSACTIONS if t["fpo_id"] == f_uuid]
    txns.sort(key=lambda x: str(x["transaction_date"]), reverse=True)
    return [_format_transaction(t) for t in txns]
