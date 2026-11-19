import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models.profitability import FarmSimulation as FarmSimulationModel
from app.schemas.profitability import (
    CropCostBreakdown,
    CropBaselineBenchmark,
    SimulationCalculationInput,
    SimulationMetrics,
    SimulationResult,
    MultiCropComparisonRequest,
    MultiCropComparisonResponse,
    SimulationSaveRequest,
    SimulationResponse
)

router = APIRouter(prefix="/profitability", tags=["Farm Profitability Simulator (Member 3)"])

# --------------------------------------------------------------------------
# Realistic Standard Agricultural Benchmarks (Kharif & Rabi Season)
# --------------------------------------------------------------------------
CROP_BENCHMARKS: List[CropBaselineBenchmark] = [
    CropBaselineBenchmark(
        crop_name="Hybrid Maize",
        category="Cereal",
        season="Kharif",
        default_yield_qtl_acre=24.0,
        default_price_qtl=2225.0,  # MSP aligned
        water_requirement_mm=550,
        duration_days=105,
        costs_per_acre=CropCostBreakdown(
            seed_cost=3200.0,
            fertilizer_cost=5400.0,
            pesticide_cost=2100.0,
            labour_cost=6500.0,
            irrigation_cost=2200.0,
            machinery_cost=4200.0,
            other_cost=1400.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Soybean (JS-335)",
        category="Oilseed / Pulse",
        season="Kharif",
        default_yield_qtl_acre=12.0,
        default_price_qtl=4892.0,  # MSP aligned
        water_requirement_mm=450,
        duration_days=95,
        costs_per_acre=CropCostBreakdown(
            seed_cost=3800.0,
            fertilizer_cost=4200.0,
            pesticide_cost=2800.0,
            labour_cost=5800.0,
            irrigation_cost=1500.0,
            machinery_cost=3900.0,
            other_cost=1200.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Sharbati Wheat",
        category="Cereal",
        season="Rabi",
        default_yield_qtl_acre=20.0,
        default_price_qtl=2425.0,  # MSP aligned
        water_requirement_mm=400,
        duration_days=120,
        costs_per_acre=CropCostBreakdown(
            seed_cost=2600.0,
            fertilizer_cost=4800.0,
            pesticide_cost=1500.0,
            labour_cost=5000.0,
            irrigation_cost=2800.0,
            machinery_cost=4500.0,
            other_cost=1100.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Bt Cotton",
        category="Cash Crop",
        season="Kharif",
        default_yield_qtl_acre=10.0,
        default_price_qtl=7521.0,  # MSP aligned
        water_requirement_mm=700,
        duration_days=160,
        costs_per_acre=CropCostBreakdown(
            seed_cost=4200.0,
            fertilizer_cost=6500.0,
            pesticide_cost=5200.0,
            labour_cost=9500.0,
            irrigation_cost=3000.0,
            machinery_cost=4800.0,
            other_cost=1800.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Basmati Paddy",
        category="Cereal",
        season="Kharif",
        default_yield_qtl_acre=22.0,
        default_price_qtl=3200.0,
        water_requirement_mm=1200,
        duration_days=130,
        costs_per_acre=CropCostBreakdown(
            seed_cost=2200.0,
            fertilizer_cost=5800.0,
            pesticide_cost=2600.0,
            labour_cost=8800.0,
            irrigation_cost=4500.0,
            machinery_cost=4600.0,
            other_cost=1500.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Groundnut",
        category="Oilseed",
        season="Kharif / Zaid",
        default_yield_qtl_acre=11.0,
        default_price_qtl=6783.0,
        water_requirement_mm=500,
        duration_days=115,
        costs_per_acre=CropCostBreakdown(
            seed_cost=5500.0,
            fertilizer_cost=4100.0,
            pesticide_cost=2200.0,
            labour_cost=6200.0,
            irrigation_cost=2000.0,
            machinery_cost=3800.0,
            other_cost=1400.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Hybrid Tomato",
        category="Horticulture / Vegetable",
        season="Kharif / Rabi",
        default_yield_qtl_acre=120.0,  # ~12 tons
        default_price_qtl=1600.0,
        water_requirement_mm=600,
        duration_days=90,
        costs_per_acre=CropCostBreakdown(
            seed_cost=6000.0,
            fertilizer_cost=9500.0,
            pesticide_cost=7500.0,
            labour_cost=14000.0,
            irrigation_cost=4000.0,
            machinery_cost=5500.0,
            other_cost=3500.0
        )
    ),
    CropBaselineBenchmark(
        crop_name="Green Chilli",
        category="Spices / Vegetable",
        season="Annual / Kharif",
        default_yield_qtl_acre=45.0,
        default_price_qtl=3400.0,
        water_requirement_mm=650,
        duration_days=150,
        costs_per_acre=CropCostBreakdown(
            seed_cost=4500.0,
            fertilizer_cost=7200.0,
            pesticide_cost=6800.0,
            labour_cost=11500.0,
            irrigation_cost=3500.0,
            machinery_cost=4500.0,
            other_cost=2500.0
        )
    )
]

# In-memory baseline saved simulations
_IN_MEMORY_SIMULATIONS: List[dict] = [
    {
        "id": uuid.UUID("11111111-2222-3333-4444-555555555551"),
        "farm_id": None,
        "title": "Kharif 2026 Baseline Maize on Plot 1",
        "crop_name": "Hybrid Maize",
        "area_acres": 3.0,
        "seed_cost": 9600.0,
        "fertilizer_cost": 16200.0,
        "pesticide_cost": 6300.0,
        "labour_cost": 19500.0,
        "irrigation_cost": 6600.0,
        "machinery_cost": 12600.0,
        "other_cost": 4200.0,
        "expected_yield_per_acre": 24.0,
        "expected_selling_price_per_qtl": 2225.0,
        "total_expenses": 75000.0,
        "total_revenue": 160200.0,
        "net_profit": 85200.0,
        "profit_per_acre": 28400.0,
        "roi_percentage": 113.6,
        "breakeven_yield_per_acre": 11.24,
        "breakeven_price_per_qtl": 1041.67,
        "notes": "Verified against local Nashik Mandi average modal rates",
        "created_at": datetime(2026, 5, 10, 10, 0),
        "updated_at": datetime(2026, 5, 10, 10, 0)
    },
    {
        "id": uuid.UUID("11111111-2222-3333-4444-555555555552"),
        "farm_id": None,
        "title": "Alternative Crop: Soybean JS-335 on Plot 1",
        "crop_name": "Soybean (JS-335)",
        "area_acres": 3.0,
        "seed_cost": 11400.0,
        "fertilizer_cost": 12600.0,
        "pesticide_cost": 8400.0,
        "labour_cost": 17400.0,
        "irrigation_cost": 4500.0,
        "machinery_cost": 11700.0,
        "other_cost": 3600.0,
        "expected_yield_per_acre": 12.0,
        "expected_selling_price_per_qtl": 4892.0,
        "total_expenses": 69600.0,
        "total_revenue": 176112.0,
        "net_profit": 106512.0,
        "profit_per_acre": 35504.0,
        "roi_percentage": 153.03,
        "breakeven_yield_per_acre": 4.74,
        "breakeven_price_per_qtl": 1933.33,
        "notes": "Lower water requirement, higher MSP cushion",
        "created_at": datetime(2026, 5, 10, 10, 30),
        "updated_at": datetime(2026, 5, 10, 10, 30)
    }
]

# --------------------------------------------------------------------------
# Dynamic Calculation Engine
# --------------------------------------------------------------------------
def compute_metrics(scenario: SimulationCalculationInput) -> SimulationMetrics:
    area = float(scenario.area_acres)
    is_per_acre = scenario.is_cost_per_acre
    
    # Scale costs to total farm area
    multiplier = area if is_per_acre else 1.0
    c_seed = scenario.costs.seed_cost * multiplier
    c_fert = scenario.costs.fertilizer_cost * multiplier
    c_pest = scenario.costs.pesticide_cost * multiplier
    c_lab = scenario.costs.labour_cost * multiplier
    c_irr = scenario.costs.irrigation_cost * multiplier
    c_mach = scenario.costs.machinery_cost * multiplier
    c_oth = scenario.costs.other_cost * multiplier

    total_expenses = c_seed + c_fert + c_pest + c_lab + c_irr + c_mach + c_oth
    cost_per_acre = total_expenses / area if area > 0 else 0.0

    # Production & Revenue
    total_yield_quintals = float(scenario.expected_yield_per_acre) * area
    expected_revenue = total_yield_quintals * float(scenario.expected_selling_price_per_qtl)
    revenue_per_acre = expected_revenue / area if area > 0 else 0.0

    # Profitability & Return
    net_profit = expected_revenue - total_expenses
    is_profitable = net_profit > 0
    profit_per_acre = net_profit / area if area > 0 else 0.0
    roi_pct = (net_profit / total_expenses * 100.0) if total_expenses > 0 else 0.0

    # Breakeven Analysis
    price = float(scenario.expected_selling_price_per_qtl)
    breakeven_yield_per_acre = (cost_per_acre / price) if price > 0 else 0.0
    breakeven_price_per_qtl = (total_expenses / total_yield_quintals) if total_yield_quintals > 0 else 0.0

    # Cost breakdown percentages
    cost_pcts = {}
    if total_expenses > 0:
        cost_pcts = {
            "Seeds": round((c_seed / total_expenses) * 100.0, 1),
            "Fertilisers": round((c_fert / total_expenses) * 100.0, 1),
            "Pesticides": round((c_pest / total_expenses) * 100.0, 1),
            "Labour": round((c_lab / total_expenses) * 100.0, 1),
            "Irrigation": round((c_irr / total_expenses) * 100.0, 1),
            "Machinery": round((c_mach / total_expenses) * 100.0, 1),
            "Other": round((c_oth / total_expenses) * 100.0, 1),
        }

    return SimulationMetrics(
        total_yield_quintals=round(total_yield_quintals, 2),
        total_expenses=round(total_expenses, 2),
        cost_per_acre=round(cost_per_acre, 2),
        expected_revenue=round(expected_revenue, 2),
        revenue_per_acre=round(revenue_per_acre, 2),
        net_profit=round(net_profit, 2),
        is_profitable=is_profitable,
        profit_per_acre=round(profit_per_acre, 2),
        roi_percentage=round(roi_pct, 2),
        breakeven_yield_per_acre=round(breakeven_yield_per_acre, 2),
        breakeven_price_per_qtl=round(breakeven_price_per_qtl, 2),
        cost_percentages=cost_pcts
    )

# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------
@router.post("/simulate", response_model=SimulationResult, summary="Run Single Crop Farm Profitability Simulation")
def simulate_profitability(payload: SimulationCalculationInput):
    """
    Computes dynamic financial returns for a given crop, cultivated acreage,
    granular input costs, anticipated yield, and market price.
    Calculates total expenses, revenue, net profit/loss, profit per acre, and ROI.
    """
    metrics = compute_metrics(payload)
    return SimulationResult(input=payload, metrics=metrics)

@router.post("/compare", response_model=MultiCropComparisonResponse, summary="Compare Profitability Between Multiple Crops")
def compare_crop_profitability(payload: MultiCropComparisonRequest):
    """
    Simulates 2 to 5 crop scenarios side-by-side, comparing yields,
    input cost structures, net profits, and ROI to help farmers make optimal planting decisions.
    """
    results: List[SimulationResult] = []
    for scenario in payload.scenarios:
        m = compute_metrics(scenario)
        results.append(SimulationResult(input=scenario, metrics=m))

    # Rank by net profit descending
    ranked_by_profit = sorted(results, key=lambda r: r.metrics.net_profit, reverse=True)
    ranked_by_roi = sorted(results, key=lambda r: r.metrics.roi_percentage, reverse=True)
    ranked_by_cost = sorted(results, key=lambda r: r.metrics.total_expenses)

    best_profit = ranked_by_profit[0]
    best_roi = ranked_by_roi[0]
    lowest_cost = ranked_by_cost[0]

    recommendation = (
        f"Among the simulated options, {best_profit.input.crop_name} offers the highest net return "
        f"at ₹{best_profit.metrics.net_profit:,.0f} (₹{best_profit.metrics.profit_per_acre:,.0f}/acre). "
    )
    if best_roi.input.crop_name != best_profit.input.crop_name:
        recommendation += (
            f"However, {best_roi.input.crop_name} delivers maximum capital efficiency with {best_roi.metrics.roi_percentage:.1f}% ROI "
            f"and lower initial exposure."
        )
    else:
        recommendation += f"It also leads in capital efficiency with an impressive {best_profit.metrics.roi_percentage:.1f}% ROI."

    return MultiCropComparisonResponse(
        results=results,
        highest_profit_crop=best_profit.input.crop_name,
        highest_roi_crop=best_roi.input.crop_name,
        lowest_cost_crop=lowest_cost.input.crop_name,
        summary_recommendation=recommendation
    )

@router.get("/benchmarks", response_model=List[CropBaselineBenchmark], summary="Get Standard Crop Baseline Benchmarks")
def get_crop_benchmarks():
    """
    Returns realistic benchmark input costs, expected yields, and market rates
    for major Indian crops to pre-populate simulator fields.
    """
    return CROP_BENCHMARKS

@router.get("/simulations", response_model=List[SimulationResponse], summary="List Saved Profitability Simulations")
def list_saved_simulations(db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            records = db.query(FarmSimulationModel).order_by(FarmSimulationModel.created_at.desc()).all()
            return records
        except Exception:
            pass

    return sorted(_IN_MEMORY_SIMULATIONS, key=lambda s: s["created_at"], reverse=True)

@router.post("/simulations", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED, summary="Save Simulation Scenario")
def save_simulation(payload: SimulationSaveRequest, db: Optional[Session] = Depends(get_db)):
    """
    Persists a crop simulation run to the database or storage for future recall and tracking.
    """
    # Calculate exact dynamic metrics
    calc_input = SimulationCalculationInput(
        crop_name=payload.crop_name,
        area_acres=payload.area_acres,
        costs=payload.costs,
        is_cost_per_acre=payload.is_cost_per_acre,
        expected_yield_per_acre=payload.expected_yield_per_acre,
        expected_selling_price_per_qtl=payload.expected_selling_price_per_qtl,
        title=payload.title,
        notes=payload.notes
    )
    m = compute_metrics(calc_input)
    
    multiplier = payload.area_acres if payload.is_cost_per_acre else 1.0
    s_cost = payload.costs.seed_cost * multiplier
    f_cost = payload.costs.fertilizer_cost * multiplier
    p_cost = payload.costs.pesticide_cost * multiplier
    l_cost = payload.costs.labour_cost * multiplier
    i_cost = payload.costs.irrigation_cost * multiplier
    m_cost = payload.costs.machinery_cost * multiplier
    o_cost = payload.costs.other_cost * multiplier

    new_id = uuid.uuid4()
    now = datetime.now()

    if db is not None:
        try:
            sim = FarmSimulationModel(
                id=new_id,
                farm_id=payload.farm_id,
                title=payload.title,
                crop_name=payload.crop_name,
                area_acres=payload.area_acres,
                seed_cost=s_cost,
                fertilizer_cost=f_cost,
                pesticide_cost=p_cost,
                labour_cost=l_cost,
                irrigation_cost=i_cost,
                machinery_cost=m_cost,
                other_cost=o_cost,
                expected_yield_per_acre=payload.expected_yield_per_acre,
                expected_selling_price_per_qtl=payload.expected_selling_price_per_qtl,
                total_expenses=m.total_expenses,
                total_revenue=m.expected_revenue,
                net_profit=m.net_profit,
                profit_per_acre=m.profit_per_acre,
                roi_percentage=m.roi_percentage,
                breakeven_yield_per_acre=m.breakeven_yield_per_acre,
                breakeven_price_per_qtl=m.breakeven_price_per_qtl,
                notes=payload.notes,
                comparison_crops=payload.comparison_crops
            )
            db.add(sim)
            db.commit()
            db.refresh(sim)
            return sim
        except Exception:
            db.rollback()

    item = {
        "id": new_id,
        "farm_id": payload.farm_id,
        "title": payload.title,
        "crop_name": payload.crop_name,
        "area_acres": payload.area_acres,
        "seed_cost": s_cost,
        "fertilizer_cost": f_cost,
        "pesticide_cost": p_cost,
        "labour_cost": l_cost,
        "irrigation_cost": i_cost,
        "machinery_cost": m_cost,
        "other_cost": o_cost,
        "expected_yield_per_acre": payload.expected_yield_per_acre,
        "expected_selling_price_per_qtl": payload.expected_selling_price_per_qtl,
        "total_expenses": m.total_expenses,
        "total_revenue": m.expected_revenue,
        "net_profit": m.net_profit,
        "profit_per_acre": m.profit_per_acre,
        "roi_percentage": m.roi_percentage,
        "breakeven_yield_per_acre": m.breakeven_yield_per_acre,
        "breakeven_price_per_qtl": m.breakeven_price_per_qtl,
        "notes": payload.notes,
        "created_at": now,
        "updated_at": now
    }
    _IN_MEMORY_SIMULATIONS.insert(0, item)
    return item

@router.delete("/simulations/{sim_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Saved Simulation")
def delete_simulation(sim_id: uuid.UUID, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            record = db.query(FarmSimulationModel).filter(FarmSimulationModel.id == sim_id).first()
            if record:
                db.delete(record)
                db.commit()
                return None
        except Exception:
            db.rollback()

    for i, item in enumerate(_IN_MEMORY_SIMULATIONS):
        if item["id"] == sim_id:
            _IN_MEMORY_SIMULATIONS.pop(i)
            return None

    raise HTTPException(status_code=404, detail="Simulation record not found")
