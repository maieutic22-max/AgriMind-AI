import React, { useState } from 'react';
import { IncomeItem, PaymentMode } from '../../types/finance';
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
} from 'lucide-react';

interface IncomeManagerProps {
  incomes: IncomeItem[];
  onAddIncome: (item: Omit<IncomeItem, 'id'>) => Promise<void>;
  onUpdateIncome: (id: string, item: Partial<IncomeItem>) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({
  incomes,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [search, setSearch] = useState('');

  // Form states
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setSource('');
    setAmount('');
    setIncomeDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setBuyerName('');
    setPaymentMode('Bank Transfer');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: IncomeItem) => {
    setEditingItem(item);
    setSource(item.source);
    setAmount(item.amount.toString());
    setIncomeDate(item.income_date);
    setDescription(item.description || '');
    setBuyerName(item.buyer_name || '');
    setPaymentMode(item.payment_mode || 'Bank Transfer');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim()) {
      setFormError('Please enter a source of income (e.g. Wheat Harvest Sale).');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount in ₹.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        await onUpdateIncome(editingItem.id, {
          source: source.trim(),
          amount: numAmount,
          income_date: incomeDate,
          description: description.trim() || undefined,
          buyer_name: buyerName.trim() || undefined,
          payment_mode: paymentMode,
        });
      } else {
        await onAddIncome({
          source: source.trim(),
          amount: numAmount,
          income_date: incomeDate,
          description: description.trim() || undefined,
          buyer_name: buyerName.trim() || undefined,
          payment_mode: paymentMode,
        });
      }
      setIsModalOpen(false);
    } catch {
      setFormError('Failed to save income record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncomes = incomes.filter(
    (item) =>
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      (item.buyer_name && item.buyer_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalFilteredIncome = filteredIncomes.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Farm Revenue Ledger
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">{incomes.length} records</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
            Farm Income Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log crop harvest revenues, APMC mandi transactions, government subsidies, and advances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search source or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white w-48 sm:w-60 transition-all"
            />
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Income
          </button>
        </div>
      </div>

      {/* Income Records List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700">All Recorded Incomes</span>
          <span className="text-xs font-extrabold text-emerald-700">
            Filtered Total: {formatINR(totalFilteredIncome)}
          </span>
        </div>

        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No income records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No records match "${search}". Try clearing your search.`
                : 'Click "Add Income" to log your first farm produce sale or subsidy receipt.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source of Income</th>
                  <th className="py-3 px-4">Buyer / Agency</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                      {item.income_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {item.source}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.buyer_name || <span className="text-slate-400 italic">Direct / Cash</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={item.description}>
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-right whitespace-nowrap">
                      +{formatINR(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete income record "${item.source}"?`)) {
                              onDeleteIncome(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-forest-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {editingItem ? 'Edit Farm Income Record' : 'Record New Farm Income'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Source of income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source of Income *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat Harvest Sale (APMC), PM-KISAN, Maize Produce"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Received *
                  </label>
                  <input
                    type="date"
                    required
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Buyer / Agency & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Buyer / Mandi Trader
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kisan Mandi Traders"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details: weight, rate per quintal, plot number..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
