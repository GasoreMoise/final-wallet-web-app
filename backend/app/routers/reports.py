from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.post("/", response_model=List[schemas.TransactionResponse])
def generate_report(
    params: schemas.ReportParams,
    db: Session = Depends(get_db)
):
    # Get the default user
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(models.Transaction).filter(
        models.Transaction.owner_id == user.id,
        models.Transaction.date >= params.start_date,
        models.Transaction.date <= params.end_date
    )

    if params.account_ids:
        query = query.filter(models.Transaction.account_id.in_(params.account_ids))
    if params.category_ids:
        query = query.filter(models.Transaction.category_id.in_(params.category_ids))
    if params.transaction_type:
        query = query.filter(models.Transaction.type == params.transaction_type)

    return query.all()

@router.get("/summary", response_model=schemas.DetailedReport)
def get_summary(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get the default user
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions = db.query(models.Transaction).filter(
        models.Transaction.owner_id == user.id,
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).all()

    total_income = sum(t.amount for t in transactions if t.type == models.TransactionType.INCOME)
    total_expenses = sum(t.amount for t in transactions if t.type == models.TransactionType.EXPENSE)
    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    return {
        "transactions": transactions,
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_savings": net_savings,
            "savings_rate": savings_rate
        }
    }

@router.get("/dashboard", response_model=schemas.DashboardData)
def get_dashboard_data(db: Session = Depends(get_db)):
    # Get the default user
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get monthly trends
    monthly_trends = []
    transactions = db.query(models.Transaction).filter(
        models.Transaction.owner_id == user.id
    ).all()

    # Group transactions by month
    month_data = {}
    for t in transactions:
        month_key = t.date.strftime("%Y-%m")
        if month_key not in month_data:
            month_data[month_key] = {"income": 0, "expenses": 0}
        if t.type == models.TransactionType.INCOME:
            month_data[month_key]["income"] += t.amount
        else:
            month_data[month_key]["expenses"] += t.amount

    for month, data in sorted(month_data.items()):
        monthly_trends.append({
            "month": month,
            "income": data["income"],
            "expenses": data["expenses"]
        })

    # Get category breakdown
    category_breakdown = []
    categories = db.query(models.Category).filter(
        models.Category.owner_id == user.id
    ).all()

    total_expenses = sum(t.amount for t in transactions if t.type == models.TransactionType.EXPENSE)
    
    for category in categories:
        category_expenses = sum(t.amount for t in transactions 
                              if t.category_id == category.id and t.type == models.TransactionType.EXPENSE)
        if category_expenses > 0:
            category_breakdown.append({
                "category": category.name,
                "amount": category_expenses,
                "percentage": (category_expenses / total_expenses * 100) if total_expenses > 0 else 0
            })

    # Calculate financial summary
    total_income = sum(t.amount for t in transactions if t.type == models.TransactionType.INCOME)
    total_expenses = sum(t.amount for t in transactions if t.type == models.TransactionType.EXPENSE)
    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    return {
        "monthlyTrends": monthly_trends,
        "categoryBreakdown": category_breakdown,
        "financialSummary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_savings": net_savings,
            "savings_rate": savings_rate
        }
    }
