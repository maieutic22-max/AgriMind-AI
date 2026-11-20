import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models.finance import Income as IncomeModel, Expense as ExpenseModel, Loan as LoanModel, LoanRepayment as LoanRepaymentModel
from app.schemas.finance import (
    IncomeCreate, IncomeUpdate, IncomeResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    LoanCreate, LoanUpdate, LoanResponse, LoanRepaymentCreate, LoanRepaymentResponse,
    FinancialDashboardSummary, CategoryExpenseSummary,
    TransactionHistoryResponse, TransactionItem, TransactionType
)

router = APIRouter(prefix="/finance", tags=["Farm Financial Management (Member 3)"])

# --------------------------------------------------------------------------
# Realistic In-Memory Baseline Seed Data (Active when DB is in development mode)
# --------------------------------------------------------------------------
_IN_MEMORY_INCOMES: List[dict] = [
    {
        "id": uuid.UUID("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
        "farm_id": None,
        "source": "Wheat Grain Harvest Sale (APMC Mandi)",
        "amount": 125000.00,
        "income_date": date(2026, 4, 12),
        "description": "50 quintals Sharbati wheat sold at ₹2,500/quintal at Nashik APMC Yard",
        "buyer_name": "Kisan Mandi Traders Ltd",
        "payment_mode": "Bank Transfer",
        "created_at": datetime(2026, 4, 12, 11, 30),
        "updated_at": datetime(2026, 4, 12, 11, 30)
    },
    {
        "id": uuid.UUID("4fa85f64-5717-4562-b3fc-2c963f66afa7"),
        "farm_id": None,
        "source": "Soybean Harvest Advance Sale",
        "amount": 67000.00,
        "income_date": date(2026, 5, 20),
        "description": "Advance token payment for upcoming Kharif crop harvest lot",
        "buyer_name": "AgroCorp Processing Hub",
        "payment_mode": "Bank Transfer",
        "created_at": datetime(2026, 5, 20, 14, 0),
        "updated_at": datetime(2026, 5, 20, 14, 0)
    },
    {
        "id": uuid.UUID("5fa85f64-5717-4562-b3fc-2c963f66afa8"),
        "farm_id": None,
        "source": "PM-KISAN Direct Benefit Transfer",
        "amount": 2000.00,
        "income_date": date(2026, 6, 1),
        "description": "Direct income support installment 17 credited to DBT bank account",
        "buyer_name": "Ministry of Agriculture DBT",
        "payment_mode": "Bank Transfer",
        "created_at": datetime(2026, 6, 1, 9, 15),
        "updated_at": datetime(2026, 6, 1, 9, 15)
    }
]

_IN_MEMORY_EXPENSES: List[dict] = [
    {
        "id": uuid.UUID("6fa85f64-5717-4562-b3fc-2c963f66afa9"),
        "farm_id": None,
        "category": "Seeds",
        "amount": 14500.00,
        "expense_date": date(2026, 5, 28),
        "description": "Certified Hybrid Pioneer Maize & JS-335 Soybean Seeds (6 bags)",
        "payment_mode": "UPI",
        "vendor_name": "Shree Ram Krishi Kendra",
        "created_at": datetime(2026, 5, 28, 10, 0),
        "updated_at": datetime(2026, 5, 28, 10, 0)
    },
    {
        "id": uuid.UUID("7fa85f64-5717-4562-b3fc-2c963f66afb0"),
        "farm_id": None,
        "category": "Fertilisers",
        "amount": 18200.00,
        "expense_date": date(2026, 6, 5),
        "description": "IFFCO Neem-Coated Urea (12 bags) and DAP (6 bags) for basal application",
        "payment_mode": "Cash",
        "vendor_name": "District Kisan Seva Sahakari",
        "created_at": datetime(2026, 6, 5, 12, 15),
        "updated_at": datetime(2026, 6, 5, 12, 15)
    },
    {
        "id": uuid.UUID("8fa85f64-5717-4562-b3fc-2c963f66afb1"),
        "farm_id": None,
        "category": "Labour",
        "amount": 16500.00,
        "expense_date": date(2026, 6, 18),
        "description": "Pre-sowing land levelling, bund trimming & transplantation (33 person-days)",
        "payment_mode": "Cash",
        "vendor_name": "Local Farm Worker Group",
        "created_at": datetime(2026, 6, 18, 18, 30),
        "updated_at": datetime(2026, 6, 18, 18, 30)
    },
    {
        "id": uuid.UUID("9fa85f64-5717-4562-b3fc-2c963f66afb2"),
        "farm_id": None,
        "category": "Equipment",
        "amount": 12800.00,
        "expense_date": date(2026, 6, 22),
        "description": "Tractor rotavator tillage rental (16 hours @ ₹800/hr)",
        "payment_mode": "UPI",
        "vendor_name": "Balaji Agri Machinery Rental",
        "created_at": datetime(2026, 6, 22, 16, 45),
        "updated_at": datetime(2026, 6, 22, 16, 45)
    },
    {
        "id": uuid.UUID("afa85f64-5717-4562-b3fc-2c963f66afb3"),
        "farm_id": None,
        "category": "Transportation",
        "amount": 6400.00,
        "expense_date": date(2026, 6, 25),
        "description": "Mini-truck freight transporting bulk fertilizers and inputs from market depot",
        "payment_mode": "Cash",
        "vendor_name": "Sai Krupa Logistics",
        "created_at": datetime(2026, 6, 25, 14, 20),
        "updated_at": datetime(2026, 6, 25, 14, 20)
    }
]

_IN_MEMORY_LOANS: List[dict] = [
    {
        "id": uuid.UUID("bfa85f64-5717-4562-b3fc-2c963f66afb4"),
        "farm_id": None,
        "lender": "State Bank of India (KCC)",
        "loan_amount": 100000.00,
        "interest_rate": 7.0,
        "loan_date": date(2026, 1, 15),
        "due_date": date(2027, 1, 15),
        "repayment_details": "Kisan Credit Card crop loan with 3% prompt repayment incentive",
        "purpose": "Kharif Crop Inputs & Pre-Monsoon Preparation",
        "status": "ACTIVE",
        "created_at": datetime(2026, 1, 15, 10, 0),
        "updated_at": datetime(2026, 1, 15, 10, 0),
        "repayments": [
            {
                "id": uuid.UUID("cfa85f64-5717-4562-b3fc-2c963f66afb5"),
                "loan_id": uuid.UUID("bfa85f64-5717-4562-b3fc-2c963f66afb4"),
                "amount": 35000.00,
                "payment_date": date(2026, 5, 2),
                "payment_mode": "Bank Transfer",
                "notes": "First partial installment from Rabi harvest proceeds",
                "created_at": datetime(2026, 5, 2, 11, 0)
            }
        ]
    },
    {
        "id": uuid.UUID("dfa85f64-5717-4562-b3fc-2c963f66afb6"),
        "farm_id": None,
        "lender": "District Agricultural Cooperative Society",
        "loan_amount": 40000.00,
        "interest_rate": 6.5,
        "loan_date": date(2026, 3, 10),
        "due_date": date(2026, 12, 31),
        "repayment_details": "Micro-credit for solar irrigation pump subsidised down payment",
        "purpose": "Micro-Irrigation Infrastructure",
        "status": "ACTIVE",
        "created_at": datetime(2026, 3, 10, 10, 30),
        "updated_at": datetime(2026, 3, 10, 10, 30),
        "repayments": [
            {
                "id": uuid.UUID("efa85f64-5717-4562-b3fc-2c963f66afb7"),
                "loan_id": uuid.UUID("dfa85f64-5717-4562-b3fc-2c963f66afb6"),
                "amount": 10000.00,
                "payment_date": date(2026, 6, 10),
                "payment_mode": "Cheque",
                "notes": "Quarterly interest and principal repayment",
                "created_at": datetime(2026, 6, 10, 15, 0)
            }
        ]
    }
]

# --------------------------------------------------------------------------
# 1. Financial Dashboard Summary
# --------------------------------------------------------------------------
@router.get("/summary", response_model=FinancialDashboardSummary, summary="Get Farm Financial Dashboard Summary")
def get_financial_summary(db: Optional[Session] = Depends(get_db)):
    """
    Computes real-time farm financial summary:
    - Total Income
    - Total Expenses
    - Total Loans Taken & Total Repaid
    - Outstanding Loans
    - Available Cash Balance
    - Category-wise Expense Distribution
    """
    if db is not None:
        try:
            incomes = db.query(IncomeModel).all()
            expenses = db.query(ExpenseModel).all()
            loans = db.query(LoanModel).all()
            
            tot_income = sum(float(i.amount) for i in incomes)
            tot_expenses = sum(float(e.amount) for e in expenses)
            tot_loans = sum(float(l.loan_amount) for l in loans)
            tot_repaid = sum(
                sum(float(r.amount) for r in l.repayments)
                for l in loans
            )
            outstanding = max(0.0, tot_loans - tot_repaid)
            available = tot_income - tot_expenses

            # Category distribution
            cat_map = {}
            for e in expenses:
                c = e.category
                cat_map[c] = cat_map.get(c, 0.0) + float(e.amount)
            
            categories = [
                CategoryExpenseSummary(
                    category=cat,
                    amount=amt,
                    percentage=round((amt / tot_expenses * 100.0), 1) if tot_expenses > 0 else 0.0
                )
                for cat, amt in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
            ]

            return FinancialDashboardSummary(
                total_income=tot_income,
                total_expenses=tot_expenses,
                total_loans=tot_loans,
                total_loan_repayments=tot_repaid,
                outstanding_loans=outstanding,
                available_balance=available,
                net_margin=available,
                expense_by_category=categories,
                recent_transactions_count=len(incomes) + len(expenses)
            )
        except Exception:
            pass  # Fall back to in-memory state

    # In-memory computation
    tot_income = sum(i["amount"] for i in _IN_MEMORY_INCOMES)
    tot_expenses = sum(e["amount"] for e in _IN_MEMORY_EXPENSES)
    tot_loans = sum(l["loan_amount"] for l in _IN_MEMORY_LOANS)
    tot_repaid = sum(
        sum(r["amount"] for r in l.get("repayments", []))
        for l in _IN_MEMORY_LOANS
    )
    outstanding = max(0.0, tot_loans - tot_repaid)
    available = tot_income - tot_expenses

    cat_map = {}
    for e in _IN_MEMORY_EXPENSES:
        c = e["category"]
        cat_map[c] = cat_map.get(c, 0.0) + e["amount"]

    categories = [
        CategoryExpenseSummary(
            category=cat,
            amount=amt,
            percentage=round((amt / tot_expenses * 100.0), 1) if tot_expenses > 0 else 0.0
        )
        for cat, amt in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    ]

    return FinancialDashboardSummary(
        total_income=tot_income,
        total_expenses=tot_expenses,
        total_loans=tot_loans,
        total_loan_repayments=tot_repaid,
        outstanding_loans=outstanding,
        available_balance=available,
        net_margin=available,
        expense_by_category=categories,
        recent_transactions_count=len(_IN_MEMORY_INCOMES) + len(_IN_MEMORY_EXPENSES)
    )

# --------------------------------------------------------------------------
# 2. Income Management Endpoints
# --------------------------------------------------------------------------
@router.get("/income", response_model=List[IncomeResponse], summary="List all farm income records")
def list_income(db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            records = db.query(IncomeModel).order_by(IncomeModel.income_date.desc()).all()
            return records
        except Exception:
            pass
    return sorted(_IN_MEMORY_INCOMES, key=lambda x: x["income_date"], reverse=True)

@router.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED, summary="Add an income record")
def create_income(payload: IncomeCreate, db: Optional[Session] = Depends(get_db)):
    new_id = uuid.uuid4()
    now = datetime.now()
    
    if db is not None:
        try:
            record = IncomeModel(
                id=new_id,
                farm_id=payload.farm_id,
                source=payload.source,
                amount=payload.amount,
                income_date=payload.income_date,
                description=payload.description,
                buyer_name=payload.buyer_name,
                payment_mode=payload.payment_mode.value
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record
        except Exception:
            db.rollback()

    # In-memory save
    item = {
        "id": new_id,
        "farm_id": payload.farm_id,
        "source": payload.source,
        "amount": payload.amount,
        "income_date": payload.income_date,
        "description": payload.description,
        "buyer_name": payload.buyer_name,
        "payment_mode": payload.payment_mode.value,
        "created_at": now,
        "updated_at": now
    }
    _IN_MEMORY_INCOMES.insert(0, item)
    return item

@router.put("/income/{income_id}", response_model=IncomeResponse, summary="Edit an income record")
def update_income(income_id: uuid.UUID, payload: IncomeUpdate, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            record = db.query(IncomeModel).filter(IncomeModel.id == income_id).first()
            if record:
                if payload.source is not None:
                    record.source = payload.source
                if payload.amount is not None:
                    record.amount = payload.amount
                if payload.income_date is not None:
                    record.income_date = payload.income_date
                if payload.description is not None:
                    record.description = payload.description
                if payload.buyer_name is not None:
                    record.buyer_name = payload.buyer_name
                if payload.payment_mode is not None:
                    record.payment_mode = payload.payment_mode.value
                db.commit()
                db.refresh(record)
                return record
        except Exception:
            db.rollback()

    for item in _IN_MEMORY_INCOMES:
        if item["id"] == income_id:
            if payload.source is not None:
                item["source"] = payload.source
            if payload.amount is not None:
                item["amount"] = payload.amount
            if payload.income_date is not None:
                item["income_date"] = payload.income_date
            if payload.description is not None:
                item["description"] = payload.description
            if payload.buyer_name is not None:
                item["buyer_name"] = payload.buyer_name
            if payload.payment_mode is not None:
                item["payment_mode"] = payload.payment_mode.value
            item["updated_at"] = datetime.now()
            return item

    raise HTTPException(status_code=404, detail="Income record not found")

@router.delete("/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an income record")
def delete_income(income_id: uuid.UUID, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            record = db.query(IncomeModel).filter(IncomeModel.id == income_id).first()
            if record:
                db.delete(record)
                db.commit()
                return None
        except Exception:
            db.rollback()

    for i, item in enumerate(_IN_MEMORY_INCOMES):
        if item["id"] == income_id:
            _IN_MEMORY_INCOMES.pop(i)
            return None

    raise HTTPException(status_code=404, detail="Income record not found")

# --------------------------------------------------------------------------
# 3. Expense Management Endpoints
# --------------------------------------------------------------------------
@router.get("/expenses", response_model=List[ExpenseResponse], summary="List all farm expense records")
def list_expenses(category: Optional[str] = None, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            query = db.query(ExpenseModel)
            if category:
                query = query.filter(ExpenseModel.category == category)
            return query.order_by(ExpenseModel.expense_date.desc()).all()
        except Exception:
            pass

    results = _IN_MEMORY_EXPENSES
    if category:
        results = [e for e in results if e["category"].lower() == category.lower()]
    return sorted(results, key=lambda x: x["expense_date"], reverse=True)

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED, summary="Add an expense record")
def create_expense(payload: ExpenseCreate, db: Optional[Session] = Depends(get_db)):
    new_id = uuid.uuid4()
    now = datetime.now()

    if db is not None:
        try:
            record = ExpenseModel(
                id=new_id,
                farm_id=payload.farm_id,
                category=payload.category.value,
                amount=payload.amount,
                expense_date=payload.expense_date,
                description=payload.description,
                payment_mode=payload.payment_mode.value,
                vendor_name=payload.vendor_name
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record
        except Exception:
            db.rollback()

    item = {
        "id": new_id,
        "farm_id": payload.farm_id,
        "category": payload.category.value,
        "amount": payload.amount,
        "expense_date": payload.expense_date,
        "description": payload.description,
        "payment_mode": payload.payment_mode.value,
        "vendor_name": payload.vendor_name,
        "created_at": now,
        "updated_at": now
    }
    _IN_MEMORY_EXPENSES.insert(0, item)
    return item

@router.put("/expenses/{expense_id}", response_model=ExpenseResponse, summary="Edit an expense record")
def update_expense(expense_id: uuid.UUID, payload: ExpenseUpdate, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            record = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
            if record:
                if payload.category is not None:
                    record.category = payload.category.value
                if payload.amount is not None:
                    record.amount = payload.amount
                if payload.expense_date is not None:
                    record.expense_date = payload.expense_date
                if payload.description is not None:
                    record.description = payload.description
                if payload.payment_mode is not None:
                    record.payment_mode = payload.payment_mode.value
                if payload.vendor_name is not None:
                    record.vendor_name = payload.vendor_name
                db.commit()
                db.refresh(record)
                return record
        except Exception:
            db.rollback()

    for item in _IN_MEMORY_EXPENSES:
        if item["id"] == expense_id:
            if payload.category is not None:
                item["category"] = payload.category.value
            if payload.amount is not None:
                item["amount"] = payload.amount
            if payload.expense_date is not None:
                item["expense_date"] = payload.expense_date
            if payload.description is not None:
                item["description"] = payload.description
            if payload.payment_mode is not None:
                item["payment_mode"] = payload.payment_mode.value
            if payload.vendor_name is not None:
                item["vendor_name"] = payload.vendor_name
            item["updated_at"] = datetime.now()
            return item

    raise HTTPException(status_code=404, detail="Expense record not found")

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an expense record")
def delete_expense(expense_id: uuid.UUID, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            record = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
            if record:
                db.delete(record)
                db.commit()
                return None
        except Exception:
            db.rollback()

    for i, item in enumerate(_IN_MEMORY_EXPENSES):
        if item["id"] == expense_id:
            _IN_MEMORY_EXPENSES.pop(i)
            return None

    raise HTTPException(status_code=404, detail="Expense record not found")

# --------------------------------------------------------------------------
# 4. Loan & Repayment Management Endpoints
# --------------------------------------------------------------------------
def _enrich_loan(loan_dict: dict) -> LoanResponse:
    repayments = loan_dict.get("repayments", [])
    total_repaid = sum(r["amount"] for r in repayments)
    pending = max(0.0, loan_dict["loan_amount"] - total_repaid)
    status_val = "REPAID" if pending <= 0 else loan_dict.get("status", "ACTIVE")
    
    return LoanResponse(
        id=loan_dict["id"],
        farm_id=loan_dict.get("farm_id"),
        lender=loan_dict["lender"],
        loan_amount=loan_dict["loan_amount"],
        interest_rate=loan_dict.get("interest_rate", 7.0),
        loan_date=loan_dict["loan_date"],
        due_date=loan_dict.get("due_date"),
        repayment_details=loan_dict.get("repayment_details"),
        purpose=loan_dict.get("purpose"),
        status=status_val,
        total_repaid=total_repaid,
        pending_amount=pending,
        repayments=[
            LoanRepaymentResponse(
                id=r["id"],
                loan_id=r["loan_id"],
                amount=r["amount"],
                payment_date=r["payment_date"],
                payment_mode=r.get("payment_mode", "Bank Transfer"),
                notes=r.get("notes"),
                created_at=r.get("created_at")
            )
            for r in repayments
        ],
        created_at=loan_dict.get("created_at"),
        updated_at=loan_dict.get("updated_at")
    )

@router.get("/loans", response_model=List[LoanResponse], summary="List all farm loans with repayment tracking")
def list_loans(db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            loans = db.query(LoanModel).all()
            output = []
            for l in loans:
                repayments = [
                    {
                        "id": r.id,
                        "loan_id": r.loan_id,
                        "amount": float(r.amount),
                        "payment_date": r.payment_date,
                        "payment_mode": r.payment_mode,
                        "notes": r.notes,
                        "created_at": r.created_at
                    }
                    for r in l.repayments
                ]
                d = {
                    "id": l.id,
                    "farm_id": l.farm_id,
                    "lender": l.lender,
                    "loan_amount": float(l.loan_amount),
                    "interest_rate": float(l.interest_rate),
                    "loan_date": l.loan_date,
                    "due_date": l.due_date,
                    "repayment_details": l.repayment_details,
                    "purpose": l.purpose,
                    "status": l.status,
                    "repayments": repayments,
                    "created_at": l.created_at,
                    "updated_at": l.updated_at
                }
                output.append(_enrich_loan(d))
            return output
        except Exception:
            pass

    return [_enrich_loan(l) for l in sorted(_IN_MEMORY_LOANS, key=lambda x: x["loan_date"], reverse=True)]

@router.post("/loans", response_model=LoanResponse, status_code=status.HTTP_201_CREATED, summary="Record a farm loan")
def create_loan(payload: LoanCreate, db: Optional[Session] = Depends(get_db)):
    new_id = uuid.uuid4()
    now = datetime.now()

    if db is not None:
        try:
            record = LoanModel(
                id=new_id,
                farm_id=payload.farm_id,
                lender=payload.lender,
                loan_amount=payload.loan_amount,
                interest_rate=payload.interest_rate,
                loan_date=payload.loan_date,
                due_date=payload.due_date,
                repayment_details=payload.repayment_details,
                purpose=payload.purpose,
                status=payload.status
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return _enrich_loan({
                "id": record.id,
                "farm_id": record.farm_id,
                "lender": record.lender,
                "loan_amount": float(record.loan_amount),
                "interest_rate": float(record.interest_rate),
                "loan_date": record.loan_date,
                "due_date": record.due_date,
                "repayment_details": record.repayment_details,
                "purpose": record.purpose,
                "status": record.status,
                "repayments": [],
                "created_at": record.created_at,
                "updated_at": record.updated_at
            })
        except Exception:
            db.rollback()

    item = {
        "id": new_id,
        "farm_id": payload.farm_id,
        "lender": payload.lender,
        "loan_amount": payload.loan_amount,
        "interest_rate": payload.interest_rate,
        "loan_date": payload.loan_date,
        "due_date": payload.due_date,
        "repayment_details": payload.repayment_details,
        "purpose": payload.purpose,
        "status": payload.status,
        "repayments": [],
        "created_at": now,
        "updated_at": now
    }
    _IN_MEMORY_LOANS.insert(0, item)
    return _enrich_loan(item)

@router.post("/loans/{loan_id}/repayments", response_model=LoanResponse, summary="Record a loan repayment installment")
def add_loan_repayment(loan_id: uuid.UUID, payload: LoanRepaymentCreate, db: Optional[Session] = Depends(get_db)):
    rep_id = uuid.uuid4()
    now = datetime.now()

    if db is not None:
        try:
            loan = db.query(LoanModel).filter(LoanModel.id == loan_id).first()
            if not loan:
                raise HTTPException(status_code=404, detail="Loan not found")
            
            repayment = LoanRepaymentModel(
                id=rep_id,
                loan_id=loan_id,
                amount=payload.amount,
                payment_date=payload.payment_date,
                payment_mode=payload.payment_mode.value,
                notes=payload.notes
            )
            db.add(repayment)
            
            # Check if now fully repaid
            total_repaid = sum(float(r.amount) for r in loan.repayments) + float(payload.amount)
            if total_repaid >= float(loan.loan_amount):
                loan.status = "REPAID"
            db.commit()
            db.refresh(loan)
            
            # Reload enriched
            reps = [
                {
                    "id": r.id,
                    "loan_id": r.loan_id,
                    "amount": float(r.amount),
                    "payment_date": r.payment_date,
                    "payment_mode": r.payment_mode,
                    "notes": r.notes,
                    "created_at": r.created_at
                }
                for r in loan.repayments
            ]
            return _enrich_loan({
                "id": loan.id,
                "farm_id": loan.farm_id,
                "lender": loan.lender,
                "loan_amount": float(loan.loan_amount),
                "interest_rate": float(loan.interest_rate),
                "loan_date": loan.loan_date,
                "due_date": loan.due_date,
                "repayment_details": loan.repayment_details,
                "purpose": loan.purpose,
                "status": loan.status,
                "repayments": reps,
                "created_at": loan.created_at,
                "updated_at": loan.updated_at
            })
        except HTTPException:
            raise
        except Exception:
            db.rollback()

    for item in _IN_MEMORY_LOANS:
        if item["id"] == loan_id:
            rep_item = {
                "id": rep_id,
                "loan_id": loan_id,
                "amount": payload.amount,
                "payment_date": payload.payment_date,
                "payment_mode": payload.payment_mode.value,
                "notes": payload.notes,
                "created_at": now
            }
            item.setdefault("repayments", []).append(rep_item)
            item["updated_at"] = now
            return _enrich_loan(item)

    raise HTTPException(status_code=404, detail="Loan not found")

@router.delete("/loans/{loan_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a loan record")
def delete_loan(loan_id: uuid.UUID, db: Optional[Session] = Depends(get_db)):
    if db is not None:
        try:
            loan = db.query(LoanModel).filter(LoanModel.id == loan_id).first()
            if loan:
                db.delete(loan)
                db.commit()
                return None
        except Exception:
            db.rollback()

    for i, item in enumerate(_IN_MEMORY_LOANS):
        if item["id"] == loan_id:
            _IN_MEMORY_LOANS.pop(i)
            return None

    raise HTTPException(status_code=404, detail="Loan not found")

# --------------------------------------------------------------------------
# 5. Unified Transaction History with Search and Filtering
# --------------------------------------------------------------------------
@router.get("/transactions", response_model=TransactionHistoryResponse, summary="Get Unified Farm Transaction History")
def get_transaction_history(
    search: Optional[str] = Query(None, description="Search keyword in source, category, description, or party"),
    type: Optional[str] = Query(None, description="Filter: ALL, INCOME, or EXPENSE"),
    category: Optional[str] = Query(None, description="Category filter (Seeds, Fertilisers, Labour, etc.)"),
    start_date: Optional[date] = Query(None, description="From date"),
    end_date: Optional[date] = Query(None, description="To date"),
    db: Optional[Session] = Depends(get_db)
):
    """
    Returns an aggregated, chronological ledger of all farm financial operations
    (both income revenues and operational expenses) with search and category filters.
    """
    raw_incomes = []
    raw_expenses = []

    if db is not None:
        try:
            incomes_db = db.query(IncomeModel).all()
            for i in incomes_db:
                raw_incomes.append({
                    "id": i.id,
                    "type": TransactionType.INCOME,
                    "category_or_source": i.source,
                    "amount": float(i.amount),
                    "date": i.income_date,
                    "description": i.description,
                    "party": i.buyer_name,
                    "payment_mode": i.payment_mode
                })

            expenses_db = db.query(ExpenseModel).all()
            for e in expenses_db:
                raw_expenses.append({
                    "id": e.id,
                    "type": TransactionType.EXPENSE,
                    "category_or_source": e.category,
                    "amount": float(e.amount),
                    "date": e.expense_date,
                    "description": e.description,
                    "party": e.vendor_name,
                    "payment_mode": e.payment_mode
                })
        except Exception:
            pass

    if not raw_incomes and not raw_expenses:
        for i in _IN_MEMORY_INCOMES:
            raw_incomes.append({
                "id": i["id"],
                "type": TransactionType.INCOME,
                "category_or_source": i["source"],
                "amount": i["amount"],
                "date": i["income_date"],
                "description": i.get("description"),
                "party": i.get("buyer_name"),
                "payment_mode": i.get("payment_mode", "Cash")
            })
        for e in _IN_MEMORY_EXPENSES:
            raw_expenses.append({
                "id": e["id"],
                "type": TransactionType.EXPENSE,
                "category_or_source": e["category"],
                "amount": e["amount"],
                "date": e["expense_date"],
                "description": e.get("description"),
                "party": e.get("vendor_name"),
                "payment_mode": e.get("payment_mode", "Cash")
            })

    # Extract actual parameter values if invoked directly as Python function
    search_val = search if isinstance(search, str) else None
    type_val = type.upper() if isinstance(type, str) else None
    cat_val = category.lower() if isinstance(category, str) and category.lower() != "all" else None
    start_val = start_date if isinstance(start_date, date) else None
    end_val = end_date if isinstance(end_date, date) else None

    # Combine into unified stream
    all_transactions: List[dict] = []
    if not type_val or type_val in ("ALL", "INCOME"):
        all_transactions.extend(raw_incomes)
    if not type_val or type_val in ("ALL", "EXPENSE"):
        all_transactions.extend(raw_expenses)

    # Filter by search
    if search_val:
        s = search_val.lower().strip()
        all_transactions = [
            t for t in all_transactions
            if (s in t["category_or_source"].lower() or
                (t["description"] and s in t["description"].lower()) or
                (t["party"] and s in t["party"].lower()))
        ]

    # Filter by category
    if cat_val:
        all_transactions = [
            t for t in all_transactions
            if t["category_or_source"].lower() == cat_val
        ]

    # Filter by date
    if start_val:
        all_transactions = [t for t in all_transactions if t["date"] >= start_val]
    if end_val:
        all_transactions = [t for t in all_transactions if t["date"] <= end_val]

    # Sort chronological descending
    all_transactions.sort(key=lambda x: x["date"], reverse=True)

    tot_inc = sum(t["amount"] for t in all_transactions if t["type"] == TransactionType.INCOME)
    tot_exp = sum(t["amount"] for t in all_transactions if t["type"] == TransactionType.EXPENSE)

    return TransactionHistoryResponse(
        total_count=len(all_transactions),
        total_income=tot_inc,
        total_expenses=tot_exp,
        net_cash_flow=tot_inc - tot_exp,
        transactions=[
            TransactionItem(
                id=t["id"],
                type=t["type"],
                category_or_source=t["category_or_source"],
                amount=t["amount"],
                date=t["date"],
                description=t["description"],
                party=t["party"],
                payment_mode=t["payment_mode"]
            )
            for t in all_transactions
        ]
    )
