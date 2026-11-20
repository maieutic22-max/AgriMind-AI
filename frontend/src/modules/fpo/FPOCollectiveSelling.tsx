import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Package,
  Handshake,
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Filter,
  AlertCircle,
  BadgeIndianRupee,
  X,
} from 'lucide-react';
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
} from '../../types/fpo';
import { fpoApi } from '../../services/fpoApi';

export const FPOCollectiveSelling: React.FC = () => {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'lots' | 'produce' | 'offers' | 'members' | 'transactions'>('lots');

  // Active FPO Selection
  const [fpos, setFpos] = useState<FPORecord[]>([]);
  const [selectedFpoId, setSelectedFpoId] = useState<string>('');
  const [dashboard, setDashboard] = useState<FPODashboardSummary | null>(null);

  // Data lists
  const [lots, setLots] = useState<CollectiveProduceLot[]>([]);
  const [produceList, setProduceList] = useState<FarmerProduceListing[]>([]);
  const [members, setMembers] = useState<FPOMember[]>([]);
  const [transactions, setTransactions] = useState<CollectiveTransaction[]>([]);
  const [lotOffersMap, setLotOffersMap] = useState<Record<string, BuyerOffer[]>>({});

  // Loading & Action states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Multi-select for produce pooling
  const [selectedProduceIds, setSelectedProduceIds] = useState<string[]>([]);
  const [poolCropFilter, setPoolCropFilter] = useState<string>('All Crops');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showCreateFPOModal, setShowCreateFPOModal] = useState<boolean>(false);
  const [showApplyMemberModal, setShowApplyMemberModal] = useState<boolean>(false);
  const [showListProduceModal, setShowListProduceModal] = useState<boolean>(false);
  const [showPoolProduceModal, setShowPoolProduceModal] = useState<boolean>(false);
  const [showAddOfferModal, setShowAddOfferModal] = useState<boolean>(false);
  const [targetLotForOffer, setTargetLotForOffer] = useState<CollectiveProduceLot | null>(null);

  // Form States
  const [fpoForm, setFpoForm] = useState<FPOCreatePayload>({
    name: '',
    registration_number: '',
    state: 'Maharashtra',
    district: 'Nashik',
    pin_code: '422003',
    primary_crops: 'Maize, Soybean, Tomato, Onion',
    contact_person: '',
    phone: '',
    email: '',
    description: '',
  });

  const [memberForm, setMemberForm] = useState<FPOMemberApplyPayload>({
    farmer_name: '',
    phone: '',
    village: '',
    district: 'Nashik',
    land_acres: 3.0,
    primary_crops: 'Maize, Soybean',
  });

  const [produceForm, setProduceForm] = useState<ProduceListingCreatePayload>({
    farmer_name: '',
    phone: '',
    crop_name: 'Maize',
    variety: 'Hybrid Pioneer',
    quantity_quintals: 50,
    asking_price_per_qtl: 2450,
    quality_grade: 'Grade A',
    harvest_date: new Date().toISOString().split('T')[0],
  });

  const [poolForm, setPoolForm] = useState<{ custom_lot_code: string; notes: string }>({
    custom_lot_code: '',
    notes: '',
  });

  const [offerForm, setOfferForm] = useState<BuyerOfferCreatePayload>({
    buyer_name: '',
    contact_person: '',
    phone: '',
    offered_price_per_qtl: 2450,
    quantity_quintals: 100,
    validity_days: 7,
    payment_terms: 'Direct Bank Transfer / 24 hrs after weighment',
    notes: '',
  });

  // Current active FPO
  const activeFpo = useMemo(() => {
    return fpos.find((f) => f.id === selectedFpoId) || fpos[0] || null;
  }, [fpos, selectedFpoId]);

  // Load initial FPO list
  useEffect(() => {
    const initFPOs = async () => {
      setLoading(true);
      try {
        const list = await fpoApi.listFPOs();
        setFpos(list);
        if (list.length > 0) {
          setSelectedFpoId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching FPOs:', err);
      } finally {
        setLoading(false);
      }
    };
    initFPOs();
  }, []);

  // Fetch FPO Data when selected FPO changes
  const loadFPOData = async (fpoId: string) => {
    if (!fpoId) return;
    setRefreshing(true);
    try {
      const [dash, lotsData, prodData, memsData, txnsData] = await Promise.all([
        fpoApi.getDashboard(fpoId),
        fpoApi.listCollectiveLots(fpoId),
        fpoApi.listProduceListings(fpoId),
        fpoApi.listMembers(fpoId),
        fpoApi.listTransactions(fpoId),
      ]);

      setDashboard(dash);
      setLots(lotsData);
      setProduceList(prodData);
      setMembers(memsData);
      setTransactions(txnsData);

      // Load offers for all lots
      const offersMap: Record<string, BuyerOffer[]> = {};
      for (const lot of lotsData) {
        try {
          const lotOffers = await fpoApi.listLotOffers(lot.id);
          offersMap[lot.id] = lotOffers;
        } catch {
          offersMap[lot.id] = [];
        }
      }
      setLotOffersMap(offersMap);
    } catch (err) {
      console.error('Failed loading FPO data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedFpoId) {
      loadFPOData(selectedFpoId);
    }
  }, [selectedFpoId]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleCreateFPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpoForm.name || !fpoForm.registration_number || !fpoForm.phone) return;
    try {
      const newFpo = await fpoApi.createFPO(fpoForm);
      setFpos((prev) => [newFpo, ...prev]);
      setSelectedFpoId(newFpo.id);
      setShowCreateFPOModal(false);
      showNotification(`Farmer Producer Organization "${newFpo.name}" successfully registered!`);
    } catch {
      alert('Failed to register FPO. Registration number may already exist.');
    }
  };

  const handleApplyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFpoId || !memberForm.farmer_name || !memberForm.phone) return;
    try {
      const newMember = await fpoApi.applyMembership(selectedFpoId, memberForm);
      setMembers((prev) => [newMember, ...prev]);
      setShowApplyMemberModal(false);
      showNotification(`Membership application submitted for ${newMember.farmer_name}. Status: PENDING admin approval.`);
      loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to submit membership application.');
    }
  };

  const handleApproveMember = async (memberId: string) => {
    if (!selectedFpoId) return;
    try {
      const updated = await fpoApi.updateMemberStatus(selectedFpoId, memberId, 'APPROVED');
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      showNotification(`Farmer ${updated.farmer_name} approved as active FPO member!`);
      loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to update membership status.');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    if (!selectedFpoId) return;
    const reason = prompt('Please enter rejection reason (optional):') || 'Criteria not met';
    try {
      const updated = await fpoApi.updateMemberStatus(selectedFpoId, memberId, 'REJECTED', reason);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      showNotification(`Application rejected for farmer.`);
      loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to reject membership.');
    }
  };

  const handleListProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFpoId || !produceForm.farmer_name || produceForm.quantity_quintals <= 0) return;
    try {
      const newProduce = await fpoApi.createProduceListing(selectedFpoId, produceForm);
      setProduceList((prev) => [newProduce, ...prev]);
      setShowListProduceModal(false);
      showNotification(`Harvest lot (${newProduce.quantity_quintals} qtl ${newProduce.crop_name}) listed successfully!`);
      loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to list produce.');
    }
  };

  // Toggle selection for pooling
  const toggleProduceSelection = (id: string) => {
    setSelectedProduceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selected produce items details
  const selectedProduceItems = useMemo(() => {
    return produceList.filter((p) => selectedProduceIds.includes(p.id));
  }, [produceList, selectedProduceIds]);

  const poolCropName = selectedProduceItems[0]?.crop_name || '';
  const poolTotalQuintals = useMemo(() => {
    return selectedProduceItems.reduce((acc, p) => acc + p.quantity_quintals, 0);
  }, [selectedProduceItems]);

  const poolWeightedAvgPrice = useMemo(() => {
    if (poolTotalQuintals <= 0) return 0;
    const totalCost = selectedProduceItems.reduce(
      (acc, p) => acc + p.quantity_quintals * p.asking_price_per_qtl,
      0
    );
    return Math.round((totalCost / poolTotalQuintals) * 100) / 100;
  }, [selectedProduceItems, poolTotalQuintals]);

  const handlePoolProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFpoId || selectedProduceIds.length === 0) return;

    // Check same crop
    const firstCrop = selectedProduceItems[0].crop_name;
    const mismatch = selectedProduceItems.some((p) => p.crop_name !== firstCrop);
    if (mismatch) {
      alert('All selected listings must be for the same crop type to create a collective lot.');
      return;
    }

    const payload: PoolProduceRequestPayload = {
      crop_name: firstCrop,
      variety: selectedProduceItems[0].variety,
      quality_grade: selectedProduceItems[0].quality_grade,
      listing_ids: selectedProduceIds,
      custom_lot_code: poolForm.custom_lot_code || undefined,
      notes: poolForm.notes || undefined,
    };

    try {
      const newLot = await fpoApi.poolProduce(selectedFpoId, payload);
      setLots((prev) => [newLot, ...prev]);
      setSelectedProduceIds([]);
      setShowPoolProduceModal(false);
      showNotification(`Successfully combined produce into collective lot "${newLot.lot_code}" (${newLot.total_quantity_quintals} qtl @ ₹${newLot.weighted_avg_asking_price}/qtl)!`);
      loadFPOData(selectedFpoId);
      setActiveSubTab('lots');
    } catch {
      alert('Failed to pool produce into collective lot.');
    }
  };

  const handleOpenAddOfferModal = (lot: CollectiveProduceLot) => {
    setTargetLotForOffer(lot);
    setOfferForm({
      buyer_name: '',
      contact_person: '',
      phone: '',
      offered_price_per_qtl: Math.round(lot.weighted_avg_asking_price * 1.02), // default attractive bid
      quantity_quintals: lot.total_quantity_quintals,
      validity_days: 7,
      payment_terms: 'Direct Bank Transfer / 24 hrs after weighment',
      notes: '',
    });
    setShowAddOfferModal(true);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLotForOffer || !offerForm.buyer_name || offerForm.offered_price_per_qtl <= 0) return;
    try {
      const newOffer = await fpoApi.createBuyerOffer(targetLotForOffer.id, offerForm);
      setLotOffersMap((prev) => ({
        ...prev,
        [targetLotForOffer.id]: [newOffer, ...(prev[targetLotForOffer.id] || [])],
      }));
      setShowAddOfferModal(false);
      showNotification(`Purchase offer recorded from ${newOffer.buyer_name} at ₹${newOffer.offered_price_per_qtl}/qtl!`);
      if (selectedFpoId) loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to record buyer offer.');
    }
  };

  const handleAcceptOffer = async (offer: BuyerOffer) => {
    if (!window.confirm(`Accept offer from "${offer.buyer_name}" at ₹${offer.offered_price_per_qtl}/qtl for this collective lot? This will finalize the deal, reject competing bids, and disburse sales records.`)) {
      return;
    }
    try {
      await fpoApi.updateOfferStatus(offer.id, 'ACCEPTED');
      showNotification(`Deal accepted with ${offer.buyer_name}! Collective transaction recorded in sales ledger.`);
      if (selectedFpoId) loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to accept offer.');
    }
  };

  const handleRejectOffer = async (offer: BuyerOffer) => {
    try {
      await fpoApi.updateOfferStatus(offer.id, 'REJECTED');
      showNotification(`Offer from ${offer.buyer_name} rejected.`);
      if (selectedFpoId) loadFPOData(selectedFpoId);
    } catch {
      alert('Failed to reject offer.');
    }
  };

  // Filtered produce
  const filteredProduce = useMemo(() => {
    return produceList.filter((p) => {
      const matchesSearch =
        p.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variety.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCrop = poolCropFilter === 'All Crops' || p.crop_name === poolCropFilter;
      return matchesSearch && matchesStatus && matchesCrop;
    });
  }, [produceList, searchTerm, statusFilter, poolCropFilter]);

  // Unique crops in produce list
  const availableCrops = useMemo(() => {
    return Array.from(new Set(produceList.map((p) => p.crop_name)));
  }, [produceList]);

  return (
    <div className="space-y-6">
      {/* ----------------- Top FPO Header & Selector ----------------- */}
      <div className="bg-gradient-to-r from-[#1e3220] via-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                FPO Collective Bargaining Engine
              </span>
              <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                Deliverable D22
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
              {activeFpo ? activeFpo.name : 'Farmer Producer Organization'}
            </h1>

            <p className="text-emerald-100/90 text-sm max-w-2xl mt-1.5 leading-relaxed">
              {activeFpo?.description ||
                'Aggregate produce from multiple smallholder farmers to negotiate higher institutional buyer prices and bypass intermediary margins.'}
            </p>

            {activeFpo && (
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-emerald-200/90">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-300" />
                  Reg No: <strong className="text-white font-mono">{activeFpo.registration_number}</strong>
                </span>
                <span>•</span>
                <span>
                  Location: <strong className="text-white">{activeFpo.district}, {activeFpo.state}</strong>
                </span>
                <span>•</span>
                <span>
                  Primary Crops: <strong className="text-white">{activeFpo.primary_crops}</strong>
                </span>
                <span>•</span>
                <span>
                  Contact: <strong className="text-white">{activeFpo.contact_person} ({activeFpo.phone})</strong>
                </span>
              </div>
            )}
          </div>

          {/* FPO Switcher & Registration Button */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <select
              value={selectedFpoId}
              onChange={(e) => setSelectedFpoId(e.target.value)}
              className="bg-white/10 text-white text-sm border border-emerald-400/40 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-md"
            >
              {fpos.map((fpo) => (
                <option key={fpo.id} value={fpo.id} className="text-slate-900 bg-white">
                  {fpo.name} ({fpo.district})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateFPOModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Register New FPO
            </button>

            <button
              onClick={() => selectedFpoId && loadFPOData(selectedFpoId)}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/20 transition-all disabled:opacity-50"
              title="Refresh FPO Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ----------------- Metric Summary Cards (Feature 10) ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Members Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Farmers
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {dashboard?.total_approved_members || members.filter((m) => m.status === 'APPROVED').length}
            </span>
            <span className="text-xs text-slate-500">active members</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {dashboard?.pending_membership_requests || members.filter((m) => m.status === 'PENDING').length} pending approval
            </span>
          </div>
        </div>

        {/* Available Harvest Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Harvest
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {dashboard?.total_available_produce_quintals?.toLocaleString() ||
                produceList
                  .filter((p) => p.status === 'AVAILABLE')
                  .reduce((a, b) => a + b.quantity_quintals, 0)
                  .toLocaleString()}{' '}
              <span className="text-base font-medium text-slate-600">qtl</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">
            Ready for collective pooling into bulk lots
          </div>
        </div>

        {/* Pooled Lots Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Collective Lots
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {lots.filter((l) => l.status === 'OPEN_FOR_BIDS' || l.status === 'OFFER_RECEIVED').length}
            </span>
            <span className="text-xs text-slate-500">
              lots ({dashboard?.total_pooled_produce_quintals || 200} qtl pooled)
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <Handshake className="w-3.5 h-3.5" />
            <span>
              {dashboard?.pending_buyer_offers_count || 2} institutional buyer bids received
            </span>
          </div>
        </div>

        {/* Realized Sales Volume & Value */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collective Sales Realized
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <BadgeIndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">
              ₹{(dashboard?.total_completed_sales_value || transactions.reduce((a, b) => a + b.total_transaction_value, 0)).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {dashboard?.total_sales_volume_quintals || transactions.reduce((a, b) => a + b.quantity_quintals, 0)} qtl settled to member farmers
            </span>
          </div>
        </div>
      </div>

      {/* ----------------- Sub-Tab Navigation Bar ----------------- */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 shadow-sm">
        <button
          onClick={() => setActiveSubTab('lots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'lots'
              ? 'bg-emerald-800 text-white shadow'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Collective Lots ({lots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('produce')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'produce'
              ? 'bg-emerald-800 text-white shadow'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Farmer Produce Listings ({produceList.length})</span>
          {selectedProduceIds.length > 0 && (
            <span className="bg-emerald-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
              {selectedProduceIds.length} selected
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('offers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'offers'
              ? 'bg-emerald-800 text-white shadow'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Buyer Offers & Bidding</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'members'
              ? 'bg-emerald-800 text-white shadow'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Roster ({members.length})</span>
          {members.filter((m) => m.status === 'PENDING').length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {members.filter((m) => m.status === 'PENDING').length} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'transactions'
              ? 'bg-emerald-800 text-white shadow'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Sales Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: COLLECTIVE POOLED LOTS (Features 5, 6, 7) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'lots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                Aggregated Collective Produce Lots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Combined harvest lots ready for bulk institutional negotiations and competitive corporate auctions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('produce')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Pool New Produce Lot
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Loading collective produce lots...</p>
            </div>
          ) : lots.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">No collective lots created yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Go to the "Farmer Produce Listings" tab to select harvest contributions from multiple farmers and pool them into a collective lot.
              </p>
              <button
                onClick={() => setActiveSubTab('produce')}
                className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                View Farmer Produce
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {lots.map((lot) => {
                const lotOffers = lotOffersMap[lot.id] || [];
                const highestBid = lotOffers.reduce(
                  (max, o) => (o.offered_price_per_qtl > max ? o.offered_price_per_qtl : max),
                  0
                );
                const bestOffer = lotOffers.find((o) => o.offered_price_per_qtl === highestBid);
                const isPremium = highestBid > lot.weighted_avg_asking_price;

                return (
                  <div
                    key={lot.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {lot.lot_code}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            lot.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : lot.status === 'OFFER_RECEIVED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : lot.status === 'DEAL_ACCEPTED'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {lot.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Title & Variety */}
                      <h3 className="text-xl font-bold text-slate-900">
                        {lot.crop_name} <span className="text-sm font-normal text-slate-600">({lot.variety})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quality: <strong className="text-slate-700">{lot.quality_grade}</strong> • Contributing Farmers:{' '}
                        <strong className="text-emerald-700">{lot.contributing_farmers_count} smallholders</strong>
                      </p>

                      {/* Quantity & Asking Price Box */}
                      <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 mt-4">
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-semibold">Total Quantity</div>
                          <div className="text-lg font-bold text-slate-800 mt-0.5">
                            {lot.total_quantity_quintals.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-slate-600">quintals</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 uppercase font-semibold">Avg Asking Price</div>
                          <div className="text-lg font-bold text-emerald-800 mt-0.5">
                            ₹{lot.weighted_avg_asking_price.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-slate-600">/ qtl</span>
                          </div>
                        </div>
                      </div>

                      {/* Offers summary */}
                      <div className="mt-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span className="font-semibold flex items-center gap-1">
                            <Handshake className="w-3.5 h-3.5 text-blue-600" />
                            Buyer Bids ({lotOffers.length})
                          </span>
                          {highestBid > 0 ? (
                            <span className={`font-bold ${isPremium ? 'text-emerald-700' : 'text-slate-700'}`}>
                              Highest: ₹{highestBid.toLocaleString()}/qtl
                              {isPremium && (
                                <span className="ml-1 text-[11px] font-semibold text-emerald-600">
                                  (+₹{Math.round(highestBid - lot.weighted_avg_asking_price)} premium)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400">Awaiting bids</span>
                          )}
                        </div>

                        {bestOffer && (
                          <div className="text-xs text-slate-600 truncate mt-1">
                            Top Bidder: <strong className="text-slate-800">{bestOffer.buyer_name}</strong>
                          </div>
                        )}
                      </div>

                      {lot.notes && (
                        <p className="text-xs text-slate-500 italic mt-2.5">
                          "{lot.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveSubTab('offers');
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        Compare Offers ({lotOffers.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {lot.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenAddOfferModal(lot)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Record Buyer Offer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: FARMER PRODUCE LISTINGS (Features 4, 5) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'produce' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                Member Farmer Harvest Listings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Farmers submit individual harvest quantities. Select multiple available lots of the same crop to pool them into a collective bulk lot.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedProduceIds.length > 0 && (
                <button
                  onClick={() => setShowPoolProduceModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md animate-pulse"
                >
                  <Layers className="w-4 h-4" />
                  Pool Selected ({selectedProduceIds.length}) into Collective Lot
                </button>
              )}

              <button
                onClick={() => setShowListProduceModal(true)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                List Harvest Produce
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search farmer name, crop, variety..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={poolCropFilter}
                  onChange={(e) => setPoolCropFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
                >
                  <option value="All Crops">All Crops</option>
                  {availableCrops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE (Unpooled)</option>
                <option value="POOLED">POOLED</option>
                <option value="SOLD">SOLD</option>
              </select>
            </div>

            {selectedProduceIds.length > 0 && (
              <div className="text-emerald-800 font-semibold flex items-center gap-2">
                <span>
                  {selectedProduceIds.length} listings ({poolTotalQuintals} qtl) selected for pooling
                </span>
                <button
                  onClick={() => setSelectedProduceIds([])}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Produce Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Crop & Variety</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Asking Price</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Quality</th>
                    <th className="p-3">Harvest Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProduce.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No farmer produce listings found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProduce.map((p) => {
                      const isSelected = selectedProduceIds.includes(p.id);
                      const isAvailable = p.status === 'AVAILABLE';

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isAvailable}
                              onChange={() => toggleProduceSelection(p.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{p.farmer_name}</div>
                            <div className="text-[11px] text-slate-400">{p.phone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{p.crop_name}</div>
                            <div className="text-[11px] text-slate-500">{p.variety}</div>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {p.quantity_quintals} <span className="font-normal text-slate-500">qtl</span>
                          </td>
                          <td className="p-3 font-semibold text-emerald-700">
                            ₹{p.asking_price_per_qtl.toLocaleString()}{' '}
                            <span className="font-normal text-slate-500">/ qtl</span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            ₹{(p.quantity_quintals * p.asking_price_per_qtl).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                              {p.quality_grade}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{p.harvest_date || 'Recent'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                p.status === 'AVAILABLE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'POOLED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 3: BUYER OFFERS & NEGOTIATIONS (Features 7, 8) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'offers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-emerald-700" />
              Institutional Buyer Offers & Bid Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review competing bids from agribusinesses, processors, and exporters. Compare offered rates against the lot's weighted asking price. Accept the best offer to execute the deal.
            </p>
          </div>

          {lots.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              No collective lots available. Please create a lot first.
            </div>
          ) : (
            lots.map((lot) => {
              const offers = lotOffersMap[lot.id] || [];
              const highestOffer = offers.reduce(
                (max, o) => (o.offered_price_per_qtl > max ? o.offered_price_per_qtl : max),
                0
              );

              return (
                <div key={lot.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  {/* Lot Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {lot.lot_code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {lot.crop_name} ({lot.variety})
                        </h3>
                        <span className="text-xs text-slate-500">• {lot.total_quantity_quintals} quintals</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Weighted Asking Price: <strong className="text-emerald-800">₹{lot.weighted_avg_asking_price.toLocaleString()}/qtl</strong> • Status:{' '}
                        <span className="font-semibold text-slate-800">{lot.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {lot.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleOpenAddOfferModal(lot)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record New Buyer Offer
                      </button>
                    )}
                  </div>

                  {/* Offers Matrix */}
                  {offers.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg text-xs text-slate-500">
                      No purchase offers recorded for this lot yet. Click "Record New Buyer Offer" above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {offers.map((offer) => {
                        const priceDiff = offer.offered_price_per_qtl - lot.weighted_avg_asking_price;
                        const isHighest = offer.offered_price_per_qtl === highestOffer && offers.length > 1;

                        return (
                          <div
                            key={offer.id}
                            className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                                : isHighest
                                ? 'bg-blue-50/50 border-blue-300'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <h4 className="font-bold text-slate-900 text-sm truncate" title={offer.buyer_name}>
                                  {offer.buyer_name}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    offer.status === 'ACCEPTED'
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : offer.status === 'REJECTED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {offer.status}
                                </span>
                              </div>

                              <div className="text-xs text-slate-500">
                                Contact: {offer.contact_person} ({offer.phone})
                              </div>

                              <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-200/80">
                                <div className="text-[11px] text-slate-500 uppercase font-semibold">Offered Rate</div>
                                <div className="text-xl font-extrabold text-slate-900 flex items-baseline gap-1 mt-0.5">
                                  ₹{offer.offered_price_per_qtl.toLocaleString()}
                                  <span className="text-xs font-normal text-slate-500">/ qtl</span>
                                </div>

                                <div
                                  className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                                    priceDiff >= 0 ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {priceDiff >= 0 ? (
                                    <>
                                      <TrendingUp className="w-3.5 h-3.5" />
                                      <span>+₹{Math.round(priceDiff)}/qtl premium vs ask</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>-₹{Math.abs(Math.round(priceDiff))}/qtl discount vs ask</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                                <div>Total Value: ₹{(offer.offered_price_per_qtl * lot.total_quantity_quintals).toLocaleString()}</div>
                                <div>Terms: {offer.payment_terms}</div>
                                <div>Validity: {offer.validity_days} days</div>
                                {offer.notes && <div className="italic text-slate-600">"{offer.notes}"</div>}
                              </div>
                            </div>

                            {/* Offer Decision Actions (Feature 8) */}
                            {offer.status === 'PENDING' && lot.status !== 'COMPLETED' && (
                              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptOffer(offer)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Accept Offer
                                </button>
                                <button
                                  onClick={() => handleRejectOffer(offer)}
                                  className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {offer.status === 'ACCEPTED' && (
                              <div className="mt-3 text-xs text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-100/60 p-2 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Deal accepted & registered in sales ledger!
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 4: MEMBER ROSTER & APPROVALS (Features 2, 3) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                Farmer Membership & Approval Roster
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Farmers apply to join the collective. Administrators verify landholding details and approve or reject membership requests.
              </p>
            </div>

            <button
              onClick={() => setShowApplyMemberModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Farmer Membership Application
            </button>
          </div>

          {/* Pending Approval Section */}
          {members.filter((m) => m.status === 'PENDING').length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Membership Applications Awaiting Administrator Action
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {members
                  .filter((m) => m.status === 'PENDING')
                  .map((mem) => (
                    <div
                      key={mem.id}
                      className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{mem.farmer_name}</h4>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            PENDING
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Phone: <strong className="text-slate-700">{mem.phone}</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                          Village: <strong className="text-slate-700">{mem.village}, {mem.district}</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                          Cultivated Land: <strong className="text-emerald-700">{mem.land_acres} acres</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                          Primary Crops: <strong className="text-slate-700">{mem.primary_crops}</strong>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleApproveMember(mem.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMember(mem.id)}
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Approved Members List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Approved Member Roster ({members.filter((m) => m.status === 'APPROVED').length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Village / District</th>
                    <th className="p-3">Landholding</th>
                    <th className="p-3">Primary Crops</th>
                    <th className="p-3">Membership Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{m.farmer_name}</td>
                      <td className="p-3 text-slate-600">{m.phone}</td>
                      <td className="p-3 text-slate-600">
                        {m.village}, {m.district}
                      </td>
                      <td className="p-3 font-medium text-emerald-800">{m.land_acres} acres</td>
                      <td className="p-3 text-slate-600">{m.primary_crops}</td>
                      <td className="p-3 text-slate-500">{m.approved_date || m.applied_date}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            m.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 5: SALES LEDGER & TRANSACTIONS (Feature 9) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
              Collective Selling Deals & Payout Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official audit log of completed institutional purchase orders, realized prices, and direct benefit distributions to contributing farmers.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Deal Date</th>
                    <th className="p-3">Buyer Company</th>
                    <th className="p-3">Crop</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Agreed Price</th>
                    <th className="p-3">Total Deal Value</th>
                    <th className="p-3">Farmers Paid</th>
                    <th className="p-3">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No completed sales recorded yet. Accept buyer offers on collective lots to execute transactions.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-mono">{t.transaction_date}</td>
                        <td className="p-3 font-bold text-slate-800">{t.buyer_name}</td>
                        <td className="p-3 font-semibold text-slate-700">{t.crop_name}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {t.quantity_quintals} <span className="font-normal text-slate-500">qtl</span>
                        </td>
                        <td className="p-3 font-semibold text-emerald-700">
                          ₹{t.agreed_price_per_qtl.toLocaleString()}/qtl
                        </td>
                        <td className="p-3 font-extrabold text-emerald-800">
                          ₹{t.total_transaction_value.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {t.contributing_farmers_count} farmers
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            {t.settlement_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 1: REGISTER NEW FPO */}
      {/* ---------------------------------------------------------------------- */}
      {showCreateFPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                Register Farmer Producer Organization
              </h3>
              <button
                onClick={() => setShowCreateFPOModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFPO} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">FPO Legal Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahyadri Kisan Producer Company Ltd"
                  value={fpoForm.name}
                  onChange={(e) => setFpoForm({ ...fpoForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registration / CIN No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U01409MH2021PTC356789"
                    value={fpoForm.registration_number}
                    onChange={(e) => setFpoForm({ ...fpoForm, registration_number: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={fpoForm.district}
                    onChange={(e) => setFpoForm({ ...fpoForm, district: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Managing Director / Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fpoForm.contact_person}
                    onChange={(e) => setFpoForm({ ...fpoForm, contact_person: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit phone"
                    value={fpoForm.phone}
                    onChange={(e) => setFpoForm({ ...fpoForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Commodities Handled *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maize, Soybean, Tomato, Onion"
                  value={fpoForm.primary_crops}
                  onChange={(e) => setFpoForm({ ...fpoForm, primary_crops: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mission / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe collective purpose and talukas served..."
                  value={fpoForm.description || ''}
                  onChange={(e) => setFpoForm({ ...fpoForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFPOModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  Register FPO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 2: FARMER MEMBERSHIP APPLICATION (Feature 2) */}
      {/* ---------------------------------------------------------------------- */}
      {showApplyMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                Farmer Membership Application
              </h3>
              <button
                onClick={() => setShowApplyMemberModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={memberForm.farmer_name}
                  onChange={(e) => setMemberForm({ ...memberForm, farmer_name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit number"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Landholding (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={memberForm.land_acres}
                    onChange={(e) => setMemberForm({ ...memberForm, land_acres: parseFloat(e.target.value) || 1.0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Village *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pimpalgaon"
                    value={memberForm.village}
                    onChange={(e) => setMemberForm({ ...memberForm, village: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.district}
                    onChange={(e) => setMemberForm({ ...memberForm, district: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cultivated Crops *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maize, Soybean, Tomato"
                  value={memberForm.primary_crops}
                  onChange={(e) => setMemberForm({ ...memberForm, primary_crops: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyMemberModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 3: LIST PRODUCE HARVEST (Feature 4) */}
      {/* ---------------------------------------------------------------------- */}
      {showListProduceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                List Produce for Collective Selling
              </h3>
              <button
                onClick={() => setShowListProduceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleListProduce} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Farmer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Gaikwad"
                  value={produceForm.farmer_name}
                  onChange={(e) => setProduceForm({ ...produceForm, farmer_name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={produceForm.phone}
                    onChange={(e) => setProduceForm({ ...produceForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Crop Type *</label>
                  <select
                    value={produceForm.crop_name}
                    onChange={(e) => setProduceForm({ ...produceForm, crop_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Maize">Maize (Makka)</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Paddy">Paddy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Variety / Grade *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pioneer Hybrid"
                    value={produceForm.variety}
                    onChange={(e) => setProduceForm({ ...produceForm, variety: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quality Grade</label>
                  <select
                    value={produceForm.quality_grade}
                    onChange={(e) => setProduceForm({ ...produceForm, quality_grade: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Fair Average">Fair Average Quality (FAQ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Available Quantity (Quintals) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={produceForm.quantity_quintals}
                    onChange={(e) => setProduceForm({ ...produceForm, quantity_quintals: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Asking Price (₹/qtl) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={produceForm.asking_price_per_qtl}
                    onChange={(e) => setProduceForm({ ...produceForm, asking_price_per_qtl: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Expected Farmer Payout:</span>
                <span className="font-bold text-emerald-800 text-sm">
                  ₹{(produceForm.quantity_quintals * produceForm.asking_price_per_qtl).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListProduceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  List Produce Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 4: POOL PRODUCE INTO COLLECTIVE LOT (Features 5, 6) */}
      {/* ---------------------------------------------------------------------- */}
      {showPoolProduceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                Combine Produce into Collective Lot
              </h3>
              <button
                onClick={() => setShowPoolProduceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePoolProduce} className="space-y-4 text-xs">
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="text-xs font-semibold text-emerald-900 uppercase">
                  Aggregated Lot Calculations
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Crop Commodity:</span>
                    <div className="font-bold text-slate-800 text-sm">{poolCropName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contributing Farmers:</span>
                    <div className="font-bold text-slate-800 text-sm">
                      {new Set(selectedProduceItems.map((p) => p.farmer_name)).size} members
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Quantity:</span>
                    <div className="font-bold text-emerald-800 text-base">
                      {poolTotalQuintals} quintals
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Weighted Avg Asking Price:</span>
                    <div className="font-bold text-emerald-800 text-base">
                      ₹{poolWeightedAvgPrice.toLocaleString()} / qtl
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 text-slate-600 text-[11px]">
                  Total Consolidated Value: <strong className="text-slate-800">₹{(poolTotalQuintals * poolWeightedAvgPrice).toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Custom Lot Code (Optional)</label>
                <input
                  type="text"
                  placeholder={`e.g. LOT-${poolCropName.toUpperCase()}-${new Date().getFullYear()}-01`}
                  value={poolForm.custom_lot_code}
                  onChange={(e) => setPoolForm({ ...poolForm, custom_lot_code: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Auction / Aggregation Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High starch commercial grade lot ready at Niphad center..."
                  value={poolForm.notes}
                  onChange={(e) => setPoolForm({ ...poolForm, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoolProduceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Create Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 5: RECORD BUYER PURCHASE OFFER (Feature 7) */}
      {/* ---------------------------------------------------------------------- */}
      {showAddOfferModal && targetLotForOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-emerald-700" />
                Record Buyer Purchase Offer
              </h3>
              <button
                onClick={() => setShowAddOfferModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              Lot: <strong className="font-mono text-slate-800">{targetLotForOffer.lot_code}</strong> ({targetLotForOffer.crop_name}, {targetLotForOffer.total_quantity_quintals} qtl) • Ask Rate: <strong className="text-emerald-700">₹{targetLotForOffer.weighted_avg_asking_price}/qtl</strong>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Buyer / Institutional Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cargill India / ITC Agri / Godrej Agrovet"
                  value={offerForm.buyer_name}
                  onChange={(e) => setOfferForm({ ...offerForm, buyer_name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Procurement Officer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Officer Name"
                    value={offerForm.contact_person}
                    onChange={(e) => setOfferForm({ ...offerForm, contact_person: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Buyer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={offerForm.phone}
                    onChange={(e) => setOfferForm({ ...offerForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Offered Price (₹/qtl) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={offerForm.offered_price_per_qtl}
                    onChange={(e) => setOfferForm({ ...offerForm, offered_price_per_qtl: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Required Quantity (qtl) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={offerForm.quantity_quintals}
                    onChange={(e) => setOfferForm({ ...offerForm, quantity_quintals: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment & Delivery Terms</label>
                <input
                  type="text"
                  value={offerForm.payment_terms || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, payment_terms: e.target.value })}
                  placeholder="e.g. 100% direct bank transfer within 24h of weighment"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  Record Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
