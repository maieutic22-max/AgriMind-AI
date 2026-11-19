import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Sprout,
  DollarSign,
  Tractor,
  Bot,
  Settings,
  X,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MODULE 1 — DIGITAL TWIN',
      items: [
        { to: '/farm-setup', label: 'Farm Setup & Plots', icon: Compass },
        { to: '/digital-twin', label: '3D Digital Twin', icon: Box },
      ],
    },
    {
      title: 'MODULE 2 — CROP INTEL',
      items: [
        { to: '/crop-intelligence', label: 'Crop & Soil Intelligence', icon: Sprout },
      ],
    },
    {
      title: 'MODULE 3 — OPERATIONS',
      items: [
        { to: '/farm-management', label: 'Finance & Operations', icon: DollarSign },
        { to: '/marketplace', label: 'Equipment Rental', icon: Tractor },
      ],
    },
    {
      title: 'MODULE 4 — AI ASSISTANT',
      items: [
        { to: '/ai-assistant', label: 'AI Farm Manager', icon: Bot },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1e3220] text-slate-100 flex flex-col transition-transform duration-200 ease-in-out border-r border-forest-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-forest-800/80">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-forest-950 flex items-center justify-center font-extrabold text-base shadow-sm">
              🌱
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                AgriMind <span className="text-emerald-400 font-bold">AI</span>
              </div>
              <div className="text-[9px] font-semibold tracking-wider text-forest-300 uppercase">
                Digital Twin Platform
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded text-forest-300 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-bold tracking-wider text-forest-400 uppercase px-3 mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-emerald-600/90 text-white shadow-sm'
                            : 'text-forest-200 hover:bg-forest-800/60 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Settings Link */}
        <div className="p-4 border-t border-forest-800/80">
          <NavLink
            to="/settings"
            onClick={() => onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-forest-300 hover:bg-forest-800/60 hover:text-white'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Preferences</span>
          </NavLink>
          <div className="mt-3 px-3 text-[10px] text-forest-400 text-center">
            AgriMind AI v1.0.0 (Phase 1)
          </div>
        </div>
      </aside>
    </>
  );
};
