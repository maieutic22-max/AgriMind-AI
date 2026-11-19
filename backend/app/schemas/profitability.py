import uuid
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

# --- Granular Input Costs ---
class CropCostBreakdown(BaseModel):
    seed_cost: float = Field(0.0, ge=0, description="Cost of seeds & planting material in INR (₹)")
    fertilizer_cost: float = Field(0.0, ge=0, description="Cost of chemical, bio & organic fertilizers in INR (₹)")
    pesticide_cost: float = Field(0.0, ge=0, description="Cost of crop protection agrochemicals & sprays in INR (₹)")
    labour_cost: float = Field(0.0, ge=0, description="Cost of manual field operations (sowing, weeding, harvest) in INR (₹)")
    irrigation_cost: float = Field(0.0, ge=0, description="Cost of electricity, canal water or diesel pump sets in INR (₹)")
    machinery_cost: float = Field(0.0, ge=0, description="Cost of tractor, rotavator, thresher hire in INR (₹)")
    other_cost: float = Field(0.0, ge=0, description="Packaging, transport and miscellaneous expenses in INR (₹)")

    @property
    def total(self) -> float:
        return (
            self.seed_cost
            + self.fertilizer_cost
            + self.pesticide_cost
            + self.labour_cost
            + self.irrigation_cost
            + self.machinery_cost
            + self.other_cost
        )

# --- Standard Agricultural Crop Benchmark Defaults ---
class CropBaselineBenchmark(BaseModel):
    crop_name: str
    category: str  # Cereal, Pulse, Oilseed, Cash Crop, Vegetable
    season: str  # Kharif, Rabi, Zaid, Annual
    default_yield_qtl_acre: float  # Quintals per acre
    default_price_qtl: float  # Price in INR per quintal (MSP / APMC Modal)
    costs_per_acre: CropCostBreakdown
    water_requirement_mm: int
    duration_days: int

# --- Simulation Input ---
class SimulationCalculationInput(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=100, description="Crop name, e.g. Maize, Soybean, Wheat")
    area_acres: float = Field(..., gt=0, le=10000, description="Cultivated farm land area in acres")
    costs: CropCostBreakdown = Field(..., description="Granular input costs")
    is_cost_per_acre: bool = Field(True, description="True if entered costs are per acre; False if total farm costs")
    expected_yield_per_acre: float = Field(..., gt=0, description="Expected production yield in quintals per acre")
    expected_selling_price_per_qtl: float = Field(..., gt=0, description="Expected selling price at farmgate or APMC in ₹/quintal")
    title: Optional[str] = Field(None, max_length=255, description="Custom label for this simulation scenario")
    notes: Optional[str] = Field(None, max_length=1000, description="Notes on varieties, soil, or irrigation conditions")

# --- Computed Financial & Economic Metrics ---
class SimulationMetrics(BaseModel):
    total_yield_quintals: float = Field(..., description="Total harvested crop volume in quintals")
    total_expenses: float = Field(..., description="Total operating investment in INR (₹)")
    cost_per_acre: float = Field(..., description="Average cultivation expenditure per acre in INR (₹)")
    expected_revenue: float = Field(..., description="Total gross revenue in INR (₹)")
    revenue_per_acre: float = Field(..., description="Gross revenue generated per acre in INR (₹)")
    net_profit: float = Field(..., description="Net margin (Total Revenue - Total Expenses) in INR (₹)")
    is_profitable: bool = Field(..., description="True if net profit > 0")
    profit_per_acre: float = Field(..., description="Net profit earned per acre in INR (₹)")
    roi_percentage: float = Field(..., description="Return on Investment percentage = (Net Profit / Total Expenses) * 100")
    breakeven_yield_per_acre: float = Field(..., description="Minimum yield needed per acre to cover total expenses at current price")
    breakeven_price_per_qtl: float = Field(..., description="Minimum selling price per quintal needed to cover total expenses at current yield")
    cost_percentages: Dict[str, float] = Field(default_factory=dict, description="Percentage of total expense by input category")

# --- Complete Simulation Result ---
class SimulationResult(BaseModel):
    input: SimulationCalculationInput
    metrics: SimulationMetrics

# --- Multi-Crop Comparison ---
class MultiCropComparisonRequest(BaseModel):
    scenarios: List[SimulationCalculationInput] = Field(..., min_length=2, max_length=5, description="2 to 5 crop scenarios to compare")

class MultiCropComparisonResponse(BaseModel):
    results: List[SimulationResult]
    highest_profit_crop: str
    highest_roi_crop: str
    lowest_cost_crop: str
    summary_recommendation: str

# --- Persistence Request & Response ---
class SimulationSaveRequest(BaseModel):
    farm_id: Optional[uuid.UUID] = None
    title: str = Field(..., min_length=2, max_length=255)
    crop_name: str = Field(..., min_length=2, max_length=100)
    area_acres: float = Field(..., gt=0)
    costs: CropCostBreakdown
    is_cost_per_acre: bool = True
    expected_yield_per_acre: float = Field(..., gt=0)
    expected_selling_price_per_qtl: float = Field(..., gt=0)
    notes: Optional[str] = None
    comparison_crops: Optional[List[str]] = None

class SimulationResponse(BaseModel):
    id: uuid.UUID
    farm_id: Optional[uuid.UUID] = None
    title: str
    crop_name: str
    area_acres: float
    seed_cost: float
    fertilizer_cost: float
    pesticide_cost: float
    labour_cost: float
    irrigation_cost: float
    machinery_cost: float
    other_cost: float
    expected_yield_per_acre: float
    expected_selling_price_per_qtl: float
    total_expenses: float
    total_revenue: float
    net_profit: float
    profit_per_acre: float
    roi_percentage: float
    breakeven_yield_per_acre: Optional[float] = None
    breakeven_price_per_qtl: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
