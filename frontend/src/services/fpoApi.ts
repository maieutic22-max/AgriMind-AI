import { apiClient } from './api';
import {
  FPORecord,
  FPOCreatePayload,
  FPOMember,
  FPOMemberApplyPayload,
  FarmerProduceListing,
  ProduceListingCreatePayload,
  CollectiveProduceLot,
  PoolProduceRequestPayload,
  BuyerOffer,
  BuyerOfferCreatePayload,
  CollectiveTransaction,
  FPODashboardSummary,
} from '../types/fpo';

const DEFAULT_FPO_ID = '11111111-2222-3333-4444-555555555555';
const LOT_MAIZE_ID = '22222222-3333-4444-5555-666666666666';

// Realistic fallback seed state for instant responsiveness and offline demo
const FALLBACK_FPOS: FPORecord[] = [
  {
    id: DEFAULT_FPO_ID,
    name: 'Sahyadri Kisan Producer Company Ltd',
    registration_number: 'U01409MH2021PTC356789',
    state: 'Maharashtra',
    district: 'Nashik',
    pin_code: '422003',
    primary_crops: 'Maize, Soybean, Tomato, Onion',
    contact_person: 'Rameshwar Patil (Managing Director)',
    phone: '9822145678',
    email: 'contact@sahyadrikisanfpo.in',
    description: 'Farmer-owned collective aggregation platform uniting 450+ smallholder farmers across Dindori, Niphad and Sinnar talukas for fair price bargaining and bulk institutional supply.',
    created_at: '2026-01-10T10:00:00',
    total_members_count: 5,
    total_pooled_quintals: 350,
    total_sales_realized: 742500,
  },
];

const FALLBACK_MEMBERS: FPOMember[] = [
  {
    id: 'aaaa1111-bb22-cc33-dd44-ee5555555551',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Suresh Gaikwad',
    phone: '9822011223',
    village: 'Pimpalgaon Baswant',
    district: 'Nashik',
    land_acres: 3.5,
    primary_crops: 'Maize, Soybean',
    status: 'APPROVED',
    applied_date: '2026-02-01',
    approved_date: '2026-02-05',
    created_at: '2026-02-01T11:00:00',
  },
  {
    id: 'aaaa1111-bb22-cc33-dd44-ee5555555552',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Balasaheb Shinde',
    phone: '9822022334',
    village: 'Dindori Rural',
    district: 'Nashik',
    land_acres: 4.0,
    primary_crops: 'Tomato, Onion',
    status: 'APPROVED',
    applied_date: '2026-02-03',
    approved_date: '2026-02-07',
    created_at: '2026-02-03T14:00:00',
  },
  {
    id: 'aaaa1111-bb22-cc33-dd44-ee5555555553',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Anusaya Jadhav',
    phone: '9822033445',
    village: 'Sinnar Ghat',
    district: 'Nashik',
    land_acres: 2.5,
    primary_crops: 'Maize, Soybean',
    status: 'APPROVED',
    applied_date: '2026-02-10',
    approved_date: '2026-02-12',
    created_at: '2026-02-10T09:30:00',
  },
  {
    id: 'aaaa1111-bb22-cc33-dd44-ee5555555554',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Prakash Deshmukh',
    phone: '9822044556',
    village: 'Ozar Kasba',
    district: 'Nashik',
    land_acres: 5.0,
    primary_crops: 'Wheat, Maize',
    status: 'APPROVED',
    applied_date: '2026-02-15',
    approved_date: '2026-02-18',
    created_at: '2026-02-15T16:20:00',
  },
  {
    id: 'aaaa1111-bb22-cc33-dd44-ee5555555555',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Vilas Chavan',
    phone: '9822055667',
    village: 'Chandwad Basti',
    district: 'Nashik',
    land_acres: 2.0,
    primary_crops: 'Onion, Tomato',
    status: 'PENDING',
    applied_date: '2026-05-02',
    created_at: '2026-05-02T10:15:00',
  },
];

const FALLBACK_PRODUCE: FarmerProduceListing[] = [
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555551',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Suresh Gaikwad',
    phone: '9822011223',
    crop_name: 'Maize',
    variety: 'Hybrid Pioneer P3396',
    quantity_quintals: 65,
    asking_price_per_qtl: 2420,
    quality_grade: 'Grade A',
    harvest_date: '2026-04-20',
    status: 'POOLED',
    pooled_lot_id: LOT_MAIZE_ID,
  },
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555552',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Prakash Deshmukh',
    phone: '9822044556',
    crop_name: 'Maize',
    variety: 'Yellow Hybrid Super-90',
    quantity_quintals: 85,
    asking_price_per_qtl: 2400,
    quality_grade: 'Grade A',
    harvest_date: '2026-04-22',
    status: 'POOLED',
    pooled_lot_id: LOT_MAIZE_ID,
  },
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555553',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Anusaya Jadhav',
    phone: '9822033445',
    crop_name: 'Maize',
    variety: 'Standard Grain Grade A',
    quantity_quintals: 50,
    asking_price_per_qtl: 2450,
    quality_grade: 'Grade A',
    harvest_date: '2026-04-24',
    status: 'POOLED',
    pooled_lot_id: LOT_MAIZE_ID,
  },
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555554',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Suresh Gaikwad',
    phone: '9822011223',
    crop_name: 'Soybean',
    variety: 'JS-335 Certified',
    quantity_quintals: 40,
    asking_price_per_qtl: 4900,
    quality_grade: 'Grade A',
    harvest_date: '2026-05-10',
    status: 'AVAILABLE',
  },
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555555',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Balasaheb Shinde',
    phone: '9822022334',
    crop_name: 'Tomato',
    variety: 'Abhinav Red Premium',
    quantity_quintals: 75,
    asking_price_per_qtl: 1850,
    quality_grade: 'Grade A',
    harvest_date: '2026-05-12',
    status: 'AVAILABLE',
  },
  {
    id: 'bbbb1111-cc22-dd33-ee44-ff5555555556',
    fpo_id: DEFAULT_FPO_ID,
    farmer_name: 'Balasaheb Shinde',
    phone: '9822022334',
    crop_name: 'Onion',
    variety: 'Garwa Red Medium',
    quantity_quintals: 120,
    asking_price_per_qtl: 2100,
    quality_grade: 'Grade A',
    harvest_date: '2026-05-15',
    status: 'AVAILABLE',
  },
];

const FALLBACK_LOTS: CollectiveProduceLot[] = [
  {
    id: LOT_MAIZE_ID,
    fpo_id: DEFAULT_FPO_ID,
    lot_code: 'LOT-MAIZE-2026-01',
    crop_name: 'Maize',
    variety: 'Hybrid Yellow Commercial Grade',
    quality_grade: 'Grade A (Moisture < 12%)',
    total_quantity_quintals: 200,
    weighted_avg_asking_price: 2419,
    contributing_farmers_count: 3,
    status: 'OFFER_RECEIVED',
    notes: 'Consolidated collective lot aggregated at Niphad Aggregation Center for bulk feed mill supply.',
    created_at: '2026-04-26T12:00:00',
    highest_offer_price: 2460,
    total_offers_count: 2,
  },
  {
    id: '33333333-4444-5555-6666-777777777777',
    fpo_id: DEFAULT_FPO_ID,
    lot_code: 'LOT-SOYBEAN-2026-01',
    crop_name: 'Soybean',
    variety: 'JS-335 Cleaned',
    quality_grade: 'Grade A (Oil content > 19%)',
    total_quantity_quintals: 150,
    weighted_avg_asking_price: 4850,
    contributing_farmers_count: 2,
    status: 'COMPLETED',
    notes: 'Sold to Adani Wilmar Hub at premium price of ₹4,950/qtl.',
    created_at: '2026-04-01T10:00:00',
    highest_offer_price: 4950,
    total_offers_count: 1,
  },
];

const FALLBACK_OFFERS: BuyerOffer[] = [
  {
    id: '44444444-5555-6666-7777-888888888888',
    lot_id: LOT_MAIZE_ID,
    buyer_name: 'Cargill India Animal Nutrition Ltd',
    contact_person: 'Amit Verma (Procurement Lead)',
    phone: '9811234567',
    offered_price_per_qtl: 2460,
    quantity_quintals: 200,
    status: 'PENDING',
    offer_date: '2026-05-16',
    validity_days: 7,
    payment_terms: '100% direct bank transfer within 24h of weighbridge slip',
    notes: 'Bulk feed processing lot requirement. Ready for immediate rake loading.',
  },
  {
    id: '55555555-6666-7777-8888-999999999999',
    lot_id: LOT_MAIZE_ID,
    buyer_name: 'Godrej Agrovet Feed Mill',
    contact_person: 'Sandeep Joshi (Regional Buyer)',
    phone: '9823456789',
    offered_price_per_qtl: 2380,
    quantity_quintals: 200,
    status: 'PENDING',
    offer_date: '2026-05-17',
    validity_days: 5,
    payment_terms: 'e-NAM Escrow / 48 hrs after unloading',
    notes: 'Standard commercial terms.',
  },
];

const FALLBACK_TRANSACTIONS: CollectiveTransaction[] = [
  {
    id: '66666666-7777-8888-9999-000000000000',
    fpo_id: DEFAULT_FPO_ID,
    lot_id: '33333333-4444-5555-6666-777777777777',
    offer_id: '77777777-8888-9999-0000-111111111111',
    buyer_name: 'Adani Wilmar Edible Oils Hub',
    crop_name: 'Soybean',
    quantity_quintals: 150,
    agreed_price_per_qtl: 4950,
    total_transaction_value: 742500,
    contributing_farmers_count: 2,
    transaction_date: '2026-04-15',
    settlement_status: 'SETTLED_TO_FARMERS',
  },
];

export const fpoApi = {
  /**
   * List all FPOs
   */
  async listFPOs(): Promise<FPORecord[]> {
    try {
      const res = await apiClient.get<FPORecord[]>('/fpo');
      if (res.data && res.data.length > 0) return res.data;
      return FALLBACK_FPOS;
    } catch {
      return FALLBACK_FPOS;
    }
  },

  /**
   * Create a new FPO
   */
  async createFPO(payload: FPOCreatePayload): Promise<FPORecord> {
    try {
      const res = await apiClient.post<FPORecord>('/fpo', payload);
      return res.data;
    } catch {
      const newFpo: FPORecord = {
        id: `fpo-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        total_members_count: 0,
        total_pooled_quintals: 0,
        total_sales_realized: 0,
      };
      FALLBACK_FPOS.unshift(newFpo);
      return newFpo;
    }
  },

  /**
   * Get single FPO
   */
  async getFPO(id: string): Promise<FPORecord> {
    try {
      const res = await apiClient.get<FPORecord>(`/fpo/${id}`);
      return res.data;
    } catch {
      return FALLBACK_FPOS.find((f) => f.id === id) || FALLBACK_FPOS[0];
    }
  },

  /**
   * Get FPO dashboard summary metrics
   */
  async getDashboard(fpoId: string): Promise<FPODashboardSummary> {
    try {
      const res = await apiClient.get<FPODashboardSummary>(`/fpo/${fpoId}/dashboard`);
      return res.data;
    } catch {
      return {
        fpo_id: fpoId,
        fpo_name: 'Sahyadri Kisan Producer Company Ltd',
        total_approved_members: 4,
        pending_membership_requests: 1,
        total_available_produce_quintals: 235,
        total_pooled_produce_quintals: 200,
        active_collective_lots_count: 1,
        pending_buyer_offers_count: 2,
        total_completed_sales_value: 742500,
        total_sales_volume_quintals: 150,
      };
    }
  },

  /**
   * Register / apply for FPO membership
   */
  async applyMembership(fpoId: string, payload: FPOMemberApplyPayload): Promise<FPOMember> {
    try {
      const res = await apiClient.post<FPOMember>(`/fpo/${fpoId}/members`, payload);
      return res.data;
    } catch {
      const newMember: FPOMember = {
        id: `member-${Date.now()}`,
        fpo_id: fpoId,
        ...payload,
        status: 'PENDING',
        applied_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      FALLBACK_MEMBERS.push(newMember);
      return newMember;
    }
  },

  /**
   * List members
   */
  async listMembers(fpoId: string, status?: string): Promise<FPOMember[]> {
    try {
      const res = await apiClient.get<FPOMember[]>(`/fpo/${fpoId}/members`, {
        params: { status },
      });
      return res.data;
    } catch {
      if (!status) return FALLBACK_MEMBERS;
      return FALLBACK_MEMBERS.filter((m) => m.status === status.toUpperCase());
    }
  },

  /**
   * Approve or reject member application
   */
  async updateMemberStatus(
    fpoId: string,
    memberId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<FPOMember> {
    try {
      const res = await apiClient.put<FPOMember>(`/fpo/${fpoId}/members/${memberId}/status`, {
        status,
        rejection_reason: rejectionReason,
      });
      return res.data;
    } catch {
      const target = FALLBACK_MEMBERS.find((m) => m.id === memberId);
      if (target) {
        target.status = status;
        if (status === 'APPROVED') {
          target.approved_date = new Date().toISOString().split('T')[0];
        } else {
          target.rejection_reason = rejectionReason || 'Application rejected';
        }
        return target;
      }
      throw new Error('Member not found');
    }
  },

  /**
   * Farmer lists produce for sale
   */
  async createProduceListing(fpoId: string, payload: ProduceListingCreatePayload): Promise<FarmerProduceListing> {
    try {
      const res = await apiClient.post<FarmerProduceListing>(`/fpo/${fpoId}/produce`, payload);
      return res.data;
    } catch {
      const newProduce: FarmerProduceListing = {
        id: `produce-${Date.now()}`,
        fpo_id: fpoId,
        farmer_name: payload.farmer_name,
        phone: payload.phone,
        crop_name: payload.crop_name,
        variety: payload.variety || 'Standard',
        quantity_quintals: payload.quantity_quintals,
        asking_price_per_qtl: payload.asking_price_per_qtl,
        quality_grade: payload.quality_grade || 'Grade A',
        harvest_date: payload.harvest_date || new Date().toISOString().split('T')[0],
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      };
      FALLBACK_PRODUCE.push(newProduce);
      return newProduce;
    }
  },

  /**
   * List produce submissions
   */
  async listProduceListings(fpoId: string, status?: string, cropName?: string): Promise<FarmerProduceListing[]> {
    try {
      const res = await apiClient.get<FarmerProduceListing[]>(`/fpo/${fpoId}/produce`, {
        params: { status, crop_name: cropName },
      });
      return res.data;
    } catch {
      let result = [...FALLBACK_PRODUCE];
      if (status) {
        result = result.filter((p) => p.status === status.toUpperCase());
      }
      if (cropName) {
        result = result.filter((p) => p.crop_name.toLowerCase().includes(cropName.toLowerCase()));
      }
      return result;
    }
  },

  /**
   * Combine / pool multiple farmers' produce into one collective lot
   */
  async poolProduce(fpoId: string, payload: PoolProduceRequestPayload): Promise<CollectiveProduceLot> {
    try {
      const res = await apiClient.post<CollectiveProduceLot>(`/fpo/${fpoId}/produce/pool`, payload);
      return res.data;
    } catch {
      const selected = FALLBACK_PRODUCE.filter((p) => payload.listing_ids.includes(p.id));
      const totalQty = selected.reduce((acc, p) => acc + p.quantity_quintals, 0);
      const totalCost = selected.reduce((acc, p) => acc + p.quantity_quintals * p.asking_price_per_qtl, 0);
      const avgPrice = totalQty > 0 ? Math.round(totalCost / totalQty) : 0;
      const farmersCount = new Set(selected.map((p) => p.farmer_name)).size;
      const lotId = `lot-${Date.now()}`;

      const newLot: CollectiveProduceLot = {
        id: lotId,
        fpo_id: fpoId,
        lot_code: payload.custom_lot_code || `LOT-${payload.crop_name.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
        crop_name: payload.crop_name,
        variety: payload.variety || 'Aggregated Standard',
        quality_grade: payload.quality_grade || 'Grade A',
        total_quantity_quintals: totalQty,
        weighted_avg_asking_price: avgPrice,
        contributing_farmers_count: farmersCount,
        status: 'OPEN_FOR_BIDS',
        notes: payload.notes || `Collective lot combining produce from ${farmersCount} member farmers.`,
        created_at: new Date().toISOString(),
        total_offers_count: 0,
      };

      // Mark produce as pooled
      selected.forEach((p) => {
        p.status = 'POOLED';
        p.pooled_lot_id = lotId;
      });

      FALLBACK_LOTS.unshift(newLot);
      return newLot;
    }
  },

  /**
   * List all collective lots
   */
  async listCollectiveLots(fpoId: string, status?: string, cropName?: string): Promise<CollectiveProduceLot[]> {
    try {
      const res = await apiClient.get<CollectiveProduceLot[]>(`/fpo/${fpoId}/lots`, {
        params: { status, crop_name: cropName },
      });
      return res.data;
    } catch {
      let lots = [...FALLBACK_LOTS];
      if (status) {
        lots = lots.filter((l) => l.status === status.toUpperCase());
      }
      if (cropName) {
        lots = lots.filter((l) => l.crop_name.toLowerCase().includes(cropName.toLowerCase()));
      }
      return lots;
    }
  },

  /**
   * Get single lot
   */
  async getCollectiveLot(lotId: string): Promise<CollectiveProduceLot> {
    try {
      const res = await apiClient.get<CollectiveProduceLot>(`/fpo/lots/${lotId}`);
      return res.data;
    } catch {
      return FALLBACK_LOTS.find((l) => l.id === lotId) || FALLBACK_LOTS[0];
    }
  },

  /**
   * Submit institutional buyer offer
   */
  async createBuyerOffer(lotId: string, payload: BuyerOfferCreatePayload): Promise<BuyerOffer> {
    try {
      const res = await apiClient.post<BuyerOffer>(`/fpo/lots/${lotId}/offers`, payload);
      return res.data;
    } catch {
      const newOffer: BuyerOffer = {
        id: `offer-${Date.now()}`,
        lot_id: lotId,
        buyer_name: payload.buyer_name,
        contact_person: payload.contact_person,
        phone: payload.phone,
        offered_price_per_qtl: payload.offered_price_per_qtl,
        quantity_quintals: payload.quantity_quintals,
        status: 'PENDING',
        offer_date: new Date().toISOString().split('T')[0],
        validity_days: payload.validity_days || 7,
        payment_terms: payload.payment_terms || 'Direct Bank Transfer',
        notes: payload.notes,
        created_at: new Date().toISOString(),
      };
      FALLBACK_OFFERS.push(newOffer);
      return newOffer;
    }
  },

  /**
   * List offers for a lot
   */
  async listLotOffers(lotId: string): Promise<BuyerOffer[]> {
    try {
      const res = await apiClient.get<BuyerOffer[]>(`/fpo/lots/${lotId}/offers`);
      return res.data;
    } catch {
      return FALLBACK_OFFERS.filter((o) => o.lot_id === lotId).sort(
        (a, b) => b.offered_price_per_qtl - a.offered_price_per_qtl
      );
    }
  },

  /**
   * Accept or reject a buyer offer
   */
  async updateOfferStatus(offerId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<BuyerOffer> {
    try {
      const res = await apiClient.put<BuyerOffer>(`/fpo/offers/${offerId}/status`, { status });
      return res.data;
    } catch {
      const offer = FALLBACK_OFFERS.find((o) => o.id === offerId);
      if (offer) {
        offer.status = status;
        if (status === 'ACCEPTED') {
          const lot = FALLBACK_LOTS.find((l) => l.id === offer.lot_id);
          if (lot) {
            lot.status = 'COMPLETED';
            // Mark others rejected
            FALLBACK_OFFERS.filter((o) => o.lot_id === lot.id && o.id !== offerId).forEach((o) => {
              o.status = 'REJECTED';
            });
            // Record completed transaction
            const newTxn: CollectiveTransaction = {
              id: `txn-${Date.now()}`,
              fpo_id: lot.fpo_id,
              lot_id: lot.id,
              offer_id: offer.id,
              buyer_name: offer.buyer_name,
              crop_name: lot.crop_name,
              quantity_quintals: lot.total_quantity_quintals,
              agreed_price_per_qtl: offer.offered_price_per_qtl,
              total_transaction_value: lot.total_quantity_quintals * offer.offered_price_per_qtl,
              contributing_farmers_count: lot.contributing_farmers_count,
              transaction_date: new Date().toISOString().split('T')[0],
              settlement_status: 'SETTLED_TO_FARMERS',
            };
            FALLBACK_TRANSACTIONS.unshift(newTxn);
          }
        }
        return offer;
      }
      throw new Error('Offer not found');
    }
  },

  /**
   * List completed transactions
   */
  async listTransactions(fpoId: string): Promise<CollectiveTransaction[]> {
    try {
      const res = await apiClient.get<CollectiveTransaction[]>(`/fpo/${fpoId}/transactions`);
      return res.data;
    } catch {
      return FALLBACK_TRANSACTIONS.filter((t) => t.fpo_id === fpoId);
    }
  },
};
