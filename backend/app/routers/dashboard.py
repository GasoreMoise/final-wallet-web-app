from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from calendar import monthrange

from ..database import get_db
from ..models import Transaction, Category, Account, TransactionType
from ..schemas import DashboardResponse, TransactionResponse

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(db: Session = Depends(get_db)):
    try:
        # Get total balance
        total_balance = db.query(func.sum(Account.balance)).scalar() or 0.0

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
            .filter(Transaction.type == TransactionType.EXPENSE)
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

        # Format monthly trends data
        trends_data = {}
        for month, type_, amount in monthly_trends:
            month_str = month.strftime('%Y-%m')
            if month_str not in trends_data:
                trends_data[month_str] = {'income': 0, 'expense': 0}
            if type_ == TransactionType.INCOME:
                trends_data[month_str]['income'] = float(amount)
            else:
                trends_data[month_str]['expense'] = float(amount)

        # Calculate category breakdown
        category_breakdown = (
            db.query(
                Category.name,
                func.sum(Transaction.amount).label('amount')
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .filter(Transaction.type == TransactionType.EXPENSE)
            .filter(Transaction.date >= (today - timedelta(days=30)))
            .group_by(Category.name)
            .all()
        )

        # Calculate total expenses for percentage calculation
        total_expenses = sum(amount for _, amount in category_breakdown)
        
        # Format category breakdown data
        breakdown_data = [
            {
                'category': name,
                'amount': float(amount),
                'percentage': float(amount / total_expenses * 100) if total_expenses > 0 else 0
            }
            for name, amount in category_breakdown
        ]

        # Calculate financial summary
        current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        month_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == TransactionType.INCOME,
            Transaction.date >= current_month_start
        ).scalar() or 0.0

        month_expenses = db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date >= current_month_start
        ).scalar() or 0.0

        return {
            "totalBalance": float(total_balance),
            "recentTransactions": recent_transactions,
            "monthlySpending": [
                {
                    "month": month.strftime('%Y-%m'),
                    "amount": float(amount)
                }
                for month, amount in monthly_spending
            ],
            "monthlyTrends": trends_data,
            "categoryBreakdown": breakdown_data,
            "summary": {
                "monthIncome": float(month_income),
                "monthExpenses": float(month_expenses),
                "monthSavings": float(month_income - month_expenses),
                "savingsRate": float((month_income - month_expenses) / month_income * 100) if month_income > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
