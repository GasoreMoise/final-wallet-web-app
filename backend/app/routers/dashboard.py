from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from calendar import monthrange

from ..database import get_db
from ..models import Transaction, Category, Account
from ..schemas import DashboardResponse, TransactionResponse

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(db: Session = Depends(get_db)):
    # Get total balance
    total_balance = db.query(func.sum(Account.balance)).scalar() or 0

    # Get recent transactions (last 5)
    recent_transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.desc())
        .limit(5)
        .all()
    )

    # Calculate monthly spending for the last 6 months
    today = datetime.now()
    six_months_ago = today - timedelta(days=180)
    monthly_spending = (
        db.query(
            func.date_trunc('month', Transaction.date).label('month'),
            func.sum(Transaction.amount).label('amount')
        )
        .filter(Transaction.type == 'EXPENSE')
        .filter(Transaction.date >= six_months_ago)
        .group_by(func.date_trunc('month', Transaction.date))
        .order_by(func.date_trunc('month', Transaction.date))
        .all()
    )

    # Calculate monthly trends (income vs expenses)
    monthly_trends = (
        db.query(
            func.date_trunc('month', Transaction.date).label('month'),
            Transaction.type,
            func.sum(Transaction.amount).label('amount')
        )
        .filter(Transaction.date >= six_months_ago)
        .group_by(func.date_trunc('month', Transaction.date), Transaction.type)
        .order_by(func.date_trunc('month', Transaction.date))
        .all()
    )

    # Process monthly trends data
    trends_by_month = {}
    for trend in monthly_trends:
        month_str = trend.month.strftime('%Y-%m')
        if month_str not in trends_by_month:
            trends_by_month[month_str] = {'INCOME': 0, 'EXPENSE': 0}
        trends_by_month[month_str][trend.type] = float(trend.amount)

    # Get category breakdown for current month
    first_day = datetime(today.year, today.month, 1)
    last_day = datetime(today.year, today.month, monthrange(today.year, today.month)[1])
    
    category_breakdown = (
        db.query(
            Category.name,
            func.sum(Transaction.amount).label('amount')
        )
        .join(Transaction)
        .filter(Transaction.type == 'EXPENSE')
        .filter(Transaction.date.between(first_day, last_day))
        .group_by(Category.name)
        .all()
    )

    # Calculate summary statistics for the current month
    current_month_stats = (
        db.query(
            Transaction.type,
            func.sum(Transaction.amount).label('amount')
        )
        .filter(Transaction.date.between(first_day, last_day))
        .group_by(Transaction.type)
        .all()
    )

    total_income = 0
    total_expenses = 0
    for stat in current_month_stats:
        if stat.type == 'INCOME':
            total_income = float(stat.amount)
        else:
            total_expenses = float(stat.amount)

    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    # Prepare the response
    return {
        "totalBalance": float(total_balance),
        "recentTransactions": recent_transactions,
        "monthlySpending": [
            {"month": spending.month.strftime('%Y-%m'), "amount": float(spending.amount)}
            for spending in monthly_spending
        ],
        "monthlyTrends": {
            "labels": list(trends_by_month.keys()),
            "income": [trends_by_month[month]['INCOME'] for month in trends_by_month],
            "expenses": [trends_by_month[month]['EXPENSE'] for month in trends_by_month]
        },
        "categoryBreakdown": {
            "labels": [breakdown.name for breakdown in category_breakdown],
            "data": [float(breakdown.amount) for breakdown in category_breakdown]
        },
        "summary": {
            "totalIncome": total_income,
            "totalExpenses": total_expenses,
            "netSavings": net_savings,
            "savingsRate": savings_rate
        }
    }
