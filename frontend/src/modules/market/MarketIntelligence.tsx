import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import {
  MandiPriceItem,
  MandiComparisonResponse,
  HistoricalTrendsResponse,
  MarketDecisionInsight,
  MarketMetadataResponse,
} from '../../types/market';
import { marketApi, DEFAULT_MANDI_PRICES } from '../../services/marketApi';

export const MarketIntelligence: React.FC = () => {
  // Navigation sub-tabs
  const [subTab, setSubTab] = useState<'prices' | 'compare' | 'trends' | 'insights'>('prices');

  // Search and Cascading Filter State
  const [selectedCrop, setSelectedCrop] = useState<string>('Maize');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedMandi, setSelectedMandi] = useState<string>('All Mandis');

  // Data State
  const [prices, setPrices] = useState<MandiPriceItem[]>(DEFAULT_MANDI_PRICES);
  const [metadata, setMetadata] = useState<MarketMetadataResponse | null>(null);
  const [comparison, setComparison] = useState<MandiComparisonResponse | null>(null);
  const [trends, setTrends] = useState<HistoricalTrendsResponse | null>(null);
  const [insights, setInsights] = useState<MarketDecisionInsight | null>(null);

  // Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Quick crop selection chips
  const FEATURED_CROPS = [
    { name: 'Maize', icon: '🌽', label: 'Maize (Makka)' },
    { name: 'Soybean', icon: '🌱', label: 'Soybean' },
    { name: 'Onion', icon: '🧅', label: 'Onion (Nasik)' },
    { name: 'Tomato', icon: '🍅', label: 'Tomato' },
    { name: 'Wheat', icon: '🌾', label: 'Wheat (Sharbati)' },
    { name: 'Paddy', icon: '🍚', label: 'Paddy (Basmati)' },
    { name: 'Groundnut', icon: '🥜', label: 'Groundnut' },
    { name: 'Cotton', icon: '⚪', label: 'Bt Cotton' },
  ];

  // Load initial metadata and prices
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [metaData, priceData] = await Promise.all([
          marketApi.getMetadata(),
          marketApi.getPrices({ commodity: selectedCrop }),
        ]);
        setMetadata(metaData);
        setPrices(priceData);
      } catch (err) {
        console.warn('Market init warning:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch prices when filters change
  const fetchFilteredPrices = async (crop: string, state: string, district: string, mandi: string) => {
    setLoading(true);
    try {
      const p = await marketApi.getPrices({
        commodity: crop,
        state: state !== 'All States' ? state : undefined,
        district: district !== 'All Districts' ? district : undefined,
        market: mandi !== 'All Mandis' ? mandi : undefined,
      });
      setPrices(p);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison and insights when crop changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [compData, trendData, insightData] = await Promise.all([
          marketApi.compare(selectedCrop, selectedState !== 'All States' ? selectedState : undefined),
          marketApi.getTrends(selectedCrop),
          marketApi.getInsights(selectedCrop, 'Nashik APMC Yard'),
        ]);
        setComparison(compData);
        setTrends(trendData);
        setInsights(insightData);
      } catch (err) {
        console.warn('Market analytics error:', err);
      }
    };
    fetchAnalytics();
  }, [selectedCrop, selectedState]);

  // Handle Crop Change
  const handleSelectCrop = (crop: string) => {
    setSelectedCrop(crop);
    fetchFilteredPrices(crop, selectedState, selectedDistrict, selectedMandi);
  };

  // Handle State Change
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('All Districts');
    setSelectedMandi('All Mandis');
    fetchFilteredPrices(selectedCrop, state, 'All Districts', 'All Mandis');
  };

  // Handle District Change
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedMandi('All Mandis');
    fetchFilteredPrices(selectedCrop, selectedState, district, 'All Mandis');
  };

  // Handle Mandi Change
  const handleMandiChange = (mandi: string) => {
    setSelectedMandi(mandi);
    fetchFilteredPrices(selectedCrop, selectedState, selectedDistrict, mandi);
  };

  // Manual Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFilteredPrices(selectedCrop, selectedState, selectedDistrict, selectedMandi);
    try {
      const [compData, trendData, insightData] = await Promise.all([
        marketApi.compare(selectedCrop, selectedState !== 'All States' ? selectedState : undefined),
        marketApi.getTrends(selectedCrop),
        marketApi.getInsights(selectedCrop, 'Nashik APMC Yard'),
      ]);
      setComparison(compData);
      setTrends(trendData);
      setInsights(insightData);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  // Available districts for selected state
  const availableDistricts = useMemo(() => {
    if (!metadata || selectedState === 'All States') return [];
    return metadata.districts_by_state[selectedState] || [];
  }, [metadata, selectedState]);

  // Available mandis for selected district
  const availableMandis = useMemo(() => {
    if (!metadata || selectedDistrict === 'All Districts') return [];
    return metadata.mandis_by_district[selectedDistrict] || [];
  }, [metadata, selectedDistrict]);

  // Highest market price in current list
  const highestPriceRecord = useMemo(() => {
    if (!prices || prices.length === 0) return null;
    return prices.reduce((max, r) => (r.modal_price > max.modal_price ? r : max), prices[0]);
  }, [prices]);

  // Filtered prices matching search box
  const searchFilteredPrices = useMemo(() => {
    if (!searchQuery.trim()) return prices;
    const q = searchQuery.toLowerCase();
    return prices.filter(
      (p) =>
        p.commodity.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q)
    );
  }, [prices, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17301c] via-[#1e3e24] to-[#17301c] text-white rounded-2xl p-6 shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                Deliverable D21 · Smart Market Intelligence
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> AGMARKNET Verified
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Smart Agricultural Market Intelligence</span>
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Real-time APMC Mandi rates, price spreads, historical trends, and selling decision advisory 
              sourced directly from official AGMARKNET reporting to ensure farmers secure peak mandi returns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{refreshing ? 'Updating Rates...' : 'Refresh APMC Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Commodity Fast Selector Chips */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 mb-2 block">
            Select Crop Commodity:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {FEATURED_CROPS.map((crop) => {
              const active = selectedCrop === crop.name;
              return (
                <button
                  key={crop.name}
                  onClick={() => handleSelectCrop(crop.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-emerald-400 text-slate-950 shadow-sm scale-102'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span>{crop.icon}</span>
                  <span>{crop.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-800/40">
          <button
            onClick={() => setSubTab('prices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'prices'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Mandi Live Rates ({searchFilteredPrices.length})</span>
          </button>

          <button
            onClick={() => setSubTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'compare'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Inter-Mandi Comparison</span>
          </button>

          <button
            onClick={() => setSubTab('trends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'trends'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>30-Day Price Trends</span>
          </button>

          <button
            onClick={() => setSubTab('insights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'insights'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selling Decision Advisory</span>
          </button>
        </div>
      </div>

      {/* Highest Price Highlight Banner */}
      {highestPriceRecord && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs">
              ★ TOP RATE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900">
                  Peak Regional Market Price for {highestPriceRecord.commodity}:
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {highestPriceRecord.variety}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Highest prevailing modal rate is available at{' '}
                <strong className="text-slate-900">{highestPriceRecord.market}</strong> (
                {highestPriceRecord.district}, {highestPriceRecord.state}) · Last updated: {highestPriceRecord.price_date}
              </p>
            </div>
          </div>

          <div className="text-right self-stretch sm:self-auto bg-white/70 px-4 py-2 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Peak Modal Rate</span>
            <div className="text-lg font-black text-emerald-700">
              ₹{highestPriceRecord.modal_price.toLocaleString()} <span className="text-xs font-medium text-slate-500">/ qtl</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtering Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span>Mandi Filter & Geographic Search</span>
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 ml-1" />}
          </div>
          <span className="text-[10px] text-slate-500">Source: AGMARKNET Official Mandi Bulletin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search mandi, crop or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* State Dropdown */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All States">All States</option>
              {metadata?.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={selectedState === 'All States' || availableDistricts.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="All Districts">
                {selectedState === 'All States' ? 'Select State first' : 'All Districts'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi Dropdown */}
          <div>
            <select
              value={selectedMandi}
              onChange={(e) => handleMandiChange(e.target.value)}
              disabled={selectedDistrict === 'All Districts' || availableMandis.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="All Mandis">
                {selectedDistrict === 'All Districts' ? 'Select District first' : 'All Mandis'}
              </option>
              {availableMandis.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: LIVE MANDI PRICES */}
      {subTab === 'prices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchFilteredPrices.map((item, idx) => {
              const isPeak = highestPriceRecord?.market === item.market;
              return (
                <div
                  key={item.id || idx}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 relative ${
                    isPeak
                      ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Line */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-extrabold text-slate-900">{item.market}</h4>
                        {isPeak && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ★ Top Rate
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.district}, {item.state}
                      </p>
                    </div>

                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.variety}
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Min Price
                      </span>
                      <p className="text-xs font-black text-slate-700">₹{item.min_price.toLocaleString()}</p>
                    </div>

                    <div className="bg-emerald-50/80 py-1 rounded-lg border border-emerald-200/60">
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">
                        Modal Rate
                      </span>
                      <p className="text-xs font-black text-emerald-800">
                        ₹{item.modal_price.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Max Price
                      </span>
                      <p className="text-xs font-black text-slate-700">₹{item.max_price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Arrival Volume & Provenance */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Updated: {item.price_date}
                    </span>
                    <span>Daily Volume: <strong className="text-slate-700">{item.arrival_tonnes} MT</strong></span>
                  </div>

                  {/* Official Provenance Tag */}
                  <div className="text-[9px] text-emerald-800 bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> {item.source}
                    </span>
                    <span className="font-extrabold uppercase text-[8px] text-emerald-700">
                      ● Official
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {searchFilteredPrices.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No Mandi Records Matching Criteria</h4>
              <p className="text-xs text-slate-500">
                Try selecting "All States" or clearing the search text to view active regional reporting.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: INTER-MANDI COMPARISON */}
      {subTab === 'compare' && comparison && (
        <div className="space-y-5">
          {/* Recommendation Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-700 text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Inter-Mandi Arbitrage & Price Spread Analysis
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {comparison.recommendation}
                  </p>
                </div>
              </div>

              <div className="text-right whitespace-nowrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Regional Spread
                </span>
                <div className="text-base font-black text-emerald-700">
                  ₹{comparison.price_spread.toLocaleString()} <span className="text-xs font-medium">/ qtl</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Comparative Rate Table: {comparison.commodity}
                </h4>
                <p className="text-[10px] text-slate-500">Ranked from highest modal price to lowest</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                AGMARKNET Bulletin
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Mandi Market</th>
                    <th className="py-3 px-4">District & State</th>
                    <th className="py-3 px-4">Min Rate</th>
                    <th className="py-3 px-4">Modal Rate</th>
                    <th className="py-3 px-4">Max Rate</th>
                    <th className="py-3 px-4">Spread vs Peak</th>
                    <th className="py-3 px-4">Traded Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {comparison.mandis.map((m, i) => (
                    <tr key={i} className={m.is_highest ? 'bg-emerald-50/40 font-bold' : ''}>
                      <td className="py-3 px-4 text-slate-900 flex items-center gap-1.5">
                        {m.is_highest && <span className="text-amber-500">★</span>}
                        <span>{m.market}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {m.district}, {m.state}
                      </td>
                      <td className="py-3 px-4 text-slate-600">₹{m.min_price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-emerald-700">
                        ₹{m.modal_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">₹{m.max_price.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {m.is_highest ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Peak Rate
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            -₹{m.difference_from_highest.toLocaleString()} / qtl
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{m.arrival_tonnes} Tonnes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HISTORICAL PRICE TRENDS */}
      {subTab === 'trends' && trends && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  30-Day Historical Trend
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    trends.trend_direction === 'UPWARD'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trends.trend_direction === 'DOWNWARD'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {trends.trend_direction === 'UPWARD' ? '▲ Bullish (+)' : '▼ Bearish (-)'}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                {trends.commodity} Price Trajectory @ {trends.market}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{trends.summary}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500">30-Day High:</span>
                <div className="font-extrabold text-emerald-700">₹{trends.highest_period_price.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500">30-Day Low:</span>
                <div className="font-extrabold text-slate-700">₹{trends.lowest_period_price.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500">Net Change:</span>
                <div
                  className={`font-black ${
                    trends.price_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {trends.price_change_pct >= 0 ? '+' : ''}
                  {trends.price_change_pct}%
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Historical SVG Curve */}
          <div className="space-y-2">
            <div className="h-56 w-full bg-slate-50 rounded-xl p-4 border border-slate-200/80 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[40, 90, 140].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="700"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area Fill */}
                {(() => {
                  const pts = trends.trends;
                  const minP = trends.lowest_period_price * 0.95;
                  const maxP = trends.highest_period_price * 1.05;
                  const range = maxP - minP || 1;
                  const pathPoints = pts
                    .map((p, idx) => {
                      const x = (idx / (pts.length - 1)) * 680 + 10;
                      const y = 180 - ((p.modal_price - minP) / range) * 160;
                      return `${x},${y}`;
                    })
                    .join(' L ');

                  const firstX = 10;
                  const lastX = 690;
                  return (
                    <>
                      <path
                        d={`M ${firstX},180 L ${pathPoints} L ${lastX},180 Z`}
                        fill="url(#trendGradient)"
                      />
                      <path
                        d={`M ${pathPoints}`}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((p, idx) => {
                        const x = (idx / (pts.length - 1)) * 680 + 10;
                        const y = 180 - ((p.modal_price - minP) / range) * 160;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Date Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2">
              {trends.trends.slice(0, 7).map((pt, i) => (
                <span key={i}>{pt.date.slice(5)}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SELLING DECISION ADVISORY */}
      {subTab === 'insights' && insights && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Actionable Card (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">
                      AI Market Selling Decision Engine
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Optimized for {insights.commodity} harvest lots
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {insights.recommendation}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 space-y-2">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strategic Marketing Recommendation:</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {insights.actionable_advice}
                </p>
              </div>

              {/* Price Arbitrage Breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-500">Local Mandi Modal</span>
                  <div className="text-sm font-black text-slate-800">
                    ₹{insights.current_modal_price.toLocaleString()} / qtl
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{insights.current_mandi}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-700">Target Highest Mandi</span>
                  <div className="text-sm font-black text-emerald-800">
                    ₹{insights.highest_modal_price.toLocaleString()} / qtl
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-0.5">{insights.highest_mandi}</p>
                </div>
              </div>

              {/* Data Provenance & Trust */}
              <div className="p-3 rounded-xl bg-slate-50 text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700">Data Reliability & Provenance:</div>
                <p>{insights.data_freshness_note}</p>
              </div>
            </div>
          </div>

          {/* Decision Checklist & Risk Tips (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800">Farmer Selling Checklist</h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800">Check Moisture Content</strong>
                    <p className="text-[10px] text-slate-500">Mandi buyers deduct ₹30–80/qtl for moisture above 12%.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800">Assess Transportation Costs</strong>
                    <p className="text-[10px] text-slate-500">
                      Standard freight is ~₹50/qtl for 30 km. Only transport if price spread exceeds ₹100/qtl.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800">Electronic e-NAM Payments</strong>
                    <p className="text-[10px] text-slate-500">Insist on direct bank transfer or e-NAM settlement within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MarketIntelligence;
