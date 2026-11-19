import React from 'react';
import { Sprout, Upload, AlertCircle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const CropIntelligencePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            Module 2 · Member 2 Core Deliverables
          </span>
          <StatusBadge status="demo" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Crop, Soil & Agricultural Intelligence
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Crop recommendation, laboratory soil health card parsing, precision irrigation, and leaf disease diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Soil Health Card Analyzer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-lime-50 text-lime-700">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Soil Health Analysis</h3>
              <p className="text-[10px] text-slate-500">Deliverable D12</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Nitrogen (N):</span>
              <span className="font-bold text-amber-600">140 kg/ha (Low)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phosphorus (P):</span>
              <span className="font-bold text-emerald-600">35 kg/ha (Medium)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Potassium (K):</span>
              <span className="font-bold text-emerald-600">210 kg/ha (Good)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Soil pH:</span>
              <span className="font-bold text-slate-800">6.8 (Neutral)</span>
            </div>
          </div>
          <button className="w-full py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors">
            Generate Soil Amendment Plan
          </button>
        </div>

        {/* Leaf Disease Diagnosis Proxy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Disease Diagnostic Proxy</h3>
              <p className="text-[10px] text-slate-500">Deliverable D14 (Pending Audit)</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500 hover:border-slate-300 cursor-pointer">
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <span className="font-semibold text-slate-700">Upload leaf photo</span>
            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
          </div>

          <div className="text-[11px] text-slate-500">
            Audit Checklist status: Pending verification of predecessor KisanSathi endpoint and rate limits.
          </div>
        </div>

        {/* Multi-Task ML Experimental Protocol */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Multi-Task ML Engine</h3>
              <p className="text-[10px] text-slate-500">Deliverable D18 (Experimental)</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Joint neural network architecture undergoing comparative evaluation against single-task gradient boosting models (XGBoost / LightGBM).
          </p>

          <div className="p-3 rounded-xl bg-forest-50 text-forest-800 text-[11px] leading-relaxed">
            Target Tasks: Crop Suitability, Yield, Fertilizer, Irrigation ($ET_c$), and Risk.
          </div>
        </div>
      </div>
    </div>
  );
};
