import React from 'react';
import { Tractor, MapPin } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const MarketplacePage: React.FC = () => {
  const machinery = [
    {
      title: 'Mahindra 575 DI Tractor (45 HP)',
      owner: 'Ramesh Patil',
      location: 'Dindori, Nashik (4 km)',
      rate: '₹800 / hour',
      status: 'Available',
    },
    {
      title: 'Rotavator Multi-Speed (6 Feet)',
      owner: 'Kisan Cooperative Pool',
      location: 'Panchavati (6 km)',
      rate: '₹450 / hour',
      status: 'Available',
    },
    {
      title: 'Power Tiller & Ridge Maker',
      owner: 'Sanjay Deshmukh',
      location: 'Nashik Road (8 km)',
      rate: '₹350 / hour',
      status: 'Booked',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Module 1 & 3 · Peer-to-Peer Mechanization
            </span>
            <StatusBadge status="demo" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Farm Equipment Sharing & Rental Marketplace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search nearby machinery, inspect hourly rates, and schedule bookings to reduce individual capital costs.
          </p>
        </div>

        <button className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs transition-colors w-fit">
          ＋ List My Equipment
        </button>
      </div>

      {/* Machinery Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {machinery.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-forest-50 text-forest-700">
                <Tractor className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Owner: {item.owner}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5" /> {item.location}
              </div>
              <div className="font-extrabold text-forest-900 text-base">{item.rate}</div>
            </div>

            <button
              disabled={item.status !== 'Available'}
              className="w-full py-2 bg-forest-800 hover:bg-forest-900 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Request Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
