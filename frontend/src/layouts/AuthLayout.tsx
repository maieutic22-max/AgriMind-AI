import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">🌱</span>
          <span className="text-2xl font-extrabold text-forest-900 tracking-tight">
            AgriMind <span className="text-emerald-600">AI</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 font-medium">
          An Agentic AI-Powered Farm Management & Digital Twin Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200/80">
          <Outlet />
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Phase 1 Development Prototype & Foundation
      </div>
    </div>
  );
};
