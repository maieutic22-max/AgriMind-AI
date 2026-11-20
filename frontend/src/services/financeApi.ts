import { apiClient } from './api';
import {
  FinancialSummary,
  IncomeItem,
  ExpenseItem,
  LoanItem,
  LoanRepayment,
  TransactionHistoryResponse,
  TransactionItem,
} from '../types/finance';

// Local storage keys for resilient offline/standalone operation
const STORAGE_KEYS = {
  INCOME: 'agrimind_finance_income',
  EXPENSES: 'agrimind_finance_expenses',
  LOANS: 'agrimind_finance_loans',
};

// Initial realistic agricultural sample data
const DEFAULT_INCOME: IncomeItem[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    source: 'Wheat Grain Harvest Sale (APMC Mandi)',
    amount: 125000,
    income_date: '2026-04-12',
    description: '50 quintals Sharbati wheat sold at ₹2,500/quintal at Nashik APMC Yard',
    buyer_name: 'Kisan Mandi Traders Ltd',
    payment_mode: 'Bank Transfer',
  },
  {
    id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    source: 'Soybean Harvest Advance Sale',
    amount: 67000,
    income_date: '2026-05-20',
    description: 'Advance token payment for upcoming Kharif crop harvest lot',
    buyer_name: 'AgroCorp Processing Hub',
    payment_mode: 'Bank Transfer',
  },
  {
    id: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
    source: 'PM-KISAN Direct Benefit Transfer',
    amount: 2000,
    income_date: '2026-06-01',
    description: 'Direct income support installment 17 credited to DBT bank account',
    buyer_name: 'Ministry of Agriculture DBT',
    payment_mode: 'Bank Transfer',
  },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
    category: 'Seeds',
    amount: 14500,
    expense_date: '2026-05-28',
    description: 'Certified Hybrid Pioneer Maize & JS-335 Soybean Seeds (6 bags)',
    payment_mode: 'UPI',
    vendor_name: 'Shree Ram Krishi Kendra',
  },
  {
    id: '7fa85f64-5717-4562-b3fc-2c963f66afb0',
    category: 'Fertilisers',
    amount: 18200,
    expense_date: '2026-06-05',
    description: 'IFFCO Neem-Coated Urea (12 bags) and DAP (6 bags) for basal application',
    payment_mode: 'Cash',
    vendor_name: 'District Kisan Seva Sahakari',
  },
  {
    id: '8fa85f64-5717-4562-b3fc-2c963f66afb1',
    category: 'Labour',
    amount: 16500,
    expense_date: '2026-06-18',
    description: 'Pre-sowing land levelling, bund trimming & transplantation (33 person-days)',
    payment_mode: 'Cash',
    vendor_name: 'Local Farm Worker Group',
  },
  {
    id: '9fa85f64-5717-4562-b3fc-2c963f66afb2',
    category: 'Equipment',
    amount: 12800,
    expense_date: '2026-06-22',
    description: 'Tractor rotavator tillage rental (16 hours @ ₹800/hr)',
    payment_mode: 'UPI',
    vendor_name: 'Balaji Agri Machinery Rental',
  },
  {
    id: 'afa85f64-5717-4562-b3fc-2c963f66afb3',
    category: 'Transportation',
    amount: 6400,
    expense_date: '2026-06-25',
    description: 'Mini-truck freight transporting bulk fertilizers and inputs from market depot',
    payment_mode: 'Cash',
    vendor_name: 'Sai Krupa Logistics',
  },
];

const DEFAULT_LOANS: LoanItem[] = [
  {
    id: 'bfa85f64-5717-4562-b3fc-2c963f66afb4',
    lender: 'State Bank of India (KCC)',
    loan_amount: 100000,
    interest_rate: 7.0,
    loan_date: '2026-01-15',
    due_date: '2027-01-15',
    repayment_details: 'Kisan Credit Card crop loan with 3% prompt repayment incentive',
    purpose: 'Kharif Crop Inputs & Pre-Monsoon Preparation',
    status: 'ACTIVE',
    total_repaid: 35000,
    pending_amount: 65000,
    repayments: [
      {
        id: 'cfa85f64-5717-4562-b3fc-2c963f66afb5',
        loan_id: 'bfa85f64-5717-4562-b3fc-2c963f66afb4',
        amount: 35000,
        payment_date: '2026-05-02',
        payment_mode: 'Bank Transfer',
        notes: 'First partial installment from Rabi harvest proceeds',
      },
    ],
  },
  {
    id: 'dfa85f64-5717-4562-b3fc-2c963f66afb6',
    lender: 'District Agricultural Cooperative Society',
    loan_amount: 40000,
    interest_rate: 6.5,
    loan_date: '2026-03-10',
    due_date: '2026-12-31',
    repayment_details: 'Micro-credit for solar irrigation pump subsidised down payment',
    purpose: 'Micro-Irrigation Infrastructure',
    status: 'ACTIVE',
    total_repaid: 10000,
    pending_amount: 30000,
    repayments: [
      {
        id: 'efa85f64-5717-4562-b3fc-2c963f66afb7',
        loan_id: 'dfa85f64-5717-4562-b3fc-2c963f66afb6',
        amount: 10000,
        payment_date: '2026-06-10',
        payment_mode: 'Cheque',
        notes: 'Quarterly interest and principal repayment',
      },
    ],
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export const financeApi = {
  // 1. Dashboard Summary
  async getSummary(): Promise<FinancialSummary> {
    try {
      const res = await apiClient.get<FinancialSummary>('/finance/summary');
      return res.data;
    } catch {
      const incomes = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      const expenses = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      const loans = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);

      const total_income = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
      const total_expenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const total_loans = loans.reduce((sum, l) => sum + Number(l.loan_amount), 0);
      const total_loan_repayments = loans.reduce(
        (sum, l) => sum + (l.repayments || []).reduce((rSum, r) => rSum + Number(r.amount), 0),
        0
      );
      const outstanding_loans = Math.max(0, total_loans - total_loan_repayments);
      const available_balance = total_income - total_expenses;

      const catMap: Record<string, number> = {};
      expenses.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
      });

      const expense_by_category = Object.entries(catMap)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: total_expenses > 0 ? Math.round((amount / total_expenses) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        total_income,
        total_expenses,
        total_loans,
        total_loan_repayments,
        outstanding_loans,
        available_balance,
        net_margin: available_balance,
        expense_by_category,
        recent_transactions_count: incomes.length + expenses.length,
      };
    }
  },

  // 2. Income Management
  async getIncomes(): Promise<IncomeItem[]> {
    try {
      const res = await apiClient.get<IncomeItem[]>('/finance/income');
      setStored(STORAGE_KEYS.INCOME, res.data);
      return res.data;
    } catch {
      return getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
    }
  },

  async addIncome(data: Omit<IncomeItem, 'id'>): Promise<IncomeItem> {
    try {
      const res = await apiClient.post<IncomeItem>('/finance/income', data);
      const list = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      setStored(STORAGE_KEYS.INCOME, [res.data, ...list]);
      return res.data;
    } catch {
      const newItem: IncomeItem = {
        ...data,
        id: 'inc_' + Date.now(),
      };
      const list = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      const updated = [newItem, ...list];
      setStored(STORAGE_KEYS.INCOME, updated);
      return newItem;
    }
  },

  async updateIncome(id: string, data: Partial<IncomeItem>): Promise<IncomeItem> {
    try {
      const res = await apiClient.put<IncomeItem>(`/finance/income/${id}`, data);
      const list = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      setStored(
        STORAGE_KEYS.INCOME,
        list.map((item) => (item.id === id ? res.data : item))
      );
      return res.data;
    } catch {
      const list = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      const updated = list.map((item) => (item.id === id ? { ...item, ...data } : item));
      setStored(STORAGE_KEYS.INCOME, updated);
      return updated.find((i) => i.id === id)!;
    }
  },

  async deleteIncome(id: string): Promise<void> {
    try {
      await apiClient.delete(`/finance/income/${id}`);
    } catch {}
    const list = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
    setStored(
      STORAGE_KEYS.INCOME,
      list.filter((i) => i.id !== id)
    );
  },

  // 3. Expense Management
  async getExpenses(category?: string): Promise<ExpenseItem[]> {
    try {
      const res = await apiClient.get<ExpenseItem[]>('/finance/expenses', {
        params: category ? { category } : undefined,
      });
      setStored(STORAGE_KEYS.EXPENSES, res.data);
      return res.data;
    } catch {
      const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      if (category && category !== 'All') {
        return list.filter((e) => e.category.toLowerCase() === category.toLowerCase());
      }
      return list;
    }
  },

  async addExpense(data: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    try {
      const res = await apiClient.post<ExpenseItem>('/finance/expenses', data);
      const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      setStored(STORAGE_KEYS.EXPENSES, [res.data, ...list]);
      return res.data;
    } catch {
      const newItem: ExpenseItem = {
        ...data,
        id: 'exp_' + Date.now(),
      };
      const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      setStored(STORAGE_KEYS.EXPENSES, [newItem, ...list]);
      return newItem;
    }
  },

  async updateExpense(id: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    try {
      const res = await apiClient.put<ExpenseItem>(`/finance/expenses/${id}`, data);
      const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      setStored(
        STORAGE_KEYS.EXPENSES,
        list.map((item) => (item.id === id ? res.data : item))
      );
      return res.data;
    } catch {
      const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
      const updated = list.map((item) => (item.id === id ? { ...item, ...data } : item));
      setStored(STORAGE_KEYS.EXPENSES, updated);
      return updated.find((e) => e.id === id)!;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete(`/finance/expenses/${id}`);
    } catch {}
    const list = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
    setStored(
      STORAGE_KEYS.EXPENSES,
      list.filter((e) => e.id !== id)
    );
  },

  // 4. Loan Management
  async getLoans(): Promise<LoanItem[]> {
    try {
      const res = await apiClient.get<LoanItem[]>('/finance/loans');
      setStored(STORAGE_KEYS.LOANS, res.data);
      return res.data;
    } catch {
      return getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
    }
  },

  async addLoan(data: Omit<LoanItem, 'id' | 'total_repaid' | 'pending_amount' | 'repayments'>): Promise<LoanItem> {
    try {
      const res = await apiClient.post<LoanItem>('/finance/loans', data);
      const list = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
      setStored(STORAGE_KEYS.LOANS, [res.data, ...list]);
      return res.data;
    } catch {
      const newItem: LoanItem = {
        ...data,
        id: 'loan_' + Date.now(),
        total_repaid: 0,
        pending_amount: data.loan_amount,
        repayments: [],
      };
      const list = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
      setStored(STORAGE_KEYS.LOANS, [newItem, ...list]);
      return newItem;
    }
  },

  async addLoanRepayment(
    loanId: string,
    repayment: { amount: number; payment_date: string; payment_mode: string; notes?: string }
  ): Promise<LoanItem> {
    try {
      const res = await apiClient.post<LoanItem>(`/finance/loans/${loanId}/repayments`, repayment);
      const list = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
      setStored(
        STORAGE_KEYS.LOANS,
        list.map((l) => (l.id === loanId ? res.data : l))
      );
      return res.data;
    } catch {
      const list = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
      const updated = list.map((l) => {
        if (l.id !== loanId) return l;
        const newRep: LoanRepayment = {
          id: 'rep_' + Date.now(),
          loan_id: loanId,
          ...repayment,
        };
        const allReps = [...(l.repayments || []), newRep];
        const totRepaid = allReps.reduce((s, r) => s + Number(r.amount), 0);
        const pending = Math.max(0, l.loan_amount - totRepaid);
        return {
          ...l,
          repayments: allReps,
          total_repaid: totRepaid,
          pending_amount: pending,
          status: pending <= 0 ? ('REPAID' as const) : l.status,
        };
      });
      setStored(STORAGE_KEYS.LOANS, updated);
      return updated.find((l) => l.id === loanId)!;
    }
  },

  async deleteLoan(id: string): Promise<void> {
    try {
      await apiClient.delete(`/finance/loans/${id}`);
    } catch {}
    const list = getStored<LoanItem[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
    setStored(
      STORAGE_KEYS.LOANS,
      list.filter((l) => l.id !== id)
    );
  },

  // 5. Transaction History
  async getTransactions(params?: {
    search?: string;
    type?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<TransactionHistoryResponse> {
    try {
      const res = await apiClient.get<TransactionHistoryResponse>('/finance/transactions', { params });
      return res.data;
    } catch {
      const incomes = getStored<IncomeItem[]>(STORAGE_KEYS.INCOME, DEFAULT_INCOME);
      const expenses = getStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);

      const incomeTx: TransactionItem[] = incomes.map((i) => ({
        id: i.id,
        type: 'INCOME',
        category_or_source: i.source,
        amount: i.amount,
        date: i.income_date,
        description: i.description,
        party: i.buyer_name,
        payment_mode: i.payment_mode,
      }));

      const expenseTx: TransactionItem[] = expenses.map((e) => ({
        id: e.id,
        type: 'EXPENSE',
        category_or_source: e.category,
        amount: e.amount,
        date: e.expense_date,
        description: e.description,
        party: e.vendor_name,
        payment_mode: e.payment_mode,
      }));

      let list: TransactionItem[] = [];
      if (!params?.type || params.type === 'ALL' || params.type === 'INCOME') {
        list = [...list, ...incomeTx];
      }
      if (!params?.type || params.type === 'ALL' || params.type === 'EXPENSE') {
        list = [...list, ...expenseTx];
      }

      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.category_or_source.toLowerCase().includes(s) ||
            (t.description && t.description.toLowerCase().includes(s)) ||
            (t.party && t.party.toLowerCase().includes(s))
        );
      }

      if (params?.category && params.category !== 'All') {
        const c = params.category.toLowerCase();
        list = list.filter((t) => t.category_or_source.toLowerCase() === c);
      }

      if (params?.start_date) {
        list = list.filter((t) => t.date >= params.start_date!);
      }
      if (params?.end_date) {
        list = list.filter((t) => t.date <= params.end_date!);
      }

      list.sort((a, b) => (a.date < b.date ? 1 : -1));

      const total_income = list.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const total_expenses = list.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

      return {
        total_count: list.length,
        total_income,
        total_expenses,
        net_cash_flow: total_income - total_expenses,
        transactions: list,
      };
    }
  },
};
