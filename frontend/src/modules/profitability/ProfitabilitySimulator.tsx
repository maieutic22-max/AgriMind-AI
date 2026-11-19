import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  Scale,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle2,
  BarChart3,
  IndianRupee,
  Sprout,
  ArrowRight,
  Sparkles,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  CropBaselineBenchmark,
  CropCostBreakdown,
  SimulationCalculationInput,
  SimulationMetrics,
  SimulationResponse,
  MultiCropComparisonResponse,
} from '../../types/profitability';
import {
  profitabilityApi,
  DEFAULT_BENCHMARKS,
  calculateLocalMetrics,
} from '../../services/profitabilityApi';

export const ProfitabilitySimulator: React.FC = () => {
  // Navigation tabs inside simulator
  const [activeTab, setActiveTab] = useState<'single' | 'compare' | 'saved'>('single');

  // Benchmarks
  const [benchmarks, setBenchmarks] = useState<CropBaselineBenchmark[]>(DEFAULT_BENCHMARKS);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);

  // Single Crop Simulation State
  const [cropName, setCropName] = useState<string>('Hybrid Maize');
  const [customCrop, setCustomCrop] = useState<string>('');
  const [areaAcres, setAreaAcres] = useState<number>(3.0);
  const [isCostPerAcre, setIsCostPerAcre] = useState<boolean>(true);
  const [costs, setCosts] = useState<CropCostBreakdown>({
    seed_cost: 3200,
    fertilizer_cost: 5400,
    pesticide_cost: 2100,
    labour_cost: 6500,
    irrigation_cost: 2200,
    machinery_cost: 4200,
    other_cost: 1400,
  });
  const [expectedYield, setExpectedYield] = useState<number>(24.0);
  const [sellingPrice, setSellingPrice] = useState<number>(2225.0);

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Saved simulations state
  const [savedSimulations, setSavedSimulations] = useState<SimulationResponse[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Multi-crop comparison state
  const [comparisonCrops, setComparisonCrops] = useState<SimulationCalculationInput[]>([
    {
      crop_name: 'Hybrid Maize',
      area_acres: 3.0,
      is_cost_per_acre: true,
      costs: {
        seed_cost: 3200,
        fertilizer_cost: 5400,
        pesticide_cost: 2100,
        labour_cost: 6500,
        irrigation_cost: 2200,
        machinery_cost: 4200,
        other_cost: 1400,
      },
      expected_yield_per_acre: 24.0,
      expected_selling_price_per_qtl: 2225.0,
    },
    {
      crop_name: 'Soybean (JS-335)',
      area_acres: 3.0,
      is_cost_per_acre: true,
      costs: {
        seed_cost: 3800,
        fertilizer_cost: 4200,
        pesticide_cost: 2800,
        labour_cost: 5800,
        irrigation_cost: 1500,
        machinery_cost: 3900,
        other_cost: 1200,
      },
      expected_yield_per_acre: 12.0,
      expected_selling_price_per_qtl: 4892.0,
    },
    {
      crop_name: 'Groundnut',
      area_acres: 3.0,
      is_cost_per_acre: true,
      costs: {
        seed_cost: 5500,
        fertilizer_cost: 4100,
        pesticide_cost: 2200,
        labour_cost: 6200,
        irrigation_cost: 2000,
        machinery_cost: 3800,
        other_cost: 1400,
      },
      expected_yield_per_acre: 11.0,
      expected_selling_price_per_qtl: 6783.0,
    },
  ]);
  const [comparisonResult, setComparisonResult] = useState<MultiCropComparisonResponse | null>(null);
  const [comparing, setComparing] = useState(false);

  // Load benchmarks and saved simulations on mount
  useEffect(() => {
    const init = async () => {
      setLoadingBenchmarks(true);
      try {
        const benchData = await profitabilityApi.getBenchmarks();
        if (benchData && benchData.length > 0) {
          setBenchmarks(benchData);
        }
      } catch (err) {
        console.warn('Using default benchmarks:', err);
      } finally {
        setLoadingBenchmarks(false);
      }

      loadSavedSimulations();
    };

    init();
  }, []);

  const loadSavedSimulations = async () => {
    setLoadingSaved(true);
    try {
      const data = await profitabilityApi.getSavedSimulations();
      setSavedSimulations(data);
    } catch (err) {
      console.warn('Error loading saved simulations:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  // When crop selection changes, optionally auto-fill from benchmarks
  const handleSelectCrop = (selected: string) => {
    setCropName(selected);
    if (selected === 'Custom') {
      return;
    }
    const found = benchmarks.find((b) => b.crop_name === selected);
    if (found) {
      setExpectedYield(found.default_yield_qtl_acre);
      setSellingPrice(found.default_price_qtl);
      setCosts({ ...found.costs_per_acre });
      setIsCostPerAcre(true);
    }
  };

  // Real-time dynamic calculation for Single Crop
  const currentInput: SimulationCalculationInput = useMemo(() => {
    return {
      crop_name: cropName === 'Custom' ? customCrop || 'Custom Crop' : cropName,
      area_acres: Number(areaAcres) || 1,
      is_cost_per_acre: isCostPerAcre,
      costs: {
        seed_cost: Number(costs.seed_cost) || 0,
        fertilizer_cost: Number(costs.fertilizer_cost) || 0,
        pesticide_cost: Number(costs.pesticide_cost) || 0,
        labour_cost: Number(costs.labour_cost) || 0,
        irrigation_cost: Number(costs.irrigation_cost) || 0,
        machinery_cost: Number(costs.machinery_cost) || 0,
        other_cost: Number(costs.other_cost) || 0,
      },
      expected_yield_per_acre: Number(expectedYield) || 0,
      expected_selling_price_per_qtl: Number(sellingPrice) || 0,
    };
  }, [cropName, customCrop, areaAcres, isCostPerAcre, costs, expectedYield, sellingPrice]);

  const metrics: SimulationMetrics = useMemo(() => {
    return calculateLocalMetrics(currentInput);
  }, [currentInput]);

  // Handle saving the simulation
  const handleSaveSimulation = async () => {
    if (!saveTitle.trim()) {
      alert('Please provide a title for this simulation.');
      return;
    }
    setSaving(true);
    try {
      await profitabilityApi.saveSimulation({
        title: saveTitle.trim(),
        crop_name: currentInput.crop_name,
        area_acres: currentInput.area_acres,
        is_cost_per_acre: currentInput.is_cost_per_acre,
        costs: currentInput.costs,
        expected_yield_per_acre: currentInput.expected_yield_per_acre,
        expected_selling_price_per_qtl: currentInput.expected_selling_price_per_qtl,
        notes: saveNotes.trim() || undefined,
      });
      setSaveSuccessMessage('Simulation successfully saved!');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
      setIsSaveModalOpen(false);
      setSaveTitle('');
      setSaveNotes('');
      await loadSavedSimulations();
    } catch (err) {
      console.error('Failed to save simulation:', err);
      alert('Failed to save simulation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting saved simulation
  const handleDeleteSimulation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved simulation?')) {
      await profitabilityApi.deleteSimulation(id);
      await loadSavedSimulations();
    }
  };

  // Load saved scenario back into simulator
  const handleLoadSavedScenario = (sim: SimulationResponse) => {
    setCropName(sim.crop_name);
    setAreaAcres(sim.area_acres);
    setIsCostPerAcre(false); // Saved costs are total expenses
    setCosts({
      seed_cost: sim.seed_cost,
      fertilizer_cost: sim.fertilizer_cost,
      pesticide_cost: sim.pesticide_cost,
      labour_cost: sim.labour_cost,
      irrigation_cost: sim.irrigation_cost,
      machinery_cost: sim.machinery_cost,
      other_cost: sim.other_cost,
    });
    setExpectedYield(sim.expected_yield_per_acre);
    setSellingPrice(sim.expected_selling_price_per_qtl);
    setActiveTab('single');
  };

  // Run multi-crop comparison
  const runComparison = async () => {
    setComparing(true);
    try {
      const res = await profitabilityApi.compare({ scenarios: comparisonCrops });
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setComparing(false);
    }
  };

  // Run comparison automatically when switching to compare tab or comparison crops change
  useEffect(() => {
    if (activeTab === 'compare') {
      runComparison();
    }
  }, [activeTab, comparisonCrops]);

  const handleAddComparisonCrop = (benchmarkName: string) => {
    if (comparisonCrops.length >= 5) {
      alert('You can compare up to 5 crops simultaneously.');
      return;
    }
    const bench = benchmarks.find((b) => b.crop_name === benchmarkName);
    if (!bench) return;

    const newScenario: SimulationCalculationInput = {
      crop_name: bench.crop_name,
      area_acres: areaAcres,
      is_cost_per_acre: true,
      costs: { ...bench.costs_per_acre },
      expected_yield_per_acre: bench.default_yield_qtl_acre,
      expected_selling_price_per_qtl: bench.default_price_qtl,
    };
    setComparisonCrops([...comparisonCrops, newScenario]);
  };

  const handleRemoveComparisonCrop = (index: number) => {
    if (comparisonCrops.length <= 2) {
      alert('Please keep at least 2 crops for comparison.');
      return;
    }
    setComparisonCrops(comparisonCrops.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Module Sub-Header */}
      <div className="bg-gradient-to-r from-[#1e3220] via-emerald-900 to-[#1e3220] text-white rounded-2xl p-6 shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                Deliverable D20 · Decision Support
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                Interactive Economic Model
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              <span>Farm Profitability Simulator</span>
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Simulate investment returns across crop options, evaluate breakeven points against APMC Mandi rates, 
              and optimize cultivation strategy for maximum net income per acre.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setSaveTitle(`${currentInput.crop_name} Scenario (${currentInput.area_acres} Acres)`);
                setIsSaveModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>

        {/* Simulator Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-emerald-800/60">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Single Crop Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Multi-Crop Comparison ({comparisonCrops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Saved Scenarios ({savedSimulations.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* TAB 1: Single Crop Simulation */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">Crop & Land Parameters</h3>
                    <p className="text-[10px] text-slate-500">Select standard benchmark or custom</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Step 1 & 2
                </span>
              </div>

              {/* Crop Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Target Crop</span>
                  {cropName !== 'Custom' && (
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {loadingBenchmarks ? 'Loading...' : 'Benchmark loaded'}
                    </span>
                  )}
                </label>
                <select
                  value={cropName}
                  onChange={(e) => handleSelectCrop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {benchmarks.map((b) => (
                    <option key={b.crop_name} value={b.crop_name}>
                      {b.crop_name} ({b.season} · {b.category})
                    </option>
                  ))}
                  <option value="Custom">+ Custom / Other Crop</option>
                </select>
              </div>

              {/* Custom Crop Input */}
              {cropName === 'Custom' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-700">Enter Custom Crop Name</label>
                  <input
                    type="text"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="e.g. Organic Pomegranate, Sunflower"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Farm Area Slider & Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Cultivated Farm Area</label>
                  <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(Math.max(0.1, Number(e.target.value)))}
                      className="w-14 text-center font-extrabold text-xs text-slate-900 bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-500">Acres</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>0.5 Acre</span>
                  <span>5 Acres</span>
                  <span>10 Acres</span>
                  <span>20 Acres</span>
                </div>
              </div>
            </div>

            {/* Granular Cost Breakdown Inputs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">Operational Input Costs</h3>
                    <p className="text-[10px] text-slate-500">Granular seeds, inputs & machine expenses</p>
                  </div>
                </div>

                {/* Per Acre vs Total Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCostPerAcre(true)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      isCostPerAcre
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Per Acre
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCostPerAcre(false)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      !isCostPerAcre
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Total Farm
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Seed Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    🌱 Seeds / Seedlings
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.seed_cost}
                      onChange={(e) => setCosts({ ...costs, seed_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Fertilizer Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    🧪 Fertilizers & Nutrients
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.fertilizer_cost}
                      onChange={(e) => setCosts({ ...costs, fertilizer_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Pesticides Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    🛡️ Pesticides & Protection
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.pesticide_cost}
                      onChange={(e) => setCosts({ ...costs, pesticide_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Labour Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    👥 Farm Labour & Sowing
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.labour_cost}
                      onChange={(e) => setCosts({ ...costs, labour_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Irrigation Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    💧 Irrigation & Electricity
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.irrigation_cost}
                      onChange={(e) => setCosts({ ...costs, irrigation_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Machinery Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    🚜 Machinery & Tractor Fuel
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.machinery_cost}
                      onChange={(e) => setCosts({ ...costs, machinery_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Other Cost */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1">
                    📦 Transport & Land Prep
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={costs.other_cost}
                      onChange={(e) => setCosts({ ...costs, other_cost: Number(e.target.value) })}
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Yield & Selling Price */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">Production & Market Returns</h3>
                    <p className="text-[10px] text-slate-500">Anticipated harvest output & selling price</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Step 3
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Yield per Acre</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={expectedYield}
                      onChange={(e) => setExpectedYield(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                      qtl/acre
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Total: <strong className="text-slate-800">{metrics.total_yield_quintals} qtl</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                      /qtl
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Mandi modal / MSP rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Computed KPI Dashboard & Charts (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Investment */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Investment
                </span>
                <div className="text-base sm:text-lg font-black text-rose-600 flex items-center">
                  ₹{metrics.total_expenses.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  ₹{metrics.cost_per_acre.toLocaleString()} / acre
                </div>
              </div>

              {/* Expected Revenue */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Expected Revenue
                </span>
                <div className="text-base sm:text-lg font-black text-slate-900 flex items-center">
                  ₹{metrics.expected_revenue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  ₹{metrics.revenue_per_acre.toLocaleString()} / acre
                </div>
              </div>

              {/* Net Profit / Loss */}
              <div
                className={`rounded-2xl border p-4 shadow-sm space-y-1 ${
                  metrics.is_profitable
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Net Profit
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      metrics.is_profitable
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-rose-200 text-rose-800'
                    }`}
                  >
                    {metrics.is_profitable ? 'Profit' : 'Loss'}
                  </span>
                </div>
                <div
                  className={`text-base sm:text-lg font-black flex items-center ${
                    metrics.is_profitable ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  ₹{metrics.net_profit.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold opacity-80">
                  ₹{metrics.profit_per_acre.toLocaleString()} / acre
                </div>
              </div>

              {/* ROI Percentage */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Return on Investment
                </span>
                <div
                  className={`text-base sm:text-lg font-black flex items-center gap-1 ${
                    metrics.roi_percentage >= 50
                      ? 'text-emerald-700'
                      : metrics.roi_percentage > 0
                      ? 'text-teal-600'
                      : 'text-rose-600'
                  }`}
                >
                  {metrics.roi_percentage > 0 ? '+' : ''}
                  {metrics.roi_percentage.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium">ROI on capital</div>
              </div>
            </div>

            {/* Breakeven Safety Margin Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">
                      Breakeven & Downside Protection Analysis
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Thresholds needed to avoid losses if weather or market prices drop
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Breakeven Yield */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Breakeven Yield</span>
                    <span className="font-extrabold text-slate-900">
                      {metrics.breakeven_yield_per_acre} qtl/acre
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.breakeven_yield_per_acre / (expectedYield || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Your target yield is <strong className="text-slate-700">{expectedYield} qtl/acre</strong>.
                    You can tolerate up to{' '}
                    <strong className="text-emerald-700">
                      {Math.max(0, Math.round(((expectedYield - metrics.breakeven_yield_per_acre) / (expectedYield || 1)) * 100))}%
                    </strong>{' '}
                    yield reduction.
                  </p>
                </div>

                {/* Breakeven Price */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Breakeven Market Price</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{metrics.breakeven_price_per_qtl} / qtl
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.breakeven_price_per_qtl / (sellingPrice || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Your anticipated rate is <strong className="text-slate-700">₹{sellingPrice}/qtl</strong>.
                    Price cushion is{' '}
                    <strong className="text-emerald-700">
                      ₹{Math.max(0, Math.round(sellingPrice - metrics.breakeven_price_per_qtl))}/qtl
                    </strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Granular Cost Distribution Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">
                      Cost Distribution Breakdown
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Percentage share of operational expenses across agricultural inputs
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-800">
                  Total: ₹{metrics.total_expenses.toLocaleString()}
                </span>
              </div>

              {/* Stacked Visual Bar */}
              <div className="w-full h-4 rounded-xl overflow-hidden flex bg-slate-100 shadow-inner">
                {metrics.cost_percentages['Seeds'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Seeds']}%` }}
                    className="bg-emerald-500 hover:opacity-90 transition-all"
                    title={`Seeds: ${metrics.cost_percentages['Seeds']}%`}
                  />
                )}
                {metrics.cost_percentages['Fertilisers'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Fertilisers']}%` }}
                    className="bg-teal-500 hover:opacity-90 transition-all"
                    title={`Fertilisers: ${metrics.cost_percentages['Fertilisers']}%`}
                  />
                )}
                {metrics.cost_percentages['Pesticides'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Pesticides']}%` }}
                    className="bg-cyan-500 hover:opacity-90 transition-all"
                    title={`Pesticides: ${metrics.cost_percentages['Pesticides']}%`}
                  />
                )}
                {metrics.cost_percentages['Labour'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Labour']}%` }}
                    className="bg-amber-500 hover:opacity-90 transition-all"
                    title={`Labour: ${metrics.cost_percentages['Labour']}%`}
                  />
                )}
                {metrics.cost_percentages['Irrigation'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Irrigation']}%` }}
                    className="bg-blue-500 hover:opacity-90 transition-all"
                    title={`Irrigation: ${metrics.cost_percentages['Irrigation']}%`}
                  />
                )}
                {metrics.cost_percentages['Machinery'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Machinery']}%` }}
                    className="bg-indigo-500 hover:opacity-90 transition-all"
                    title={`Machinery: ${metrics.cost_percentages['Machinery']}%`}
                  />
                )}
                {metrics.cost_percentages['Other'] > 0 && (
                  <div
                    style={{ width: `${metrics.cost_percentages['Other']}%` }}
                    className="bg-slate-400 hover:opacity-90 transition-all"
                    title={`Other: ${metrics.cost_percentages['Other']}%`}
                  />
                )}
              </div>

              {/* Cost Item Legend and Values */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(metrics.cost_percentages).map(([name, pct]) => {
                  const colors: Record<string, string> = {
                    Seeds: 'bg-emerald-500',
                    Fertilisers: 'bg-teal-500',
                    Pesticides: 'bg-cyan-500',
                    Labour: 'bg-amber-500',
                    Irrigation: 'bg-blue-500',
                    Machinery: 'bg-indigo-500',
                    Other: 'bg-slate-400',
                  };
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[name] || 'bg-slate-300'}`} />
                        <span className="text-[11px] font-semibold text-slate-700">{name}</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-900">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setSaveTitle(`${currentInput.crop_name} Simulation on ${currentInput.area_acres} Acres`);
                  setIsSaveModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save This Simulation Result</span>
              </button>

              <button
                onClick={() => {
                  // Pre-load current scenario into comparison if not already there
                  setComparisonCrops([currentInput, ...comparisonCrops.slice(0, 2)]);
                  setActiveTab('compare');
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <span>Compare Against Other Crops</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Crop Comparison */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Recommendation Banner */}
          {comparisonResult && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      AgriMind Economics Recommendation
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {comparisonResult.summary_recommendation}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Highest Profit: <strong>{comparisonResult.highest_profit_crop}</strong>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">
                    Highest ROI: <strong>{comparisonResult.highest_roi_crop}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Add Crop to Comparison Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Comparing {comparisonCrops.length} Crop Scenarios ({areaAcres} Acres Farm Size)</span>
                {comparing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Add crop:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddComparisonCrop(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="" disabled>
                  + Add crop from benchmarks...
                </option>
                {benchmarks.map((b) => (
                  <option key={b.crop_name} value={b.crop_name}>
                    {b.crop_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-${Math.min(
              comparisonCrops.length,
              3
            )} gap-4`}
          >
            {comparisonCrops.map((crop, idx) => {
              const res = comparisonResult?.results[idx]?.metrics || calculateLocalMetrics(crop);
              const isBestProfit = comparisonResult?.highest_profit_crop === crop.crop_name;
              const isBestRoi = comparisonResult?.highest_roi_crop === crop.crop_name;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 relative ${
                    isBestProfit
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900">{crop.crop_name}</h4>
                        {isBestProfit && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ★ Top Profit
                          </span>
                        )}
                        {isBestRoi && !isBestProfit && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            ★ Best ROI
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {crop.area_acres} Acres · {crop.expected_yield_per_acre} qtl/acre @ ₹
                        {crop.expected_selling_price_per_qtl}/qtl
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveComparisonCrop(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary KPIs */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold">Total Cost</span>
                      <p className="text-xs font-black text-slate-800">
                        ₹{res.total_expenses.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold">Total Revenue</span>
                      <p className="text-xs font-black text-slate-800">
                        ₹{res.expected_revenue.toLocaleString()}
                      </p>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl ${
                        res.is_profitable ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                      }`}
                    >
                      <span className="text-[10px] opacity-80 font-semibold">Net Profit</span>
                      <p className="text-xs font-black">₹{res.net_profit.toLocaleString()}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold">Return on Inv.</span>
                      <p
                        className={`text-xs font-black ${
                          res.roi_percentage >= 50
                            ? 'text-emerald-700'
                            : res.roi_percentage > 0
                            ? 'text-teal-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {res.roi_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Per Acre Return */}
                  <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Profit per Acre:</span>
                    <span className="font-extrabold text-emerald-700">
                      ₹{res.profit_per_acre.toLocaleString()}
                    </span>
                  </div>

                  {/* Breakeven Summary */}
                  <div className="text-[10px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Breakeven Yield:</span>
                      <strong className="text-slate-700">{res.breakeven_yield_per_acre} qtl/acre</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Breakeven Price:</span>
                      <strong className="text-slate-700">₹{res.breakeven_price_per_qtl}/qtl</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Detailed Comparative Economics Matrix
              </h4>
              <span className="text-[10px] text-slate-500">All figures dynamically computed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Metric</th>
                    {comparisonCrops.map((c, i) => (
                      <th key={i} className="py-2.5 px-4">
                        {c.crop_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Total Cultivated Area</td>
                    {comparisonCrops.map((c, i) => (
                      <td key={i} className="py-2.5 px-4">
                        {c.area_acres} Acres
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Yield per Acre</td>
                    {comparisonCrops.map((c, i) => (
                      <td key={i} className="py-2.5 px-4">
                        {c.expected_yield_per_acre} qtl
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Expected Market Price</td>
                    {comparisonCrops.map((c, i) => (
                      <td key={i} className="py-2.5 px-4">
                        ₹{c.expected_selling_price_per_qtl} / qtl
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Total Input Expenses</td>
                    {comparisonCrops.map((c, i) => {
                      const res = calculateLocalMetrics(c);
                      return (
                        <td key={i} className="py-2.5 px-4 font-bold text-rose-600">
                          ₹{res.total_expenses.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Expected Gross Revenue</td>
                    {comparisonCrops.map((c, i) => {
                      const res = calculateLocalMetrics(c);
                      return (
                        <td key={i} className="py-2.5 px-4 font-bold text-slate-900">
                          ₹{res.expected_revenue.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="py-2.5 px-4 font-extrabold text-emerald-900">Net Profit / (Loss)</td>
                    {comparisonCrops.map((c, i) => {
                      const res = calculateLocalMetrics(c);
                      return (
                        <td key={i} className="py-2.5 px-4 font-black text-emerald-700">
                          ₹{res.net_profit.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Profit per Acre</td>
                    {comparisonCrops.map((c, i) => {
                      const res = calculateLocalMetrics(c);
                      return (
                        <td key={i} className="py-2.5 px-4 font-bold text-slate-800">
                          ₹{res.profit_per_acre.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Return on Investment (ROI)</td>
                    {comparisonCrops.map((c, i) => {
                      const res = calculateLocalMetrics(c);
                      return (
                        <td key={i} className="py-2.5 px-4 font-black text-emerald-700">
                          {res.roi_percentage.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Saved Simulations History */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Saved Simulation Scenarios</h3>
              <p className="text-xs text-slate-500">
                Recall previously planned crops, yields and cost estimations
              </p>
            </div>

            <button
              onClick={loadSavedSimulations}
              disabled={loadingSaved}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSaved ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {savedSimulations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
              <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">No Saved Scenarios Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Run a simulation on the single crop tab and click "Save Scenario" to store it for future
                auditing and planning.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{sim.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {sim.crop_name} · {sim.area_acres} Acres · Saved on{' '}
                        {sim.created_at ? new Date(sim.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteSimulation(sim.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete saved scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Total Expenses</span>
                      <p className="font-bold text-slate-800">₹{sim.total_expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Net Profit</span>
                      <p className="font-extrabold text-emerald-700">₹{sim.net_profit.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">ROI %</span>
                      <p className="font-black text-emerald-700">{sim.roi_percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  {sim.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      "{sim.notes}"
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleLoadSavedScenario(sim)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>Load into Simulator</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Simulation Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Save Simulation Scenario</h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Simulation Title</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. Kharif 2026 Maize Plan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Strategy (Optional)</label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Based on 2 drip irrigations per week and Nashik APMC price forecast"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Crop & Area:</span>
                  <strong className="text-slate-800">
                    {currentInput.crop_name} ({currentInput.area_acres} Acres)
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Net Profit:</span>
                  <strong className="text-emerald-700">₹{metrics.net_profit.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Calculated ROI:</span>
                  <strong className="text-emerald-700">{metrics.roi_percentage.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSimulation}
                disabled={saving}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save to Farm Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfitabilitySimulator;
