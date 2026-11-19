export interface CropCostBreakdown {
  seed_cost: number;
  fertilizer_cost: number;
  pesticide_cost: number;
  labour_cost: number;
  irrigation_cost: number;
  machinery_cost: number;
  other_cost: number;
}

export interface CropBaselineBenchmark {
  crop_name: string;
  category: string;
  season: string;
  default_yield_qtl_acre: number;
  default_price_qtl: number;
  costs_per_acre: CropCostBreakdown;
  water_requirement_mm: number;
  duration_days: number;
}

export interface SimulationCalculationInput {
  crop_name: string;
  area_acres: number;
  costs: CropCostBreakdown;
  is_cost_per_acre: boolean;
  expected_yield_per_acre: number;
  expected_selling_price_per_qtl: number;
  title?: string;
  notes?: string;
}

export interface SimulationMetrics {
  total_yield_quintals: number;
  total_expenses: number;
  cost_per_acre: number;
  expected_revenue: number;
  revenue_per_acre: number;
  net_profit: number;
  is_profitable: boolean;
  profit_per_acre: number;
  roi_percentage: number;
  breakeven_yield_per_acre: number;
  breakeven_price_per_qtl: number;
  cost_percentages: Record<string, number>;
}

export interface SimulationResult {
  input: SimulationCalculationInput;
  metrics: SimulationMetrics;
}

export interface MultiCropComparisonRequest {
  scenarios: SimulationCalculationInput[];
}

export interface MultiCropComparisonResponse {
  results: SimulationResult[];
  highest_profit_crop: string;
  highest_roi_crop: string;
  lowest_cost_crop: string;
  summary_recommendation: string;
}

export interface SimulationSaveRequest {
  farm_id?: string;
  title: string;
  crop_name: string;
  area_acres: number;
  costs: CropCostBreakdown;
  is_cost_per_acre: boolean;
  expected_yield_per_acre: number;
  expected_selling_price_per_qtl: number;
  notes?: string;
  comparison_crops?: string[];
}

export interface SimulationResponse {
  id: string;
  farm_id?: string;
  title: string;
  crop_name: string;
  area_acres: number;
  seed_cost: number;
  fertilizer_cost: number;
  pesticide_cost: number;
  labour_cost: number;
  irrigation_cost: number;
  machinery_cost: number;
  other_cost: number;
  expected_yield_per_acre: number;
  expected_selling_price_per_qtl: number;
  total_expenses: number;
  total_revenue: number;
  net_profit: number;
  profit_per_acre: number;
  roi_percentage: number;
  breakeven_yield_per_acre?: number;
  breakeven_price_per_qtl?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
