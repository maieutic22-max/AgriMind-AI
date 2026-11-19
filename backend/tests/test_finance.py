import uuid
from datetime import date
from app.schemas.finance import (
    IncomeCreate, IncomeUpdate, PaymentMode,
    ExpenseCreate, ExpenseUpdate, ExpenseCategory,
    LoanCreate, LoanRepaymentCreate
)
from app.api.v1.routes.finance import (
    get_financial_summary,
    list_income, create_income, update_income, delete_income,
    list_expenses, create_expense, update_expense, delete_expense,
    list_loans, create_loan, add_loan_repayment, delete_loan,
    get_transaction_history
)

def test_financial_summary():
    summary = get_financial_summary(db=None)
    assert summary.total_income > 0
    assert summary.total_expenses > 0
    assert summary.outstanding_loans >= 0
    assert summary.available_balance == summary.total_income - summary.total_expenses
    assert len(summary.expense_by_category) > 0

def test_income_crud():
    # 1. Create Income
    new_income = create_income(
        IncomeCreate(
            source="Tomato Wholesale Sale",
            amount=45000.0,
            income_date=date(2026, 7, 10),
            description="Sold 15 crates of hybrid tomatoes",
            buyer_name="FreshVeggies Hub",
            payment_mode=PaymentMode.UPI
        ),
        db=None
    )
    assert new_income["source"] == "Tomato Wholesale Sale"
    assert new_income["amount"] == 45000.0
    income_id = new_income["id"]

    # 2. List Income
    incomes = list_income(db=None)
    assert any(i["id"] == income_id for i in incomes)

    # 3. Update Income
    updated = update_income(
        income_id,
        IncomeUpdate(amount=48000.0, description="Revised crate count (16 crates)"),
        db=None
    )
    assert updated["amount"] == 48000.0
    assert updated["description"] == "Revised crate count (16 crates)"

    # 4. Delete Income
    delete_income(income_id, db=None)
    incomes_after = list_income(db=None)
    assert not any(i["id"] == income_id for i in incomes_after)

def test_expense_crud():
    # 1. Create Expense
    new_expense = create_expense(
        ExpenseCreate(
            category=ExpenseCategory.FERTILISERS,
            amount=7500.0,
            expense_date=date(2026, 7, 12),
            description="Potash fertilizer 50kg bag",
            payment_mode=PaymentMode.CASH,
            vendor_name="Kisan Agro Store"
        ),
        db=None
    )
    assert new_expense["category"] == "Fertilisers"
    assert new_expense["amount"] == 7500.0
    expense_id = new_expense["id"]

    # 2. List Expenses (with filter)
    all_expenses = list_expenses(category=None, db=None)
    assert any(e["id"] == expense_id for e in all_expenses)

    fert_expenses = list_expenses(category="Fertilisers", db=None)
    assert any(e["id"] == expense_id for e in fert_expenses)

    # 3. Update Expense
    updated = update_expense(
        expense_id,
        ExpenseUpdate(amount=8000.0, description="Added micro-nutrient pack"),
        db=None
    )
    assert updated["amount"] == 8000.0

    # 4. Delete Expense
    delete_expense(expense_id, db=None)
    expenses_after = list_expenses(category=None, db=None)
    assert not any(e["id"] == expense_id for e in expenses_after)

def test_loan_and_repayment_management():
    # 1. Create Loan
    loan = create_loan(
        LoanCreate(
            lender="Canara Bank Agri Branch",
            loan_amount=50000.0,
            interest_rate=7.0,
            loan_date=date(2026, 6, 1),
            due_date=date(2027, 6, 1),
            purpose="Drip Line Replacement",
            repayment_details="Bi-monthly installments"
        ),
        db=None
    )
    assert loan.loan_amount == 50000.0
    assert loan.pending_amount == 50000.0
    assert loan.total_repaid == 0.0
    loan_id = loan.id

    # 2. List Loans
    loans = list_loans(db=None)
    assert any(l.id == loan_id for l in loans)

    # 3. Record Repayment Installment
    updated_loan = add_loan_repayment(
        loan_id,
        LoanRepaymentCreate(
            amount=20000.0,
            payment_date=date(2026, 8, 1),
            payment_mode=PaymentMode.BANK_TRANSFER,
            notes="First installment"
        ),
        db=None
    )
    assert updated_loan.total_repaid == 20000.0
    assert updated_loan.pending_amount == 30000.0
    assert updated_loan.status == "ACTIVE"

    # 4. Clean up loan
    delete_loan(loan_id, db=None)

def test_transaction_history_filtering():
    # 1. Fetch all
    all_tx = get_transaction_history(db=None)
    assert all_tx.total_count > 0
    assert all_tx.total_income > 0
    assert all_tx.total_expenses > 0
    assert all_tx.net_cash_flow == all_tx.total_income - all_tx.total_expenses

    # 2. Filter by Type: INCOME
    income_tx = get_transaction_history(type="INCOME", db=None)
    assert all(t.type == "INCOME" for t in income_tx.transactions)
    assert income_tx.total_expenses == 0

    # 3. Filter by Search
    search_tx = get_transaction_history(search="Wheat", db=None)
    assert len(search_tx.transactions) > 0
    assert any("wheat" in t.category_or_source.lower() or (t.description and "wheat" in t.description.lower()) for t in search_tx.transactions)
