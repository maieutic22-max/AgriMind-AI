import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { systemApi } from '../services/api';
import { HealthResponse } from '../types';
import {
  Sprout,
  Compass,
  DollarSign,
  CloudSun,
  Activity,
  ArrowRight,
  TrendingUp,
  Box,
  Bot,
  Tractor,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    systemApi
      .getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth(null))
      .finally(() => setLoadingHealth(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e3220] to-[#2d4d31] rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Kharif Season 2026
            </span>
            <StatusBadge status="demo" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Good afternoon, Balram 👋
          </h2>
          <p className="text-forest-200 text-xs md:text-sm mt-1 max-w-xl">
            Green Valley Farm · 8.5 acres across 3 managed fields in Nashik District.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/digital-twin"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Box className="w-4 h-4" /> Open 3D Farm View
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <Bot className="w-4 h-4" /> Ask AI Assistant
          </Link>
        </div>
      </div>

      {/* Backend System Live Status Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              API Connection Status
              {loadingHealth ? (
                <span className="text-slate-400 text-[10px]">Testing...</span>
              ) : health ? (
                <span className="text-emerald-700 text-[10px] font-semibold">Live ({health.service})</span>
              ) : (
                <span className="text-amber-700 text-[10px] font-semibold">Disconnected</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {health?.database?.message || 'FastAPI backend connection probe active.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Database Layer:</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              health?.database?.status === 'connected'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {health?.database?.status === 'connected' ? 'PostgreSQL Active' : 'PostgreSQL Pending'}
          </span>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Farm Area"
          value="8.5 Acres"
          subtitle="Across 3 demo plots"
          icon={<Compass className="w-5 h-5" />}
          trend="+0.0 ac"
        />
        <StatCard
          title="Active Crops"
          value="3 Crops"
          subtitle="Maize · Soybean · Paddy"
          icon={<Sprout className="w-5 h-5" />}
          trend="Vegetative"
        />
        <StatCard
          title="Projected Net Profit"
          value="₹1,23,600"
          subtitle="Est. Season Return (Demo)"
          icon={<DollarSign className="w-5 h-5" />}
          trend="+18.4%"
        />
        <StatCard
          title="Micro-Weather"
          value="28°C · Clear"
          subtitle="Humidity: 64% · 0mm rain"
          icon={<CloudSun className="w-5 h-5" />}
          trend="Nashik"
        />
      </div>

      {/* Main Content Grid: Farm Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Operational Status & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Quick Operations & Simulations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/digital-twin"
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Box className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">What-If Scenario</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Simulate crop swap</div>
              </Link>

              <Link
                to="/crop-intelligence"
                className="p-3 rounded-xl border border-slate-200 hover:border-lime-500 hover:bg-lime-50/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-lime-50 text-lime-700 w-fit mb-2 group-hover:bg-lime-600 group-hover:text-white transition-colors">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Soil Health Card</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Analyze NPK levels</div>
              </Link>

              <Link
                to="/marketplace"
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 w-fit mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Tractor className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Book Machinery</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tractor & rotavator</div>
              </Link>

              <Link
                to="/ai-assistant"
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700 w-fit mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Ask Farm AI</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Instant advisory</div>
              </Link>
            </div>
          </div>

          {/* Upcoming Crop Calendar Schedule */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Field Operations</h3>
                <p className="text-xs text-slate-500">Scheduled crop activities for this week</p>
              </div>
              <StatusBadge status="demo" />
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-xs font-bold">
                    💧
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Scheduled Irrigation · Central Plot</div>
                    <div className="text-[10px] text-slate-500">Soybean vegetative stage · Target: 45,000 L</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Tomorrow, 07:00 AM
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">
                    🌿
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Top-Dress Nitrogen Application</div>
                    <div className="text-[10px] text-slate-500">North Plot (Maize) · Dosage: 25 kg Urea</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Nov 22, 2026
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-xs font-bold">
                    🔍
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Scouting for Fall Armyworm</div>
                    <div className="text-[10px] text-slate-500">North Plot · Risk early warning triggered</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Action Recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Snapshot & Market Prices */}
        <div className="space-y-6">
          {/* Farm Financial Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Season Financial Ledger</h3>
              <StatusBadge status="demo" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Operational Outflow</span>
                <span className="font-bold text-slate-800">₹68,400</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full w-[35%]"></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Projected Gross Revenue</span>
                <span className="font-bold text-emerald-700">₹1,92,000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full w-[65%]"></div>
              </div>

              <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-100 mt-4 text-xs">
                <div className="text-forest-800 font-bold mb-0.5">Est. Net Profit: ₹1,23,600</div>
                <p className="text-[10px] text-forest-600 leading-relaxed">
                  Breakeven yield estimated at 11.2 quintals/acre for Maize and 6.4 quintals/acre for Soybean.
                </p>
              </div>
            </div>

            <Link
              to="/farm-management"
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              View Full Farm Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mandi Market Trends Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">APMC Mandi Rates</h3>
              <StatusBadge status="demo" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Maize (Hybrid)</div>
                  <div className="text-[10px] text-slate-500">Nashik APMC</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">₹2,380 / qtl</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                    <TrendingUp className="w-3 h-3" /> +₹45
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Soybean (Yellow)</div>
                  <div className="text-[10px] text-slate-500">Lasalgaon APMC</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">₹4,650 / qtl</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                    <TrendingUp className="w-3 h-3" /> +₹80
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
