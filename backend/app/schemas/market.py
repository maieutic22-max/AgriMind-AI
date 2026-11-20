from typing import List, Optional, Dict
from datetime import date
from pydantic import BaseModel, Field


class MandiPriceItem(BaseModel):
    id: Optional[str] = None
    commodity: str = Field(..., description="Crop commodity name (e.g. Maize, Paddy, Wheat, Tomato, Onion, Soybean)")
    variety: str = Field(default="Standard / Hybrid", description="Commercial variety")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    market: str = Field(..., description="APMC Mandi Yard name")
    min_price: float = Field(..., ge=0, description="Minimum reported price in ₹ / quintal")
    max_price: float = Field(..., ge=0, description="Maximum reported price in ₹ / quintal")
    modal_price: float = Field(..., ge=0, description="Most frequent prevailing modal price in ₹ / quintal")
    arrival_tonnes: Optional[float] = Field(default=0.0, description="Daily arrival quantity in tonnes")
    price_date: str = Field(..., description="Reporting date (YYYY-MM-DD)")
    source: str = Field(default="AGMARKNET / Directorate of Marketing & Inspection (DMI)", description="Official source")
    data_status: str = Field(default="verified_agmarknet", description="Status: verified_agmarknet, delayed, unavailable")

    class Config:
        from_attributes = True


class MandiComparisonItem(BaseModel):
    market: str
    district: str
    state: str
    modal_price: float
    min_price: float
    max_price: float
    arrival_tonnes: float
    difference_from_highest: float
    is_highest: bool
    price_date: str


class MandiComparisonResponse(BaseModel):
    commodity: str
    highest_price: float
    highest_mandi: str
    highest_mandi_district: str
    lowest_price: float
    lowest_mandi: str
    price_spread: float
    mandis: List[MandiComparisonItem]
    recommendation: str


class HistoricalPricePoint(BaseModel):
    date: str
    modal_price: float
    min_price: float
    max_price: float
    arrival_tonnes: Optional[float] = 0.0


class HistoricalTrendsResponse(BaseModel):
    commodity: str
    market: str
    trends: List[HistoricalPricePoint]
    trend_direction: str  # "UPWARD", "DOWNWARD", "STABLE"
    price_change_pct: float
    highest_period_price: float
    lowest_period_price: float
    summary: str


class MarketDecisionInsight(BaseModel):
    commodity: str
    current_mandi: str
    current_modal_price: float
    highest_mandi: str
    highest_modal_price: float
    price_advantage_per_qtl: float
    recommendation: str  # "SELL NOW", "HOLD / STORE", "TRANSPORT TO NEARBY MANDI"
    actionable_advice: str
    price_trend: str
    data_freshness_note: str


class MarketMetadataResponse(BaseModel):
    commodities: List[str]
    states: List[str]
    districts_by_state: Dict[str, List[str]]
    mandis_by_district: Dict[str, List[str]]
