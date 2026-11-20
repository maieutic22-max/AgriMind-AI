export interface MandiPriceItem {
  id?: string;
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_tonnes: number;
  price_date: string;
  source: string;
  data_status: 'verified_agmarknet' | 'delayed' | 'unavailable' | string;
}

export interface MandiComparisonItem {
  market: string;
  district: string;
  state: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_tonnes: number;
  difference_from_highest: number;
  is_highest: boolean;
  price_date: string;
}

export interface MandiComparisonResponse {
  commodity: string;
  highest_price: number;
  highest_mandi: string;
  highest_mandi_district: string;
  lowest_price: number;
  lowest_mandi: string;
  price_spread: number;
  mandis: MandiComparisonItem[];
  recommendation: string;
}

export interface HistoricalPricePoint {
  date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_tonnes: number;
}

export interface HistoricalTrendsResponse {
  commodity: string;
  market: string;
  trends: HistoricalPricePoint[];
  trend_direction: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  price_change_pct: number;
  highest_period_price: number;
  lowest_period_price: number;
  summary: string;
}

export interface MarketDecisionInsight {
  commodity: string;
  current_mandi: string;
  current_modal_price: number;
  highest_mandi: string;
  highest_modal_price: number;
  price_advantage_per_qtl: number;
  recommendation: string;
  actionable_advice: string;
  price_trend: string;
  data_freshness_note: string;
}

export interface MarketMetadataResponse {
  commodities: string[];
  states: string[];
  districts_by_state: Record<string, string[]>;
  mandis_by_district: Record<string, string[]>;
}
