import React, { useState } from 'react';
import { FarmScene } from '../modules/digital-twin/FarmScene';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Box, Layers, Play } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState<number>(1);
  const [simAlternative, setSimAlternative] = useState('Maize');
  const [simWater, setSimWater] = useState(80);
  const [simResult, setSimResult] = useState<string | null>(null);

  const handleSimulate = () => {
    setSimResult(
      `Scenario evaluated: Switching Plot ${selectedPlot} to ${simAlternative} under ${simWater}% water availability is projected to yield ₹36,000 net return with an estimated 170,000 L water savings compared to baseline.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Module 1 · Member 1 Core Deliverable
            </span>
            <StatusBadge status="demo" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            3D Agricultural Digital Twin & What-If Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real WebGL canvas (Three.js + React Three Fiber) rendering farm plots, terrain, and scenario projections.
          </p>
        </div>
      </div>

      {/* 3D Scene Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Spans: Real 3D WebGL Canvas */}
        <div className="lg:col-span-2 h-[480px] flex flex-col">
          <FarmScene />
        </div>

        {/* Right 1 Span: Plot Inspector & What-If Simulation */}
        <div className="space-y-5">
          {/* Field Selection Cards */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-forest-700" /> Plot Inspector
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 1, name: 'North', crop: 'Maize', area: '2.5 ac' },
                { id: 2, name: 'Central', crop: 'Soybean', area: '3.5 ac' },
                { id: 3, name: 'South', crop: 'Paddy', area: '2.5 ac' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlot(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPlot === p.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs'
                  }`}
                >
                  <div className="text-xs">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.crop}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Plot:</span>
                <span className="font-semibold">Plot {selectedPlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Soil Texture:</span>
                <span className="font-semibold">Medium Black Clay Loam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Irrigation Method:</span>
                <span className="font-semibold">Drip Pipeline Line A</span>
              </div>
            </div>
          </div>

          {/* What-If Scenario Simulator Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-600" /> What-If Scenario Simulator
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Simulate Crop Alternative</label>
                <select
                  value={simAlternative}
                  onChange={(e) => setSimAlternative(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Maize">Maize (HQPM-1 Hybrid)</option>
                  <option value="Soybean">Soybean (JS-335)</option>
                  <option value="Cotton">Cotton (Bt Cotton)</option>
                  <option value="Chickpea">Chickpea (Gram)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 font-semibold mb-1">
                  <span>Water Availability</span>
                  <span>{simWater}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={simWater}
                  onChange={(e) => setSimWater(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <button
                onClick={handleSimulate}
                className="w-full py-2 px-3 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Run Comparison
              </button>

              {simResult && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  {simResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
