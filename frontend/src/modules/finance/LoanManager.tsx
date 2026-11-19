import React, { useState } from 'react';
import { LoanItem, PaymentMode } from '../../types/finance';
import {
  CreditCard,
  Plus,
  History,
  X,
  PiggyBank,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoanManagerProps {
  loans: LoanItem[];
  onAddLoan: (item: Omit<LoanItem, 'id' | 'total_repaid' | 'pending_amount' | 'repayments'>) => Promise<void>;
  onAddRepayment: (
    loanId: string,
    repayment: { amount: number; payment_date: string; payment_mode: string; notes?: string }
  ) => Promise<void>;
  onDeleteLoan: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({
  loans,
  onAddLoan,
  onAddRepayment,
  onDeleteLoan,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<LoanItem | null>(null);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // New Loan Form States
  const [lender, setLender] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentDetails, setRepaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Repayment Form States
  const [repAmount, setRepAmount] = useState('');
  const [repDate, setRepDate] = useState(new Date().toISOString().split('T')[0]);
  const [repMode, setRepMode] = useState<PaymentMode>('Bank Transfer');
  const [repNotes, setRepNotes] = useState('');
  const [repError, setRepError] = useState('');
  const [repSubmitting, setRepSubmitting] = useState(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const openRepaymentModal = (loan: LoanItem) => {
    setSelectedLoanForRepayment(loan);
    setRepAmount('');
    setRepDate(new Date().toISOString().split('T')[0]);
    setRepMode('Bank Transfer');
    setRepNotes('');
    setRepError('');
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lender.trim()) {
      setFormError('Please enter lender name (e.g. State Bank of India KCC).');
      return;
    }
    const principal = parseFloat(loanAmount);
    if (isNaN(principal) || principal <= 0) {
      setFormError('Please enter a valid loan principal amount in ₹.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await onAddLoan({
        lender: lender.trim(),
        loan_amount: principal,
        interest_rate: parseFloat(interestRate) || 7.0,
        loan_date: loanDate,
        due_date: dueDate || undefined,
        purpose: purpose.trim() || undefined,
        repayment_details: repaymentDetails.trim() || undefined,
        status: 'ACTIVE',
      });
      setIsAddModalOpen(false);
      setLender('');
      setLoanAmount('');
      setPurpose('');
      setRepaymentDetails('');
    } catch {
      setFormError('Failed to record loan. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepayment) return;

    const amt = parseFloat(repAmount);
    if (isNaN(amt) || amt <= 0) {
      setRepError('Please enter a valid repayment installment amount.');
      return;
    }
    if (amt > selectedLoanForRepayment.pending_amount) {
      setRepError(`Installment cannot exceed pending amount (${formatINR(selectedLoanForRepayment.pending_amount)}).`);
      return;
    }

    setRepSubmitting(true);
    setRepError('');
    try {
      await onAddRepayment(selectedLoanForRepayment.id, {
        amount: amt,
        payment_date: repDate,
        payment_mode: repMode,
        notes: repNotes.trim() || undefined,
      });
      setSelectedLoanForRepayment(null);
    } catch {
      setRepError('Failed to record repayment.');
    } finally {
      setRepSubmitting(false);
    }
  };

  const totalOutstanding = loans.reduce((sum, l) => sum + Number(l.pending_amount), 0);
  const totalPrincipal = loans.reduce((sum, l) => sum + Number(l.loan_amount), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + Number(l.total_repaid), 0);

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Credit & Debt Servicing
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">{loans.length} active/tracked loans</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
            Agricultural Loan & Repayment Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record loan commitments, monitor pending balances, and log repayment installments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Record New Loan
        </button>
      </div>

      {/* Loan Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Borrowed Principal
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatINR(totalPrincipal)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Across all recorded facilities</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Repaid to Date
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {formatINR(totalRepaid)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {totalPrincipal > 0 ? Math.round((totalRepaid / totalPrincipal) * 100) : 0}% of debt amortized
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Pending Balance
          </div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">
            {formatINR(totalOutstanding)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Net outstanding obligation</div>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="space-y-4">
        {loans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No loan records tracked</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Record New Loan" to log institutional facilities like Kisan Credit Card (KCC), equipment financing, or cooperative credit.
            </p>
          </div>
        ) : (
          loans.map((loan) => {
            const repaidPct =
              loan.loan_amount > 0
                ? Math.min(100, Math.round((loan.total_repaid / loan.loan_amount) * 100))
                : 0;
            const isRepaid = loan.pending_amount <= 0 || loan.status === 'REPAID';
            const isExpanded = expandedLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{loan.lender}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {loan.purpose || 'Agricultural Working Capital'}
                        </span>
                      </div>
                      <span
                        className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isRepaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isRepaid ? 'FULLY REPAID' : 'ACTIVE LOAN'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {!isRepaid && (
                      <button
                        onClick={() => openRepaymentModal(loan)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Record Repayment
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete loan record from ${loan.lender}?`)) {
                          onDeleteLoan(loan.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-xs"
                      title="Delete loan"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Amounts */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Principal Loan
                      </span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {formatINR(loan.loan_amount)}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Amortized / Repaid
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatINR(loan.total_repaid)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Pending Balance
                      </span>
                      <span className="font-extrabold text-amber-700 text-sm">
                        {formatINR(loan.pending_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${repaidPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>{repaidPct}% Repaid</span>
                    <span>{100 - repaidPct}% Outstanding</span>
                  </div>
                </div>

                {/* Terms and Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Disbursed Date
                    </span>
                    <span className="font-semibold">{loan.loan_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Repayment Due
                    </span>
                    <span className="font-semibold">{loan.due_date || 'Annual Renewal'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Interest Rate
                    </span>
                    <span className="font-semibold">{loan.interest_rate}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Repayments Logged
                    </span>
                    <span className="font-semibold">{loan.repayments?.length || 0} installments</span>
                  </div>
                </div>

                {loan.repayment_details && (
                  <p className="text-xs text-slate-500 bg-white border border-slate-100 p-2.5 rounded-lg italic">
                    Note: {loan.repayment_details}
                  </p>
                )}

                {/* Collapsible Repayments History */}
                {loan.repayments && loan.repayments.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {isExpanded ? 'Hide Repayment History' : `View ${loan.repayments.length} Repayment Installments`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 animate-in fade-in duration-150">
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full text-left text-xs bg-slate-50/50">
                            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                              <tr>
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Amount</th>
                                <th className="py-2 px-3">Payment Mode</th>
                                <th className="py-2 px-3">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {loan.repayments.map((rep) => (
                                <tr key={rep.id} className="hover:bg-white transition-colors">
                                  <td className="py-2 px-3 font-semibold text-slate-600">
                                    {rep.payment_date}
                                  </td>
                                  <td className="py-2 px-3 font-bold text-emerald-700">
                                    {formatINR(rep.amount)}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">{rep.payment_mode}</td>
                                  <td className="py-2 px-3 text-slate-500">{rep.notes || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record New Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm tracking-tight">Record Agricultural Loan</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Lender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lender / Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India (KCC), District Cooperative"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Amount and Interest Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loan Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disbursed Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Repayment Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loan Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kharif Crop Inputs, Drip Irrigation, Tractor hire"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Repayment Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repayment Terms / Collateral Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3% subvention for on-time repayment, harvest pledge..."
                  value={repaymentDetails}
                  onChange={(e) => setRepaymentDetails(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {submitting ? 'Recording...' : 'Record Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {selectedLoanForRepayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-forest-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Record Loan Repayment</h3>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Lender: {selectedLoanForRepayment.lender}
                </p>
              </div>
              <button
                onClick={() => setSelectedLoanForRepayment(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRepayment} className="p-6 space-y-4">
              {repError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {repError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Pending Balance:</span>
                  <span className="font-bold text-amber-700">
                    {formatINR(selectedLoanForRepayment.pending_amount)}
                  </span>
                </div>
              </div>

              {/* Installment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repayment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={selectedLoanForRepayment.pending_amount}
                  required
                  placeholder={`Max: ${selectedLoanForRepayment.pending_amount}`}
                  value={repAmount}
                  onChange={(e) => setRepAmount(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              {/* Date and Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={repDate}
                    onChange={(e) => setRepDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={repMode}
                    onChange={(e) => setRepMode(e.target.value as PaymentMode)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR number, bank deposit slip reference"
                  value={repNotes}
                  onChange={(e) => setRepNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForRepayment(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={repSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {repSubmitting ? 'Recording...' : 'Submit Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
