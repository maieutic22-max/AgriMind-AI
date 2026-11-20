import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  History,
  LayoutDashboard,
  Package,
  Users,
  RefreshCw,
  Calculator,
  Handshake,
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { financeApi } from '../services/financeApi';
import {
  FinancialSummary,
  IncomeItem,
  ExpenseItem,
  LoanItem,
  TransactionItem,
} from '../types/finance';
import { FinancialDashboard } from '../modules/finance/FinancialDashboard';
import { IncomeManager } from '../modules/finance/IncomeManager';
import { ExpenseManager } from '../modules/finance/ExpenseManager';
import { LoanManager } from '../modules/finance/LoanManager';
import { TransactionHistory } from '../modules/finance/TransactionHistory';
import { ProfitabilitySimulator } from '../modules/profitability/ProfitabilitySimulator';
import { MarketIntelligence } from '../modules/market/MarketIntelligence';
import { FPOCollectiveSelling } from '../modules/fpo/FPOCollectiveSelling';

export const FarmManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profitability' | 'market' | 'fpo' | 'income' | 'expenses' | 'loans' | 'history'>(
    'overview'
  );
  const [loading, setLoading] = useState(true);

  // Financial state
  const [summary, setSummary] = useState<FinancialSummary>({
    total_income: 0,
    total_expenses: 0,
    total_loans: 0,
    total_loan_repayments: 0,
    outstanding_loans: 0,
    available_balance: 0,
    net_margin: 0,
    expense_by_category: [],
    recent_transactions_count: 0,
  });
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Load all finance data
  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [sumData, incData, expData, loanData, txData] = await Promise.all([
        financeApi.getSummary(),
        financeApi.getIncomes(),
        financeApi.getExpenses(),
        financeApi.getLoans(),
        financeApi.getTransactions(),
      ]);

      setSummary(sumData);
      setIncomes(incData);
      setExpenses(expData);
      setLoans(loanData);
      setTransactions(txData.transactions);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  // Handlers for Income
  const handleAddIncome = async (item: Omit<IncomeItem, 'id'>) => {
    await financeApi.addIncome(item);
    await loadFinanceData();
  };

  const handleUpdateIncome = async (id: string, item: Partial<IncomeItem>) => {
    await financeApi.updateIncome(id, item);
    await loadFinanceData();
  };

  const handleDeleteIncome = async (id: string) => {
    await financeApi.deleteIncome(id);
    await loadFinanceData();
  };

  // Handlers for Expense
  const handleAddExpense = async (item: Omit<ExpenseItem, 'id'>) => {
    await financeApi.addExpense(item);
    await loadFinanceData();
  };

  const handleUpdateExpense = async (id: string, item: Partial<ExpenseItem>) => {
    await financeApi.updateExpense(id, item);
    await loadFinanceData();
  };

  const handleDeleteExpense = async (id: string) => {
    await financeApi.deleteExpense(id);
    await loadFinanceData();
  };

  // Handlers for Loan & Repayment
  const handleAddLoan = async (
    item: Omit<LoanItem, 'id' | 'total_repaid' | 'pending_amount' | 'repayments'>
  ) => {
    await financeApi.addLoan(item);
    await loadFinanceData();
  };

  const handleAddRepayment = async (
    loanId: string,
    repayment: { amount: number; payment_date: string; payment_mode: string; notes?: string }
  ) => {
    await financeApi.addLoanRepayment(loanId, repayment);
    await loadFinanceData();
  };

  const handleDeleteLoan = async (id: string) => {
    await financeApi.deleteLoan(id);
    await loadFinanceData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
              Module 3 · Member 3 Deliverables
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              D19 Farm Financial Management
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
              D20 Profitability Simulator
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              D21 Market Intelligence
            </span>
            <StatusBadge status="connected" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Farm Business, Finance & Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate crop economics & ROI, track APMC mandi rates, manage revenues & expenses, and monitor real-time cash balance.
          </p>
        </div>

        <button
          onClick={loadFinanceData}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          title="Refresh Financial Records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#1e3220] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Financial Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profitability'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Profitability Simulator (D20)</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'market'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Market Intelligence (D21)</span>
        </button>

        <button
          onClick={() => setActiveTab('fpo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fpo'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>FPO & Collective Selling (D22)</span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'income'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Income Management ({incomes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Expense Management ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'loans'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Loan Management ({loans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction History</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <FinancialDashboard
              summary={summary}
              onOpenAddIncome={() => setIsIncomeModalOpen(true)}
              onOpenAddExpense={() => setIsExpenseModalOpen(true)}
              onOpenAddLoan={() => setIsLoanModalOpen(true)}
              onNavigateTab={(tab) => {
                if (tab === 'income') setActiveTab('income');
                if (tab === 'expenses') setActiveTab('expenses');
                if (tab === 'loans') setActiveTab('loans');
                if (tab === 'history') setActiveTab('history');
              }}
            />

            {/* Profitability Simulator Quick Action Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-[#1e3220] to-emerald-950 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                    Deliverable D20
                  </span>
                  <span className="text-xs font-black text-white">Farm Profitability Simulator</span>
                </div>
                <p className="text-xs text-emerald-100/80 max-w-xl">
                  Simulate crop cultivation economics, customize seed, fertilizer, and machine costs, and compare returns across crops before planting.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('profitability')}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Calculator className="w-4 h-4" />
                <span>Launch Simulator →</span>
              </button>
            </div>

            {/* Smart Market Intelligence Quick Action Card (D21) */}
            <div className="bg-gradient-to-r from-[#17301c] via-[#1e3e24] to-[#17301c] rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700/50">
                    Deliverable D21
                  </span>
                  <span className="text-xs font-black text-white">Smart Market Intelligence (APMC Mandi Rates)</span>
                </div>
                <p className="text-xs text-emerald-100/80 max-w-xl">
                  Access official AGMARKNET live prices for Maize, Soybean, Onion, Tomato, and Wheat. Compare prices across mandis, analyze price spreads, and view 30-day historical trends.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('market')}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Explore Mandi Prices →</span>
              </button>
            </div>

            {/* FPO & Collective Selling Quick Action Card (D22) */}
            <div className="bg-gradient-to-r from-[#17301c] via-[#1a4023] to-[#122818] rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-700/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/50">
                    Deliverable D22
                  </span>
                  <span className="text-xs font-black text-white">FPO & Collective Selling Hub</span>
                </div>
                <p className="text-xs text-emerald-100/80 max-w-xl">
                  Form farmer producer collectives, combine crop harvest into bulk lots, record competing buyer bids, and execute institutional supply deals with higher bargaining margins.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('fpo')}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Handshake className="w-4 h-4" />
                <span>Open Collective Hub →</span>
              </button>
            </div>

            {/* Other Member 3 Operations Deliverables (D24 & D25) intact */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Other Module 3 Operational Deliverables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inventory Card (D24) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Agricultural Input Inventory
                        </h4>
                        <p className="text-[10px] text-slate-500">Deliverable D24 · Stock Tracking</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Synchronized
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">IFFCO Neem Urea:</span>
                      <span className="font-bold text-slate-800">12 bags in stock</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Hybrid Maize Seeds:</span>
                      <span className="font-bold text-slate-800">6 bags allocated</span>
                    </div>
                  </div>
                </div>

                {/* Labour Card (D25) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Farm Labour Roster</h4>
                        <p className="text-[10px] text-slate-500">Deliverable D25 · Wage Accounts</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Active Shifts
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Active Field Workers:</span>
                      <span className="font-bold text-emerald-700">2 on duty (Weeding)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Standard Daily Wage:</span>
                      <span className="font-bold text-slate-800">₹500 / day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profitability' && (
          <ProfitabilitySimulator />
        )}

        {activeTab === 'market' && (
          <MarketIntelligence />
        )}

        {activeTab === 'fpo' && (
          <FPOCollectiveSelling />
        )}

        {activeTab === 'income' && (
          <IncomeManager
            incomes={incomes}
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            isModalOpen={isIncomeModalOpen}
            setIsModalOpen={setIsIncomeModalOpen}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseManager
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            isModalOpen={isExpenseModalOpen}
            setIsModalOpen={setIsExpenseModalOpen}
          />
        )}

        {activeTab === 'loans' && (
          <LoanManager
            loans={loans}
            onAddLoan={handleAddLoan}
            onAddRepayment={handleAddRepayment}
            onDeleteLoan={handleDeleteLoan}
            isAddModalOpen={isLoanModalOpen}
            setIsAddModalOpen={setIsLoanModalOpen}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default FarmManagementPage;
