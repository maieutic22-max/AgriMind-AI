import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const FarmSetupPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Module 1 · Deliverable D02
            </span>
            <StatusBadge status="demo" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Farm Creation & Field Configuration Wizard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set up farm boundaries, plot subdivisions, soil profiles, and water infrastructure.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Farm Profile</div>
              <div className="text-[10px] text-slate-500">Name, location, total area</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Plot Boundaries</div>
              <div className="text-[10px] text-slate-500">Subdivide land into plots</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Soil & Irrigation</div>
              <div className="text-[10px] text-slate-500">Texture, pipelines, sources</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Generate 3D Model</div>
              <div className="text-[10px] text-slate-500">Render in WebGL scene</div>
            </div>
          </div>
        </div>

        {/* Wizard Form Placeholder */}
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Name</label>
            <input
              type="text"
              defaultValue="Green Valley Farm"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Acreage</label>
              <input
                type="number"
                defaultValue={8.5}
                step="0.1"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District / State</label>
              <input
                type="text"
                defaultValue="Nashik, Maharashtra"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-forest-50 border border-forest-100 text-xs text-forest-800">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Member 1 Scaffolding Ready
            </div>
            <p className="text-[11px] leading-relaxed">
              This wizard will connect with the backend endpoint <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">POST /api/v1/farms</code> to persist polygon boundary coordinates into PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
