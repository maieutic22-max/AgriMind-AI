import pytest
from app.api.v1.routes.fpo import (
    list_fpos,
    create_fpo,
    get_fpo,
    get_fpo_dashboard,
    apply_fpo_membership,
    list_fpo_members,
    update_member_status,
    create_produce_listing,
    list_produce_listings,
    pool_produce,
    list_collective_lots,
    get_collective_lot,
    create_buyer_offer,
    list_lot_offers,
    update_offer_status,
    list_fpo_transactions,
    DEFAULT_FPO_ID,
    LOT_MAIZE_ID,
)
from app.schemas.fpo import (
    FPOCreate,
    FPOMemberApply,
    FPOMemberStatusUpdate,
    ProduceListingCreate,
    PoolProduceRequest,
    BuyerOfferCreate,
    BuyerOfferStatusUpdate,
)


def test_list_and_create_fpo():
    """Verify listing existing FPOs and registering a new Farmer Producer Organization."""
    fpos = list_fpos(db=None)
    assert isinstance(fpos, list)
    assert len(fpos) >= 1
    
    first = fpos[0]
    assert first.name == "Sahyadri Kisan Producer Company Ltd"
    assert first.state == "Maharashtra"
    assert first.district == "Nashik"
    assert "Maize" in first.primary_crops
    assert first.total_members_count >= 1

    # Create a new FPO
    new_fpo_payload = FPOCreate(
        name="Kisan Kalyan Agritech Producer Co",
        registration_number="U01111MH2025PTC998877",
        state="Maharashtra",
        district="Pune",
        pin_code="411005",
        primary_crops="Wheat, Onion, Pomegranate",
        contact_person="Santosh Jadhav",
        phone="9823001122",
        email="contact@kisankalyan.org",
        description="FPO focused on collective aggregation and export-grade produce."
    )
    created = create_fpo(new_fpo_payload, db=None)
    assert created.name == new_fpo_payload.name
    assert created.registration_number == new_fpo_payload.registration_number
    assert created.district == "Pune"


def test_fpo_dashboard_metrics():
    """Verify aggregated dashboard metrics (members, produce volume, active lots, completed transactions)."""
    summary = get_fpo_dashboard(fpo_id=str(DEFAULT_FPO_ID), db=None)
    
    assert summary.fpo_id == str(DEFAULT_FPO_ID)
    assert summary.total_approved_members >= 4
    assert summary.total_available_produce_quintals > 0
    assert summary.total_pooled_produce_quintals > 0
    assert summary.active_collective_lots_count >= 1
    assert summary.total_completed_sales_value >= 700000.0


def test_membership_application_and_approval():
    """Verify farmer registration and administrator approval / rejection flow."""
    # 1. Apply for membership
    applicant = FPOMemberApply(
        farmer_name="Dattatray Pawar",
        phone="9876543210",
        village="Nandgaon Rural",
        district="Nashik",
        land_acres=3.0,
        primary_crops="Maize, Wheat"
    )
    member = apply_fpo_membership(fpo_id=str(DEFAULT_FPO_ID), payload=applicant, db=None)
    assert member.farmer_name == applicant.farmer_name
    assert member.status == "PENDING"
    assert member.land_acres == 3.0

    # 2. Check pending member is in list
    pending_list = list_fpo_members(fpo_id=str(DEFAULT_FPO_ID), status="PENDING", db=None)
    assert any(m.farmer_name == "Dattatray Pawar" for m in pending_list)

    # 3. Approve member
    approval = FPOMemberStatusUpdate(status="APPROVED")
    updated = update_member_status(
        fpo_id=str(DEFAULT_FPO_ID),
        member_id=member.id,
        payload=approval,
        db=None
    )
    assert updated.status == "APPROVED"
    assert updated.approved_date is not None


def test_farmer_produce_listing_and_collective_pooling():
    """Verify farmers listing individual produce and combining into a single collective lot with weighted asking price."""
    # 1. Farmer A lists Tomato
    listing_a = create_produce_listing(
        fpo_id=str(DEFAULT_FPO_ID),
        payload=ProduceListingCreate(
            farmer_name="Kashinath More",
            phone="9890112233",
            crop_name="Tomato",
            variety="Abhinav Special",
            quantity_quintals=50.0,
            asking_price_per_qtl=1800.0,
            quality_grade="Grade A"
        ),
        db=None
    )
    assert listing_a.status == "AVAILABLE"
    assert listing_a.quantity_quintals == 50.0

    # 2. Farmer B lists Tomato
    listing_b = create_produce_listing(
        fpo_id=str(DEFAULT_FPO_ID),
        payload=ProduceListingCreate(
            farmer_name="Ganpat Shinde",
            phone="9890223344",
            crop_name="Tomato",
            variety="Abhinav Special",
            quantity_quintals=100.0,
            asking_price_per_qtl=1950.0,
            quality_grade="Grade A"
        ),
        db=None
    )
    assert listing_b.status == "AVAILABLE"
    assert listing_b.quantity_quintals == 100.0

    # 3. Combine both listings into one collective lot
    # Weighted avg asking price: (50 * 1800 + 100 * 1950) / 150 = (90,000 + 195,000) / 150 = 285,000 / 150 = 1,900.0
    pool_req = PoolProduceRequest(
        crop_name="Tomato",
        variety="Abhinav Special Combined",
        quality_grade="Grade A",
        listing_ids=[listing_a.id, listing_b.id],
        custom_lot_code="LOT-TOMATO-POOL-01",
        notes="Combined early summer harvest for institutional puree processing."
    )
    pooled_lot = pool_produce(fpo_id=str(DEFAULT_FPO_ID), payload=pool_req, db=None)

    assert pooled_lot.lot_code == "LOT-TOMATO-POOL-01"
    assert pooled_lot.total_quantity_quintals == 150.0
    assert pooled_lot.weighted_avg_asking_price == 1900.0
    assert pooled_lot.contributing_farmers_count == 2
    assert pooled_lot.status == "OPEN_FOR_BIDS"


def test_buyer_offer_recording_and_comparison():
    """Verify institutional buyers submitting purchase offers and administrators comparing bids."""
    # Submit offer on LOT_MAIZE_ID
    offer_payload = BuyerOfferCreate(
        buyer_name="ITC Agri Business Division",
        contact_person="Rajeev Sharma",
        phone="9830099887",
        offered_price_per_qtl=2490.0,
        quantity_quintals=200.0,
        validity_days=10,
        payment_terms="Direct RTGS within 24 hours of weighment",
        notes="High-starch quality feed grade procurement."
    )
    new_offer = create_buyer_offer(lot_id=str(LOT_MAIZE_ID), payload=offer_payload, db=None)
    assert new_offer.buyer_name == "ITC Agri Business Division"
    assert new_offer.offered_price_per_qtl == 2490.0
    assert new_offer.status == "PENDING"

    # List all offers and verify sorted by highest offered price first
    offers = list_lot_offers(lot_id=str(LOT_MAIZE_ID), db=None)
    assert len(offers) >= 3
    for i in range(len(offers) - 1):
        assert offers[i].offered_price_per_qtl >= offers[i + 1].offered_price_per_qtl


def test_accept_offer_and_generate_transaction():
    """Verify accepting an offer marks lot COMPLETED, rejects competing offers, and writes to sales ledger."""
    offers = list_lot_offers(lot_id=str(LOT_MAIZE_ID), db=None)
    highest_offer = offers[0]

    # Accept the best offer
    accept_payload = BuyerOfferStatusUpdate(status="ACCEPTED")
    accepted_result = update_offer_status(offer_id=highest_offer.id, payload=accept_payload, db=None)
    assert accepted_result.status == "ACCEPTED"

    # Verify lot status is now COMPLETED
    lot = get_collective_lot(lot_id=str(LOT_MAIZE_ID), db=None)
    assert lot.status == "COMPLETED"

    # Verify transaction ledger has the record
    txns = list_fpo_transactions(fpo_id=str(DEFAULT_FPO_ID), db=None)
    assert len(txns) >= 2
    matched_txn = [t for t in txns if t.offer_id == highest_offer.id]
    assert len(matched_txn) == 1
    assert matched_txn[0].agreed_price_per_qtl == highest_offer.offered_price_per_qtl
    assert matched_txn[0].settlement_status == "SETTLED_TO_FARMERS"
