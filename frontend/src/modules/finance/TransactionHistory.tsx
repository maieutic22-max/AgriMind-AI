import React, { useState } from 'react';
import { TransactionItem } from '../../types/finance';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: TransactionItem[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Extract unique categories & sources
  const categories = Array.from(new Set(transactions.map((t) => t.category_or_source))).sort();

  const filtered = transactions.filter((t) => {
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'All' || t.category_or_source.toLowerCase() === categoryFilter.toLowerCase();
    const s = search.toLowerCase();
    const matchesSearch =
      t.category_or_source.toLowerCase().includes(s) ||
      (t.description && t.description.toLowerCase().includes(s)) ||
      (t.party && t.party.toLowerCase().includes(s));

    return matchesType && matchesCategory && matchesSearch;
  });

  const totalIncome = filtered
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filtered
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
              Universal Farm Ledger
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">{transactions.length} total entries</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
            Farm Transaction History & Cash Flow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and inspect every income revenue and operational expense transaction in chronological order.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" /> Print / Export Ledger
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, party, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-forest-700 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                typeFilter === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Incomes
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-700 bg-slate-50 font-semibold"
            >
              <option value="All">All Categories & Sources</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtered Financial Metrics Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{filtered.length}</strong> transactions
            </span>
            <span className="text-emerald-700 font-bold">
              Income: +{formatINR(totalIncome)}
            </span>
            <span className="text-rose-700 font-bold">
              Expenses: -{formatINR(totalExpense)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Net Cash Position:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                netFlow >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {netFlow >= 0 ? '+' : ''}
              {formatINR(netFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No transactions match the selected filters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category / Item</th>
                  <th className="py-3 px-4">Buyer / Vendor / Worker</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isInc = item.type === 'INCOME';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isInc
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isInc ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          )}
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.category_or_source}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.party || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.payment_mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate" title={item.description}>
                        {item.description || '—'}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-extrabold text-right whitespace-nowrap ${
                          isInc ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isInc ? '+' : '-'}
                        {formatINR(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
