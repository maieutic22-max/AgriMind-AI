import { apiClient } from './api';
import {
  CropBaselineBenchmark,
  SimulationCalculationInput,
  SimulationMetrics,
  SimulationResult,
  MultiCropComparisonRequest,
  MultiCropComparisonResponse,
  SimulationSaveRequest,
  SimulationResponse,
} from '../types/profitability';

const STORAGE_KEY_SIMULATIONS = 'agrimind_saved_simulations';

// Realistic agricultural benchmarks for fallback and immediate prefill
export const DEFAULT_BENCHMARKS: CropBaselineBenchmark[] = [
  {
    crop_name: 'Hybrid Maize',
    category: 'Cereal',
    season: 'Kharif',
    default_yield_qtl_acre: 24.0,
    default_price_qtl: 2225.0,
    water_requirement_mm: 550,
    duration_days: 105,
    costs_per_acre: {
      seed_cost: 3200,
      fertilizer_cost: 5400,
      pesticide_cost: 2100,
      labour_cost: 6500,
      irrigation_cost: 2200,
      machinery_cost: 4200,
      other_cost: 1400,
    },
  },
  {
    crop_name: 'Soybean (JS-335)',
    category: 'Oilseed / Pulse',
    season: 'Kharif',
    default_yield_qtl_acre: 12.0,
    default_price_qtl: 4892.0,
    water_requirement_mm: 450,
    duration_days: 95,
    costs_per_acre: {
      seed_cost: 3800,
      fertilizer_cost: 4200,
      pesticide_cost: 2800,
      labour_cost: 5800,
      irrigation_cost: 1500,
      machinery_cost: 3900,
      other_cost: 1200,
    },
  },
  {
    crop_name: 'Sharbati Wheat',
    category: 'Cereal',
    season: 'Rabi',
    default_yield_qtl_acre: 20.0,
    default_price_qtl: 2425.0,
    water_requirement_mm: 400,
    duration_days: 120,
    costs_per_acre: {
      seed_cost: 2600,
      fertilizer_cost: 4800,
      pesticide_cost: 1500,
      labour_cost: 5000,
      irrigation_cost: 2800,
      machinery_cost: 4500,
      other_cost: 1100,
    },
  },
  {
    crop_name: 'Bt Cotton',
    category: 'Cash Crop',
    season: 'Kharif',
    default_yield_qtl_acre: 10.0,
    default_price_qtl: 7521.0,
    water_requirement_mm: 700,
    duration_days: 160,
    costs_per_acre: {
      seed_cost: 4200,
      fertilizer_cost: 6500,
      pesticide_cost: 5200,
      labour_cost: 9500,
      irrigation_cost: 3000,
      machinery_cost: 4800,
      other_cost: 1800,
    },
  },
  {
    crop_name: 'Basmati Paddy',
    category: 'Cereal',
    season: 'Kharif',
    default_yield_qtl_acre: 22.0,
    default_price_qtl: 3200.0,
    water_requirement_mm: 1200,
    duration_days: 130,
    costs_per_acre: {
      seed_cost: 2200,
      fertilizer_cost: 5800,
      pesticide_cost: 2600,
      labour_cost: 8800,
      irrigation_cost: 4500,
      machinery_cost: 4600,
      other_cost: 1500,
    },
  },
  {
    crop_name: 'Groundnut',
    category: 'Oilseed',
    season: 'Kharif / Zaid',
    default_yield_qtl_acre: 11.0,
    default_price_qtl: 6783.0,
    water_requirement_mm: 500,
    duration_days: 115,
    costs_per_acre: {
      seed_cost: 5500,
      fertilizer_cost: 4100,
      pesticide_cost: 2200,
      labour_cost: 6200,
      irrigation_cost: 2000,
      machinery_cost: 3800,
      other_cost: 1400,
    },
  },
  {
    crop_name: 'Hybrid Tomato',
    category: 'Horticulture / Vegetable',
    season: 'Kharif / Rabi',
    default_yield_qtl_acre: 120.0,
    default_price_qtl: 1600.0,
    water_requirement_mm: 600,
    duration_days: 90,
    costs_per_acre: {
      seed_cost: 6000,
      fertilizer_cost: 9500,
      pesticide_cost: 7500,
      labour_cost: 14000,
      irrigation_cost: 4000,
      machinery_cost: 5500,
      other_cost: 3500,
    },
  },
  {
    crop_name: 'Green Chilli',
    category: 'Spices / Vegetable',
    season: 'Annual / Kharif',
    default_yield_qtl_acre: 45.0,
    default_price_qtl: 3400.0,
    water_requirement_mm: 650,
    duration_days: 150,
    costs_per_acre: {
      seed_cost: 4500,
      fertilizer_cost: 7200,
      pesticide_cost: 6800,
      labour_cost: 11500,
      irrigation_cost: 3500,
      machinery_cost: 4500,
      other_cost: 2500,
    },
  },
];

// Seed sample simulations for demonstration
const INITIAL_SAVED_SIMULATIONS: SimulationResponse[] = [
  {
    id: '11111111-2222-3333-4444-555555555551',
    title: 'Kharif 2026 Baseline Maize on Plot 1',
    crop_name: 'Hybrid Maize',
    area_acres: 3.0,
    seed_cost: 9600.0,
    fertilizer_cost: 16200.0,
    pesticide_cost: 6300.0,
    labour_cost: 19500.0,
    irrigation_cost: 6600.0,
    machinery_cost: 12600.0,
    other_cost: 4200.0,
    expected_yield_per_acre: 24.0,
    expected_selling_price_per_qtl: 2225.0,
    total_expenses: 75000.0,
    total_revenue: 160200.0,
    net_profit: 85200.0,
    profit_per_acre: 28400.0,
    roi_percentage: 113.6,
    breakeven_yield_per_acre: 11.24,
    breakeven_price_per_qtl: 1041.67,
    notes: 'Verified against local APMC Mandi modal rates',
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-05-10T10:00:00Z',
  },
  {
    id: '11111111-2222-3333-4444-555555555552',
    title: 'Alternative Crop: Soybean JS-335 on Plot 1',
    crop_name: 'Soybean (JS-335)',
    area_acres: 3.0,
    seed_cost: 11400.0,
    fertilizer_cost: 12600.0,
    pesticide_cost: 8400.0,
    labour_cost: 17400.0,
    irrigation_cost: 4500.0,
    machinery_cost: 11700.0,
    other_cost: 3600.0,
    expected_yield_per_acre: 12.0,
    expected_selling_price_per_qtl: 4892.0,
    total_expenses: 69600.0,
    total_revenue: 176112.0,
    net_profit: 106512.0,
    profit_per_acre: 35504.0,
    roi_percentage: 153.03,
    breakeven_yield_per_acre: 4.74,
    breakeven_price_per_qtl: 1933.33,
    notes: 'Lower water requirement, higher MSP cushion',
    created_at: '2026-05-10T10:30:00Z',
    updated_at: '2026-05-10T10:30:00Z',
  },
];

// Dynamic pure-math client calculation engine matching backend logic exactly
export function calculateLocalMetrics(scenario: SimulationCalculationInput): SimulationMetrics {
  const area = Math.max(0.01, scenario.area_acres || 1);
  const mult = scenario.is_cost_per_acre ? area : 1.0;

  const c_seed = (scenario.costs.seed_cost || 0) * mult;
  const c_fert = (scenario.costs.fertilizer_cost || 0) * mult;
  const c_pest = (scenario.costs.pesticide_cost || 0) * mult;
  const c_lab = (scenario.costs.labour_cost || 0) * mult;
  const c_irr = (scenario.costs.irrigation_cost || 0) * mult;
  const c_mach = (scenario.costs.machinery_cost || 0) * mult;
  const c_oth = (scenario.costs.other_cost || 0) * mult;

  const total_expenses = c_seed + c_fert + c_pest + c_lab + c_irr + c_mach + c_oth;
  const cost_per_acre = area > 0 ? total_expenses / area : 0;

  const total_yield_quintals = (scenario.expected_yield_per_acre || 0) * area;
  const expected_revenue = total_yield_quintals * (scenario.expected_selling_price_per_qtl || 0);
  const revenue_per_acre = area > 0 ? expected_revenue / area : 0;

  const net_profit = expected_revenue - total_expenses;
  const is_profitable = net_profit > 0;
  const profit_per_acre = area > 0 ? net_profit / area : 0;
  const roi_percentage = total_expenses > 0 ? (net_profit / total_expenses) * 100 : 0;

  const price = scenario.expected_selling_price_per_qtl || 0;
  const breakeven_yield_per_acre = price > 0 ? cost_per_acre / price : 0;
  const breakeven_price_per_qtl = total_yield_quintals > 0 ? total_expenses / total_yield_quintals : 0;

  const cost_percentages: Record<string, number> = {};
  if (total_expenses > 0) {
    cost_percentages['Seeds'] = Math.round((c_seed / total_expenses) * 1000) / 10;
    cost_percentages['Fertilisers'] = Math.round((c_fert / total_expenses) * 1000) / 10;
    cost_percentages['Pesticides'] = Math.round((c_pest / total_expenses) * 1000) / 10;
    cost_percentages['Labour'] = Math.round((c_lab / total_expenses) * 1000) / 10;
    cost_percentages['Irrigation'] = Math.round((c_irr / total_expenses) * 1000) / 10;
    cost_percentages['Machinery'] = Math.round((c_mach / total_expenses) * 1000) / 10;
    cost_percentages['Other'] = Math.round((c_oth / total_expenses) * 1000) / 10;
  }

  return {
    total_yield_quintals: Math.round(total_yield_quintals * 100) / 100,
    total_expenses: Math.round(total_expenses * 100) / 100,
    cost_per_acre: Math.round(cost_per_acre * 100) / 100,
    expected_revenue: Math.round(expected_revenue * 100) / 100,
    revenue_per_acre: Math.round(revenue_per_acre * 100) / 100,
    net_profit: Math.round(net_profit * 100) / 100,
    is_profitable,
    profit_per_acre: Math.round(profit_per_acre * 100) / 100,
    roi_percentage: Math.round(roi_percentage * 100) / 100,
    breakeven_yield_per_acre: Math.round(breakeven_yield_per_acre * 100) / 100,
    breakeven_price_per_qtl: Math.round(breakeven_price_per_qtl * 100) / 100,
    cost_percentages,
  };
}

export const profitabilityApi = {
  /**
   * Run single crop simulation
   */
  async simulate(input: SimulationCalculationInput): Promise<SimulationResult> {
    try {
      const response = await apiClient.post<SimulationResult>('/profitability/simulate', input);
      return response.data;
    } catch {
      // Local dynamic fallback
      return {
        input,
        metrics: calculateLocalMetrics(input),
      };
    }
  },

  /**
   * Run multi-crop comparison
   */
  async compare(request: MultiCropComparisonRequest): Promise<MultiCropComparisonResponse> {
    try {
      const response = await apiClient.post<MultiCropComparisonResponse>('/profitability/compare', request);
      return response.data;
    } catch {
      // Local dynamic fallback
      const results: SimulationResult[] = request.scenarios.map((scenario) => ({
        input: scenario,
        metrics: calculateLocalMetrics(scenario),
      }));

      const rankedByProfit = [...results].sort((a, b) => b.metrics.net_profit - a.metrics.net_profit);
      const rankedByRoi = [...results].sort((a, b) => b.metrics.roi_percentage - a.metrics.roi_percentage);
      const rankedByCost = [...results].sort((a, b) => a.metrics.total_expenses - b.metrics.total_expenses);

      const bestProfit = rankedByProfit[0];
      const bestRoi = rankedByRoi[0];
      const lowestCost = rankedByCost[0];

      let rec = `Among the simulated options, ${bestProfit.input.crop_name} offers the highest net return at ₹${bestProfit.metrics.net_profit.toLocaleString()} (₹${bestProfit.metrics.profit_per_acre.toLocaleString()}/acre). `;
      if (bestRoi.input.crop_name !== bestProfit.input.crop_name) {
        rec += `However, ${bestRoi.input.crop_name} delivers maximum capital efficiency with ${bestRoi.metrics.roi_percentage.toFixed(1)}% ROI and lower investment exposure.`;
      } else {
        rec += `It also leads in capital efficiency with an impressive ${bestProfit.metrics.roi_percentage.toFixed(1)}% ROI.`;
      }

      return {
        results,
        highest_profit_crop: bestProfit.input.crop_name,
        highest_roi_crop: bestRoi.input.crop_name,
        lowest_cost_crop: lowestCost.input.crop_name,
        summary_recommendation: rec,
      };
    }
  },

  /**
   * Fetch standard crop benchmarks
   */
  async getBenchmarks(): Promise<CropBaselineBenchmark[]> {
    try {
      const response = await apiClient.get<CropBaselineBenchmark[]>('/profitability/benchmarks');
      return response.data;
    } catch {
      return DEFAULT_BENCHMARKS;
    }
  },

  /**
   * Retrieve saved simulations
   */
  async getSavedSimulations(): Promise<SimulationResponse[]> {
    try {
      const response = await apiClient.get<SimulationResponse[]>('/profitability/simulations');
      return response.data;
    } catch {
      const localData = localStorage.getItem(STORAGE_KEY_SIMULATIONS);
      if (localData) {
        try {
          return JSON.parse(localData);
        } catch {
          // ignore corrupted local json
        }
      }
      return INITIAL_SAVED_SIMULATIONS;
    }
  },

  /**
   * Save a simulation run
   */
  async saveSimulation(request: SimulationSaveRequest): Promise<SimulationResponse> {
    try {
      const response = await apiClient.post<SimulationResponse>('/profitability/simulations', request);
      return response.data;
    } catch {
      // Local fallback
      const m = calculateLocalMetrics({
        crop_name: request.crop_name,
        area_acres: request.area_acres,
        costs: request.costs,
        is_cost_per_acre: request.is_cost_per_acre,
        expected_yield_per_acre: request.expected_yield_per_acre,
        expected_selling_price_per_qtl: request.expected_selling_price_per_qtl,
      });

      const mult = request.is_cost_per_acre ? request.area_acres : 1.0;
      const newSim: SimulationResponse = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'sim-' + Date.now(),
        title: request.title,
        crop_name: request.crop_name,
        area_acres: request.area_acres,
        seed_cost: (request.costs.seed_cost || 0) * mult,
        fertilizer_cost: (request.costs.fertilizer_cost || 0) * mult,
        pesticide_cost: (request.costs.pesticide_cost || 0) * mult,
        labour_cost: (request.costs.labour_cost || 0) * mult,
        irrigation_cost: (request.costs.irrigation_cost || 0) * mult,
        machinery_cost: (request.costs.machinery_cost || 0) * mult,
        other_cost: (request.costs.other_cost || 0) * mult,
        expected_yield_per_acre: request.expected_yield_per_acre,
        expected_selling_price_per_qtl: request.expected_selling_price_per_qtl,
        total_expenses: m.total_expenses,
        total_revenue: m.expected_revenue,
        net_profit: m.net_profit,
        profit_per_acre: m.profit_per_acre,
        roi_percentage: m.roi_percentage,
        breakeven_yield_per_acre: m.breakeven_yield_per_acre,
        breakeven_price_per_qtl: m.breakeven_price_per_qtl,
        notes: request.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existing = await this.getSavedSimulations();
      const updated = [newSim, ...existing];
      localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(updated));
      return newSim;
    }
  },

  /**
   * Delete a saved simulation
   */
  async deleteSimulation(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/profitability/simulations/${id}`);
      return true;
    } catch {
      const existing = await this.getSavedSimulations();
      const filtered = existing.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(filtered));
      return true;
    }
  },
};
