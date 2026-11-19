import React from 'react';
import { FinancialSummary } from '../../types/finance';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PiggyBank,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface FinancialDashboardProps {
  summary: FinancialSummary;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenAddLoan: () => void;
  onNavigateTab: (tab: 'income' | 'expenses' | 'loans' | 'history') => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  summary,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenAddLoan,
  onNavigateTab,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const netMarginPercent =
    summary.total_income > 0
      ? Math.round(((summary.total_income - summary.total_expenses) / summary.total_income) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Farm Income
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {formatINR(summary.total_income)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Mandi & harvest sales
            </span>
            <button
              onClick={() => onNavigateTab('income')}
              className="font-semibold text-emerald-700 hover:text-emerald-800 text-[11px] underline"
            >
              View ledger
            </button>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Farm Expenses
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
            {formatINR(summary.total_expenses)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              Seeds, inputs & labor
            </span>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="font-semibold text-rose-700 hover:text-rose-800 text-[11px] underline"
            >
              View breakdown
            </button>
          </div>
        </div>

        {/* Outstanding Loans */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Outstanding Loans
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
            {formatINR(summary.outstanding_loans)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Repaid: {formatINR(summary.total_loan_repayments)}
            </span>
            <button
              onClick={() => onNavigateTab('loans')}
              className="font-semibold text-amber-700 hover:text-amber-800 text-[11px] underline"
            >
              Track loans
            </button>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Cash Balance
            </span>
            <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${summary.available_balance >= 0 ? 'text-forest-900' : 'text-rose-600'}`}>
            {formatINR(summary.available_balance)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-calculated net</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                summary.available_balance >= 0
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {summary.available_balance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Summary Banner */}
      <div className="bg-gradient-to-r from-[#173829] via-[#214d38] to-[#1e3e2c] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Automated Ledger Balance
            </span>
            <span className="text-xs text-forest-200">Kharif Season 2026</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Net Seasonal Margin: {formatINR(summary.net_margin)} ({netMarginPercent}%)
          </h3>
          <p className="text-xs text-forest-200/90 leading-relaxed">
            Your revenues exceed input expenses by {formatINR(summary.net_margin)}. You have {formatINR(summary.outstanding_loans)} in outstanding institutional loans (KCC and Cooperative Credit) requiring scheduled amortization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddIncome}
            className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add Income
          </button>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <PlusCircle className="w-4 h-4" /> Add Expense
          </button>
          <button
            onClick={onOpenAddLoan}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <PiggyBank className="w-4 h-4" /> Record Loan
          </button>
        </div>
      </div>

      {/* Grid: Expense Distribution by Category & Quick Financial Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Operating Expenses by Agricultural Category
              </h3>
              <p className="text-[11px] text-slate-500">
                Breakdown of inputs across seeds, fertilisers, machinery, labor, and freight
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Detailed view <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {summary.expense_by_category && summary.expense_by_category.length > 0 ? (
              summary.expense_by_category.map((cat, idx) => {
                const colors = [
                  'bg-emerald-600',
                  'bg-teal-600',
                  'bg-amber-600',
                  'bg-lime-600',
                  'bg-indigo-600',
                  'bg-rose-500',
                  'bg-cyan-600',
                  'bg-slate-500',
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{formatINR(cat.amount)}</span>
                        <span className="text-[11px] text-slate-500 w-10 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No expense records logged yet. Add your first input expense above.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Quick Ledger Insights */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Financial Safety & Ratios
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Operating Cost Ratio
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-extrabold text-slate-800">
                  {summary.total_income > 0
                    ? `${Math.round((summary.total_expenses / summary.total_income) * 100)}%`
                    : '0%'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Healthy (&lt;60%)
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Proportion of seasonal revenues absorbed by direct input expenses.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Debt Service Coverage
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-extrabold text-slate-800">
                  {summary.outstanding_loans > 0
                    ? `${(summary.available_balance / summary.outstanding_loans).toFixed(2)}x`
                    : 'Debt Free'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-100 text-forest-800">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Available cash capacity relative to active institutional debt.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('history')}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
              >
                Open Full Transaction Journal →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
