import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Sprout, Bot, DollarSign, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand text-slate-900 flex flex-col">
      {/* Navigation */}
      <header className="h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-extrabold text-forest-900 tracking-tight">
            AgriMind <span className="text-emerald-600 font-bold">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold text-forest-800 hover:text-emerald-700 px-3 py-2 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            Open Farm Workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AgriMind AI Platform · Phase 1 Initialized
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-forest-950 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          Grow smarter. Farm with clarity.
          <br />
          <span className="text-emerald-700">Every decision, in one place.</span>
        </h1>

        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          An Agentic AI-powered Farm Management and 3D Digital Twin Platform uniting agronomic intelligence, predictive what-if simulations, farm economics, and agricultural operations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            to="/dashboard"
            className="px-6 py-3.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
          >
            Launch Farm Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/digital-twin"
            className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm transition-all text-sm"
          >
            Explore 3D Digital Twin
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left mt-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">3D Digital Twin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive WebGL spatial representation of fields, crops, and infrastructure with what-if scenario simulations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-4">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Crop Intelligence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Smart crop recommendations, soil health card analysis, precision irrigation, and early warning risk models.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Farm Operations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Double-entry farm financial ledger, profitability simulator, input inventory expiration alerts, and machinery rental.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Agentic AI Manager</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conversational assistant powered by native tool calling, grounded agricultural research (RAG), and persistent farm memory.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white px-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">
          AgriMind AI — An Agentic AI-Powered Farm Management & Digital Twin Platform
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Final Year Project · Developed by a Team of 4 Engineering Students · Phase 1 Initialized
        </p>
      </footer>
    </div>
  );
};
