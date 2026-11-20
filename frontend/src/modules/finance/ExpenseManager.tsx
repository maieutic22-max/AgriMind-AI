import React, { useState } from 'react';
import { ExpenseItem, ExpenseCategory, PaymentMode } from '../../types/finance';
import {
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Tag,
} from 'lucide-react';

interface ExpenseManagerProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: Omit<ExpenseItem, 'id'>) => Promise<void>;
  onUpdateExpense: (id: string, item: Partial<ExpenseItem>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Seeds',
  'Fertilisers',
  'Labour',
  'Equipment',
  'Transportation',
  'Irrigation',
  'Agrochemicals',
  'Other',
];

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('Seeds');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
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
    setCategory('Seeds');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setVendorName('');
    setPaymentMode('Cash');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingItem(item);
    setCategory(item.category);
    setAmount(item.amount.toString());
    setExpenseDate(item.expense_date);
    setDescription(item.description || '');
    setVendorName(item.vendor_name || '');
    setPaymentMode(item.payment_mode || 'Cash');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive expense amount in ₹.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        await onUpdateExpense(editingItem.id, {
          category,
          amount: numAmount,
          expense_date: expenseDate,
          description: description.trim() || undefined,
          vendor_name: vendorName.trim() || undefined,
          payment_mode: paymentMode,
        });
      } else {
        await onAddExpense({
          category,
          amount: numAmount,
          expense_date: expenseDate,
          description: description.trim() || undefined,
          vendor_name: vendorName.trim() || undefined,
          payment_mode: paymentMode,
        });
      }
      setIsModalOpen(false);
    } catch {
      setFormError('Failed to save expense record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.vendor_name && item.vendor_name.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'seeds':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fertilisers':
        return 'bg-lime-50 text-lime-700 border-lime-200';
      case 'labour':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'equipment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'transportation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'irrigation':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Operational Cost Ledger
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">{expenses.length} records</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
            Farm Expense Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and categorize agricultural expenses across seeds, fertilisers, labour, equipment, and transportation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white w-48 sm:w-60 transition-all"
            />
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = expenses.filter((e) => e.category.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700">
            {selectedCategory === 'All' ? 'All Expense Records' : `${selectedCategory} Records`}
          </span>
          <span className="text-xs font-extrabold text-rose-700">
            Category Total: {formatINR(totalFilteredExpense)}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No expense records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedCategory !== 'All'
                ? 'No expenses matched the current filter. Try selecting "All Categories" or clearing the search.'
                : 'Click "Add Expense" to record inputs like seeds, urea fertilizer, labour wages, or machinery hire.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Vendor / Worker</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                      {item.expense_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm" title={item.description}>
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.vendor_name || <span className="text-slate-400 italic">Direct</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-700 text-right whitespace-nowrap">
                      -{formatINR(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Edit record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete expense record "${item.category}" for ₹${item.amount}?`)) {
                              onDeleteExpense(item.id);
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-800 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-300" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {editingItem ? 'Edit Farm Expense' : 'Record New Farm Expense'}
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

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Incurred *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Item Specifics *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urea 45kg (8 bags), Tillage 10hrs, Weeding labor"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Vendor & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shop / Vendor / Worker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shree Ram Agro Store"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit (Khata)</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
