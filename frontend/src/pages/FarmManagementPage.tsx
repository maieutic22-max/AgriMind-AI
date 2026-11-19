import React from 'react';
import { DollarSign, Package, Users } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const FarmManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            Module 3 · Member 3 Core Deliverables
          </span>
          <StatusBadge status="demo" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Farm Business, Finance & Operations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Agricultural accounting ledger, inventory shelf-life tracking, labor attendance, and mandi price forecasting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Double-Entry Ledger Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Financial Ledger</h3>
              <p className="text-[10px] text-slate-500">Deliverable D19</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Expenses:</span>
              <span className="font-bold text-rose-600">₹68,400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Revenues:</span>
              <span className="font-bold text-emerald-600">₹1,92,000</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5">
              <span className="font-semibold text-slate-700">Net Margin:</span>
              <span className="font-bold text-slate-900">₹1,23,600</span>
            </div>
          </div>
        </div>

        {/* Inventory Stock & Shelf-Life Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Agricultural Inventory</h3>
              <p className="text-[10px] text-slate-500">Deliverable D24</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-2">
            <div className="flex justify-between">
              <span>Urea Fertilizer</span>
              <span className="font-semibold text-slate-800">12 bags (In Stock)</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Hybrid Maize Seeds</span>
              <span className="font-bold">0 kg (Low Stock)</span>
            </div>
            <div className="flex justify-between">
              <span>Neem Agrochemical</span>
              <span className="font-semibold text-slate-800">5 Liters</span>
            </div>
          </div>
        </div>

        {/* Labour Attendance Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Farm Labour Roster</h3>
              <p className="text-[10px] text-slate-500">Deliverable D25</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-2">
            <div className="flex justify-between">
              <span>Suresh Jadhav</span>
              <span className="text-emerald-700 font-semibold">Present · Weeding</span>
            </div>
            <div className="flex justify-between">
              <span>Anand Shinde</span>
              <span className="text-emerald-700 font-semibold">Present · Irrigation</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ganesh Kadam</span>
              <span>Absent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
