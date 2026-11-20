import pytest
from app.api.v1.routes.market import (
    get_mandi_prices,
    compare_mandi_prices,
    get_historical_trends,
    get_market_insights,
    get_market_metadata
)


def test_get_all_market_prices():
    """Verify endpoint returns official AGMARKNET mandi price records with min, max, and modal rates."""
    data = get_mandi_prices(db=None)
    assert isinstance(data, list)
    assert len(data) >= 10
    
    first = data[0]
    assert "commodity" in first
    assert "market" in first
    assert "min_price" in first
    assert "max_price" in first
    assert "modal_price" in first
    assert first["min_price"] <= first["modal_price"] <= first["max_price"]
    assert first["source"] == "AGMARKNET / DMI (agmarknet.gov.in)"
    assert first["data_status"] == "verified_agmarknet"


def test_filter_by_commodity_and_district():
    """Verify filtering by crop (e.g. Maize, Tomato, Onion) and geography."""
    # Test searching for Maize in Nashik
    data = get_mandi_prices(commodity="Maize", district="Nashik", db=None)
    assert len(data) >= 2
    for item in data:
        assert item["commodity"] == "Maize"
        assert item["district"] == "Nashik"

    # Test searching for Onion
    onion_data = get_mandi_prices(commodity="Onion", db=None)
    assert len(onion_data) >= 3
    for item in onion_data:
        assert "Onion" in item["commodity"]


def test_mandi_comparison_and_highest_price():
    """Verify comparing prices across mandis and identifying the highest market price."""
    data = compare_mandi_prices(commodity="Maize", db=None)
    
    assert data.commodity == "Maize"
    assert data.highest_price >= data.lowest_price
    assert data.price_spread == round(data.highest_price - data.lowest_price, 2)
    assert len(data.mandis) >= 3
    
    # Check that highest mandi is marked
    highest_items = [m for m in data.mandis if m.is_highest]
    assert len(highest_items) == 1
    assert highest_items[0].modal_price == data.highest_price
    assert len(data.recommendation) > 10


def test_historical_price_trends():
    """Verify 30-day historical trend trajectory with min, max, and modal points."""
    data = get_historical_trends(commodity="Soybean")
    
    assert data.commodity == "Soybean"
    assert len(data.trends) >= 10
    assert data.trend_direction in ["UPWARD", "DOWNWARD", "STABLE"]
    assert data.highest_period_price >= data.lowest_period_price
    
    # Verify chronologically ordered points
    first_pt = data.trends[0]
    last_pt = data.trends[-1]
    assert first_pt.date < last_pt.date
    assert first_pt.min_price <= first_pt.modal_price <= first_pt.max_price


def test_market_selling_decision_insights():
    """Verify actionable selling decision advice with price advantage computation."""
    data = get_market_insights(commodity="Maize", current_mandi="Nashik APMC Yard")
    
    assert data.commodity == "Maize"
    assert "Nashik APMC" in data.current_mandi
    assert data.highest_modal_price >= data.current_modal_price
    assert data.price_advantage_per_qtl >= 0
    assert data.recommendation in ["TRANSPORT TO HIGHER MANDI", "SELL LOCALLY", "SELL LOCALLY AT HIGHEST PREVAILING RATE"]
    assert len(data.actionable_advice) > 15
    assert "AGMARKNET" in data.data_freshness_note


def test_market_metadata_cascading():
    """Verify cascading metadata for state, district, and mandi dropdowns."""
    data = get_market_metadata()
    
    assert "Maize" in data.commodities
    assert "Paddy" in data.commodities
    assert "Wheat" in data.commodities
    assert "Tomato" in data.commodities
    assert "Onion" in data.commodities
    assert "Soybean" in data.commodities
    assert "Maharashtra" in data.states
    assert "Karnataka" in data.states
    assert "Nashik" in data.districts_by_state["Maharashtra"]
