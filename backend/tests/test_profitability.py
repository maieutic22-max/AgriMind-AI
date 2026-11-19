import uuid
from app.schemas.profitability import (
    CropCostBreakdown,
    SimulationCalculationInput,
    MultiCropComparisonRequest,
    SimulationSaveRequest
)
from app.api.v1.routes.profitability import (
    simulate_profitability,
    compare_crop_profitability,
    get_crop_benchmarks,
    list_saved_simulations,
    save_simulation,
    delete_simulation
)

def test_single_crop_profitability_calculation():
    # 3 acres of Maize
    costs = CropCostBreakdown(
        seed_cost=3000.0,
        fertilizer_cost=5000.0,
        pesticide_cost=2000.0,
        labour_cost=6000.0,
        irrigation_cost=2000.0,
        machinery_cost=4000.0,
        other_cost=1000.0
    )
    # Total cost per acre = 23,000; for 3 acres = 69,000
    scenario = SimulationCalculationInput(
        crop_name="Hybrid Maize",
        area_acres=3.0,
        costs=costs,
        is_cost_per_acre=True,
        expected_yield_per_acre=25.0,  # 75 quintals total
        expected_selling_price_per_qtl=2200.0  # 75 * 2200 = 165,000 revenue
    )

    result = simulate_profitability(scenario)
    m = result.metrics

    assert m.total_expenses == 69000.0
    assert m.cost_per_acre == 23000.0
    assert m.total_yield_quintals == 75.0
    assert m.expected_revenue == 165000.0
    assert m.revenue_per_acre == 55000.0
    assert m.net_profit == 96000.0  # 165000 - 69000
    assert m.profit_per_acre == 32000.0
    assert m.is_profitable is True
    # ROI = (96000 / 69000) * 100 = 139.13%
    assert round(m.roi_percentage, 1) == 139.1
    # Breakeven yield = 23000 / 2200 = 10.45 qtl/acre
    assert round(m.breakeven_yield_per_acre, 2) == 10.45
    # Breakeven price = 69000 / 75 = 920.0 Rs/qtl
    assert m.breakeven_price_per_qtl == 920.0
    assert "Fertilisers" in m.cost_percentages

def test_loss_scenario_calculation():
    costs = CropCostBreakdown(
        seed_cost=5000.0,
        fertilizer_cost=8000.0,
        pesticide_cost=4000.0,
        labour_cost=10000.0,
        irrigation_cost=3000.0,
        machinery_cost=5000.0,
        other_cost=2000.0
    )
    # Total cost per acre = 37,000; 2 acres = 74,000
    scenario = SimulationCalculationInput(
        crop_name="Flooded Cotton",
        area_acres=2.0,
        costs=costs,
        is_cost_per_acre=True,
        expected_yield_per_acre=4.0,  # low yield: 8 quintals total
        expected_selling_price_per_qtl=6000.0  # 8 * 6000 = 48,000
    )

    result = simulate_profitability(scenario)
    m = result.metrics

    assert m.total_expenses == 74000.0
    assert m.expected_revenue == 48000.0
    assert m.net_profit == -26000.0
    assert m.is_profitable is False
    assert m.roi_percentage < 0

def test_crop_comparison():
    costs_maize = CropCostBreakdown(
        seed_cost=3000.0, fertilizer_cost=5000.0, pesticide_cost=2000.0,
        labour_cost=6000.0, irrigation_cost=2000.0, machinery_cost=4000.0, other_cost=1000.0
    )
    costs_soybean = CropCostBreakdown(
        seed_cost=3500.0, fertilizer_cost=4000.0, pesticide_cost=2500.0,
        labour_cost=5500.0, irrigation_cost=1500.0, machinery_cost=3500.0, other_cost=1000.0
    )

    req = MultiCropComparisonRequest(
        scenarios=[
            SimulationCalculationInput(
                crop_name="Hybrid Maize",
                area_acres=2.5,
                costs=costs_maize,
                is_cost_per_acre=True,
                expected_yield_per_acre=24.0,
                expected_selling_price_per_qtl=2200.0
            ),
            SimulationCalculationInput(
                crop_name="Soybean JS-335",
                area_acres=2.5,
                costs=costs_soybean,
                is_cost_per_acre=True,
                expected_yield_per_acre=12.0,
                expected_selling_price_per_qtl=4900.0
            )
        ]
    )

    res = compare_crop_profitability(req)
    assert len(res.results) == 2
    assert res.highest_profit_crop in ["Hybrid Maize", "Soybean JS-335"]
    assert res.highest_roi_crop in ["Hybrid Maize", "Soybean JS-335"]
    assert len(res.summary_recommendation) > 0

def test_crop_benchmarks():
    benchmarks = get_crop_benchmarks()
    assert len(benchmarks) >= 5
    crop_names = [b.crop_name for b in benchmarks]
    assert any("Maize" in c for c in crop_names)
    assert any("Soybean" in c for c in crop_names)
    assert any("Wheat" in c for c in crop_names)

def test_save_and_list_simulations():
    # 1. Save simulation
    saved = save_simulation(
        SimulationSaveRequest(
            title="Monsoon 2026 Test Simulation",
            crop_name="Sugarcane",
            area_acres=2.0,
            costs=CropCostBreakdown(
                seed_cost=10000.0, fertilizer_cost=12000.0, pesticide_cost=4000.0,
                labour_cost=15000.0, irrigation_cost=8000.0, machinery_cost=6000.0, other_cost=3000.0
            ),
            is_cost_per_acre=True,
            expected_yield_per_acre=350.0,  # 350 quintals = 35 tons
            expected_selling_price_per_qtl=350.0,  # ₹350/qtl
            notes="Factory tie-up rate"
        ),
        db=None
    )

    sim_id = saved["id"] if isinstance(saved, dict) else saved.id
    assert sim_id is not None

    # 2. List simulations
    sims = list_saved_simulations(db=None)
    assert any((s["id"] if isinstance(s, dict) else s.id) == sim_id for s in sims)

    # 3. Clean up
    delete_simulation(sim_id, db=None)
    sims_after = list_saved_simulations(db=None)
    assert not any((s["id"] if isinstance(s, dict) else s.id) == sim_id for s in sims_after)
