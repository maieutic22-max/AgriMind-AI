import uuid
from datetime import date
from sqlalchemy import Column, String, Numeric, ForeignKey, Date, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Income(Base, TimestampMixin):
    __tablename__ = "incomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=True, index=True)
    source = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    income_date = Column(Date, default=date.today, nullable=False, index=True)
    description = Column(Text, nullable=True)
    buyer_name = Column(String(255), nullable=True)
    payment_mode = Column(String(50), default="Cash", nullable=False)

    farm = relationship("Farm", foreign_keys=[farm_id], lazy="joined")

class Expense(Base, TimestampMixin):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True)  # Seeds, Fertilisers, Labour, Equipment, Transportation, Other
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, default=date.today, nullable=False, index=True)
    description = Column(Text, nullable=True)
    payment_mode = Column(String(50), default="Cash", nullable=False)
    vendor_name = Column(String(255), nullable=True)

    farm = relationship("Farm", foreign_keys=[farm_id], lazy="joined")

class Loan(Base, TimestampMixin):
    __tablename__ = "loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=True, index=True)
    lender = Column(String(255), nullable=False)  # Bank, KCC, Cooperative Society, Money Lender
    loan_amount = Column(Numeric(12, 2), nullable=False)
    interest_rate = Column(Float, default=7.0, nullable=False)  # Annual %
    loan_date = Column(Date, default=date.today, nullable=False)
    due_date = Column(Date, nullable=True)
    repayment_details = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, REPAID, DEFAULTED
    purpose = Column(String(255), nullable=True)

    farm = relationship("Farm", foreign_keys=[farm_id], lazy="joined")
    repayments = relationship("LoanRepayment", back_populates="loan", cascade="all, delete-orphan", lazy="selectin")

class LoanRepayment(Base, TimestampMixin):
    __tablename__ = "loan_repayments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    loan_id = Column(UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(Date, default=date.today, nullable=False)
    payment_mode = Column(String(50), default="Bank Transfer", nullable=False)
    notes = Column(Text, nullable=True)

    loan = relationship("Loan", back_populates="repayments")
