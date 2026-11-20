export interface FPORecord {
  id: string;
  name: string;
  registration_number: string;
  state: string;
  district: string;
  pin_code?: string;
  primary_crops: string;
  contact_person: string;
  phone: string;
  email?: string;
  description?: string;
  created_at?: string;
  total_members_count?: number;
  total_pooled_quintals?: number;
  total_sales_realized?: number;
}

export interface FPOCreatePayload {
  name: string;
  registration_number: string;
  state: string;
  district: string;
  pin_code?: string;
  primary_crops: string;
  contact_person: string;
  phone: string;
  email?: string;
  description?: string;
}

export interface FPOMember {
  id: string;
  fpo_id: string;
  farmer_name: string;
  phone: string;
  village: string;
  district: string;
  land_acres: number;
  primary_crops: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_date?: string;
  approved_date?: string;
  rejection_reason?: string;
  created_at?: string;
}

export interface FPOMemberApplyPayload {
  farmer_name: string;
  phone: string;
  village: string;
  district: string;
  land_acres: number;
  primary_crops: string;
}

export interface FarmerProduceListing {
  id: string;
  fpo_id: string;
  member_id?: string;
  farmer_name: string;
  phone: string;
  crop_name: string;
  variety: string;
  quantity_quintals: number;
  asking_price_per_qtl: number;
  quality_grade: string;
  harvest_date?: string;
  status: 'AVAILABLE' | 'POOLED' | 'SOLD';
  pooled_lot_id?: string;
  created_at?: string;
}

export interface ProduceListingCreatePayload {
  member_id?: string;
  farmer_name: string;
  phone: string;
  crop_name: string;
  variety?: string;
  quantity_quintals: number;
  asking_price_per_qtl: number;
  quality_grade?: string;
  harvest_date?: string;
}

export interface CollectiveProduceLot {
  id: string;
  fpo_id: string;
  lot_code: string;
  crop_name: string;
  variety: string;
  quality_grade: string;
  total_quantity_quintals: number;
  weighted_avg_asking_price: number;
  contributing_farmers_count: number;
  status: 'OPEN_FOR_BIDS' | 'OFFER_RECEIVED' | 'DEAL_ACCEPTED' | 'COMPLETED';
  notes?: string;
  created_at?: string;
  highest_offer_price?: number;
  total_offers_count?: number;
}

export interface PoolProduceRequestPayload {
  crop_name: string;
  variety?: string;
  quality_grade?: string;
  listing_ids: string[];
  custom_lot_code?: string;
  notes?: string;
}

export interface BuyerOffer {
  id: string;
  lot_id: string;
  buyer_name: string;
  contact_person: string;
  phone: string;
  offered_price_per_qtl: number;
  quantity_quintals: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  offer_date?: string;
  validity_days: number;
  payment_terms: string;
  notes?: string;
  created_at?: string;
}

export interface BuyerOfferCreatePayload {
  buyer_name: string;
  contact_person: string;
  phone: string;
  offered_price_per_qtl: number;
  quantity_quintals: number;
  validity_days?: number;
  payment_terms?: string;
  notes?: string;
}

export interface CollectiveTransaction {
  id: string;
  fpo_id: string;
  lot_id: string;
  offer_id?: string;
  buyer_name: string;
  crop_name: string;
  quantity_quintals: number;
  agreed_price_per_qtl: number;
  total_transaction_value: number;
  contributing_farmers_count: number;
  transaction_date?: string;
  settlement_status: string;
  created_at?: string;
}

export interface FPODashboardSummary {
  fpo_id: string;
  fpo_name: string;
  total_approved_members: number;
  pending_membership_requests: number;
  total_available_produce_quintals: number;
  total_pooled_produce_quintals: number;
  active_collective_lots_count: number;
  pending_buyer_offers_count: number;
  total_completed_sales_value: number;
  total_sales_volume_quintals: number;
}
