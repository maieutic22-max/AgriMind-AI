import uuid
from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class ExpenseCategory(str, Enum):
    SEEDS = "Seeds"
    FERTILISERS = "Fertilisers"
    LABOUR = "Labour"
    EQUIPMENT = "Equipment"
    TRANSPORTATION = "Transportation"
    IRRIGATION = "Irrigation"
    AGROCHEMICALS = "Agrochemicals"
    OTHER = "Other"

class PaymentMode(str, Enum):
    CASH = "Cash"
    BANK_TRANSFER = "Bank Transfer"
    UPI = "UPI"
    CHEQUE = "Cheque"
    CREDIT = "Credit"

# --- Income Schemas ---
class IncomeBase(BaseModel):
    source: str = Field(..., min_length=2, max_length=255, description="Source of income, e.g. Wheat Harvest Sale, PM-KISAN Subsidy")
    amount: float = Field(..., gt=0, description="Amount in INR (₹)")
    income_date: date = Field(default_factory=date.today, description="Date of income receipt")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed notes or description")
    buyer_name: Optional[str] = Field(None, max_length=255, description="Buyer, Mandi trader, or agency")
    payment_mode: PaymentMode = Field(default=PaymentMode.CASH, description="Payment mode")

class IncomeCreate(IncomeBase):
    farm_id: Optional[uuid.UUID] = None

class IncomeUpdate(BaseModel):
    source: Optional[str] = Field(None, min_length=2, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    income_date: Optional[date] = None
    description: Optional[str] = None
    buyer_name: Optional[str] = None
    payment_mode: Optional[PaymentMode] = None

class IncomeResponse(IncomeBase):
    id: uuid.UUID
    farm_id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    category: ExpenseCategory = Field(..., description="Category: Seeds, Fertilisers, Labour, Equipment, Transportation, etc.")
    amount: float = Field(..., gt=0, description="Expense amount in INR (₹)")
    expense_date: date = Field(default_factory=date.today, description="Date expense incurred")
    description: Optional[str] = Field(None, max_length=1000, description="Description of the expense")
    payment_mode: PaymentMode = Field(default=PaymentMode.CASH, description="Payment method")
    vendor_name: Optional[str] = Field(None, max_length=255, description="Shop, dealer, or worker name")

class ExpenseCreate(ExpenseBase):
    farm_id: Optional[uuid.UUID] = None

class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = Field(None, gt=0)
    expense_date: Optional[date] = None
    description: Optional[str] = None
    payment_mode: Optional[PaymentMode] = None
    vendor_name: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: uuid.UUID
    farm_id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Loan & Repayment Schemas ---
class LoanRepaymentBase(BaseModel):
    amount: float = Field(..., gt=0, description="Repayment installment amount in INR (₹)")
    payment_date: date = Field(default_factory=date.today, description="Payment date")
    payment_mode: PaymentMode = Field(default=PaymentMode.BANK_TRANSFER, description="Payment method")
    notes: Optional[str] = Field(None, max_length=500, description="Repayment reference or notes")

class LoanRepaymentCreate(LoanRepaymentBase):
    pass

class LoanRepaymentResponse(LoanRepaymentBase):
    id: uuid.UUID
    loan_id: uuid.UUID
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LoanBase(BaseModel):
    lender: str = Field(..., min_length=2, max_length=255, description="Lender name (e.g. SBI KCC, District Cooperative, Local Lender)")
    loan_amount: float = Field(..., gt=0, description="Principal loan amount in INR (₹)")
    interest_rate: float = Field(default=7.0, ge=0, le=100, description="Annual interest percentage")
    loan_date: date = Field(default_factory=date.today, description="Disbursement date")
    due_date: Optional[date] = Field(None, description="Repayment due date")
    repayment_details: Optional[str] = Field(None, max_length=1000, description="Terms, installment schedule, or collateral notes")
    purpose: Optional[str] = Field(None, max_length=255, description="Loan purpose (e.g. Kharif Inputs, Drip Irrigation, Tractor Purchase)")
    status: str = Field(default="ACTIVE", description="ACTIVE, REPAID, DEFAULTED")

class LoanCreate(LoanBase):
    farm_id: Optional[uuid.UUID] = None

class LoanUpdate(BaseModel):
    lender: Optional[str] = Field(None, min_length=2, max_length=255)
    loan_amount: Optional[float] = Field(None, gt=0)
    interest_rate: Optional[float] = Field(None, ge=0, le=100)
    loan_date: Optional[date] = None
    due_date: Optional[date] = None
    repayment_details: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None

class LoanResponse(LoanBase):
    id: uuid.UUID
    farm_id: Optional[uuid.UUID] = None
    total_repaid: float = 0.0
    pending_amount: float = 0.0
    repayments: List[LoanRepaymentResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Financial Dashboard Summary ---
class CategoryExpenseSummary(BaseModel):
    category: str
    amount: float
    percentage: float

class FinancialDashboardSummary(BaseModel):
    total_income: float = Field(..., description="Total farm income received")
    total_expenses: float = Field(..., description="Total farm operating and input expenses")
    total_loans: float = Field(..., description="Total principal loans taken")
    total_loan_repayments: float = Field(..., description="Total loan repayments made")
    outstanding_loans: float = Field(..., description="Total pending loan obligation")
    available_balance: float = Field(..., description="Available cash balance = total_income - total_expenses")
    net_margin: float = Field(..., description="Net margin = total_income - total_expenses")
    expense_by_category: List[CategoryExpenseSummary] = []
    recent_transactions_count: int = 0

# --- Unified Transaction History ---
class TransactionType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class TransactionItem(BaseModel):
    id: uuid.UUID
    type: TransactionType
    category_or_source: str
    amount: float
    date: date
    description: Optional[str] = None
    party: Optional[str] = None  # buyer or vendor
    payment_mode: str

class TransactionHistoryResponse(BaseModel):
    total_count: int
    total_income: float
    total_expenses: float
    net_cash_flow: float
    transactions: List[TransactionItem]
