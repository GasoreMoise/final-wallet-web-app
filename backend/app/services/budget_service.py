from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List

from ..models import Budget, Transaction, TransactionType
from ..schemas import budget as budget_schema
from fastapi import HTTPException, status

async def check_budget_limits(db: Session, user_id: int):
    """Check all active budgets for the user and return notifications for those exceeding threshold"""
    notifications = []
    active_budgets = (
        db.query(Budget)
        .filter(
            Budget.owner_id == user_id,
            Budget.is_active == True,
            Budget.end_date >= datetime.now()
        )
        .all()
    )

    for budget in active_budgets:
        # Calculate current spending for the budget period
        current_spent = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.owner_id == user_id,
                Transaction.category_id == budget.category_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.date.between(budget.start_date, budget.end_date)
            )
            .scalar() or 0
        )

        # Update budget spent amount
        budget.spent = current_spent
        
        # Check if spending exceeds notification threshold
        if current_spent >= (budget.amount * budget.notification_threshold):
            notifications.append({
                "budget_id": budget.id,
                "category_name": budget.category.name,
                "amount": budget.amount,
                "spent": current_spent,
                "percentage": (current_spent / budget.amount) * 100
            })
    
    db.commit()
    return notifications

def get_budget_summary(db: Session, user_id: int):
    """Get summary of all active budgets including spending progress"""
    active_budgets = (
        db.query(Budget)
        .filter(
            Budget.owner_id == user_id,
            Budget.is_active == True,
            Budget.end_date >= datetime.now()
        )
        .all()
    )

    summary = []
    for budget in active_budgets:
        # Calculate current spending
        current_spent = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.owner_id == user_id,
                Transaction.category_id == budget.category_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.date.between(budget.start_date, budget.end_date)
            )
            .scalar() or 0
        )

        summary.append({
            "budget_id": budget.id,
            "category_name": budget.category.name,
            "amount": budget.amount,
            "spent": current_spent,
            "remaining": budget.amount - current_spent,
            "percentage": (current_spent / budget.amount) * 100 if budget.amount > 0 else 0,
            "start_date": budget.start_date,
            "end_date": budget.end_date
        })

    return summary
