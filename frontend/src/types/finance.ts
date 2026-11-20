export type ExpenseCategory =
  | 'Seeds'
  | 'Fertilisers'
  | 'Labour'
  | 'Equipment'
  | 'Transportation'
  | 'Irrigation'
  | 'Agrochemicals'
  | 'Other';

export type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Credit';

export interface CategoryExpenseSummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  total_loans: number;
  total_loan_repayments: number;
  outstanding_loans: number;
  available_balance: number;
  net_margin: number;
  expense_by_category: CategoryExpenseSummary[];
  recent_transactions_count: number;
}

export interface IncomeItem {
  id: string;
  farm_id?: string;
  source: string;
  amount: number;
  income_date: string;
  description?: string;
  buyer_name?: string;
  payment_mode: PaymentMode;
  created_at?: string;
}

export interface ExpenseItem {
  id: string;
  farm_id?: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description?: string;
  payment_mode: PaymentMode;
  vendor_name?: string;
  created_at?: string;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
  created_at?: string;
}

export interface LoanItem {
  id: string;
  farm_id?: string;
  lender: string;
  loan_amount: number;
  interest_rate: number;
  loan_date: string;
  due_date?: string;
  repayment_details?: string;
  purpose?: string;
  status: 'ACTIVE' | 'REPAID' | 'DEFAULTED';
  total_repaid: number;
  pending_amount: number;
  repayments: LoanRepayment[];
  created_at?: string;
}

export interface TransactionItem {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category_or_source: string;
  amount: number;
  date: string;
  description?: string;
  party?: string;
  payment_mode: string;
}

export interface TransactionHistoryResponse {
  total_count: number;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  transactions: TransactionItem[];
}
