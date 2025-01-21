from pydantic import BaseModel, constr, confloat, condecimal, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from .models import TransactionType, AccountType

__all__ = [
    'UserBase', 'UserCreate', 'UserResponse',
    'AccountBase', 'AccountCreate', 'AccountResponse',
    'CategoryBase', 'CategoryCreate', 'CategoryResponse',
    'TransactionBase', 'TransactionCreate', 'TransactionResponse',
    'BudgetBase', 'BudgetCreate', 'BudgetResponse',
    'BudgetNotification', 'BudgetSummary',
    'ReportParams', 'DashboardData', 'DetailedReport',
    'MonthlyTrends', 'CategoryBreakdown', 'FinancialSummary',
    'DashboardResponse'
]

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    name: str
    balance: Decimal
    currency: str = 'USD'
    type: AccountType = AccountType.BANK
    description: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: TransactionType

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: condecimal(max_digits=10, decimal_places=2)
    type: TransactionType
    description: Optional[str] = None
    category_id: Optional[int] = None
    account_id: int
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    amount: condecimal(max_digits=10, decimal_places=2)
    category_id: int
    start_date: datetime
    end_date: datetime
    notification_threshold: float = 0.8

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    spent: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetNotification(BaseModel):
    budget_id: int
    category_name: str
    amount_spent: float
    budget_amount: float
    percentage_used: float
    notification_threshold: float

    class Config:
        from_attributes = True

class BudgetSummary(BaseModel):
    budget_id: int
    category_name: str
    amount_spent: float
    budget_amount: float
    percentage_used: float
    start_date: datetime
    end_date: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ReportParams(BaseModel):
    start_date: datetime
    end_date: datetime
    account_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None
    transaction_type: Optional[TransactionType] = None

class DashboardData(BaseModel):
    monthlyTrends: List[dict]
    categoryBreakdown: List[dict]
    financialSummary: dict

    class Config:
        from_attributes = True

class DetailedReport(BaseModel):
    transactions: List[TransactionResponse]
    summary: dict
    trends: List[dict]

    class Config:
        from_attributes = True

class MonthlyTrends(BaseModel):
    month: int
    income: float
    expenses: float

    class Config:
        from_attributes = True

class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float

    class Config:
        from_attributes = True

class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float
    expenses_by_category: List[dict]

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    totalBalance: float
    recentTransactions: List[TransactionResponse]
    monthlySpending: List[dict]
    monthlyTrends: dict
    categoryBreakdown: dict
    summary: dict

    class Config:
        from_attributes = True
