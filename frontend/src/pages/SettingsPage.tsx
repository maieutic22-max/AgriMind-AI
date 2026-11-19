import React from 'react';
import { Settings, Database } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            System & Account
          </span>
          <StatusBadge status="demo" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure farm profiles, vernacular language preferences, and API keys.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-forest-700" /> Language & Regional Settings
          </h3>
          <div className="mt-3 max-w-sm">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Language</label>
            <select className="w-full p-2 border border-slate-300 rounded-xl text-xs">
              <option value="en">English</option>
              <option value="mr">Marathi (मराठी)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-forest-700" /> Offline Synchronization
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            IndexedDB client storage cache enables field data inspection during rural network dropouts.
          </p>
          <div className="mt-3">
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
              Synchronize Local Offline Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
