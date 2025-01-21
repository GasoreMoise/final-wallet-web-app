from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Numeric, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class AccountType(str, enum.Enum):
    BANK = "bank"
    MOBILE_MONEY = "mobile_money"
    CASH = "cash"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(Enum(AccountType))
    balance = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(Enum(TransactionType))
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    type = Column(Enum(TransactionType))
    description = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"))
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    owner = relationship("User", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    spent = Column(Float, default=0.0)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"))
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    notification_threshold = Column(Float, default=0.8)
    is_active = Column(Boolean, default=True)

    category = relationship("Category", back_populates="budgets")
    owner = relationship("User", back_populates="budgets")

User.accounts = relationship("Account", back_populates="owner")
User.categories = relationship("Category", back_populates="owner")
User.transactions = relationship("Transaction", back_populates="owner")
User.budgets = relationship("Budget", back_populates="owner")
