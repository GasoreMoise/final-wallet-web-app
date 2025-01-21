from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Dict, Any
from calendar import monthrange

from ..models import Transaction, Category, TransactionType
from ..schemas import transaction as transaction_schema

def get_monthly_trends(db: Session, user_id: int, months: int = 6) -> Dict[str, Any]:
    """Get monthly income and expense trends"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months)

    # Get monthly aggregates
    monthly_data = (
        db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            Transaction.type,
            func.sum(Transaction.amount).label('total')
        )
        .filter(
            Transaction.owner_id == user_id,
            Transaction.date.between(start_date, end_date)
        )
        .group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            Transaction.type
        )
        .order_by('year', 'month')
        .all()
    )

    # Process data into the required format
    months_labels = []
    income_data = []
    expense_data = []

    for year, month, type_, total in monthly_data:
        month_label = datetime(int(year), int(month), 1).strftime('%b %Y')
        if month_label not in months_labels:
            months_labels.append(month_label)
            income_data.append(0)
            expense_data.append(0)
        
        idx = months_labels.index(month_label)
        if type_ == TransactionType.INCOME:
            income_data[idx] = float(total)
        else:
            expense_data[idx] = float(total)

    return {
        "labels": months_labels,
        "income": income_data,
        "expenses": expense_data
    }

def get_category_breakdown(db: Session, user_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Get expense breakdown by category"""
    category_totals = (
        db.query(
            Category.name,
            func.sum(Transaction.amount).label('total')
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.owner_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date.between(start_date, end_date)
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return {
        "labels": [cat[0] for cat in category_totals],
        "data": [float(cat[1]) for cat in category_totals]
    }

def get_financial_summary(db: Session, user_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Get financial summary including income, expenses, and savings rate"""
    
    # Get total income and expenses
    totals = (
        db.query(
            Transaction.type,
            func.sum(Transaction.amount).label('total')
        )
        .filter(
            Transaction.owner_id == user_id,
            Transaction.date.between(start_date, end_date)
        )
        .group_by(Transaction.type)
        .all()
    )

    total_income = 0
    total_expenses = 0
    for type_, total in totals:
        if type_ == TransactionType.INCOME:
            total_income = float(total)
        else:
            total_expenses = float(total)

    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    return {
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "netSavings": net_savings,
        "savingsRate": savings_rate
    }

def generate_detailed_report(db: Session, user_id: int, start_date: datetime, end_date: datetime,
                           account_ids: List[int] = None, category_ids: List[int] = None,
                           transaction_type: str = None) -> Dict[str, Any]:
    """Generate a detailed financial report with various metrics and breakdowns"""
    
    # Base query for transactions
    query = db.query(Transaction).filter(
        Transaction.owner_id == user_id,
        Transaction.date.between(start_date, end_date)
    )

    # Apply filters if provided
    if account_ids:
        query = query.filter(Transaction.account_id.in_(account_ids))
    if category_ids:
        query = query.filter(Transaction.category_id.in_(category_ids))
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)

    transactions = query.all()

    # Get various summaries
    monthly_trends = get_monthly_trends(db, user_id)
    category_breakdown = get_category_breakdown(db, user_id, start_date, end_date)
    financial_summary = get_financial_summary(db, user_id, start_date, end_date)

    return {
        "summary": financial_summary,
        "monthlyTrends": monthly_trends,
        "categoryBreakdown": category_breakdown,
        "transactions": [transaction_schema.Transaction.from_orm(t) for t in transactions]
    }
