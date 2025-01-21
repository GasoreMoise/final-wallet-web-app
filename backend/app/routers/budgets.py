from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.BudgetResponse)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    db_budget = models.Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.get("/", response_model=List[schemas.BudgetResponse])
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(models.Budget).all()
    return budgets

@router.get("/notifications", response_model=List[schemas.BudgetNotification])
def get_budget_notifications(db: Session = Depends(get_db)):
    current_time = datetime.utcnow()
    active_budgets = db.query(models.Budget).filter(
        models.Budget.start_date <= current_time,
        models.Budget.end_date >= current_time
    ).all()
    
    notifications = []
    for budget in active_budgets:
        spent = sum(t.amount for t in budget.transactions)
        percentage = spent / budget.amount
        if percentage >= budget.notification_threshold:
            notifications.append({
                "budget_id": budget.id,
                "category_name": budget.category.name,
                "amount_spent": spent,
                "budget_amount": budget.amount,
                "percentage_used": percentage,
                "notification_threshold": budget.notification_threshold
            })
    return notifications

@router.get("/summary", response_model=List[schemas.BudgetSummary])
def get_budget_summary(db: Session = Depends(get_db)):
    current_time = datetime.utcnow()
    budgets = db.query(models.Budget).all()
    
    summaries = []
    for budget in budgets:
        spent = sum(t.amount for t in budget.transactions)
        percentage = spent / budget.amount if budget.amount > 0 else 0
        is_active = budget.start_date <= current_time <= budget.end_date
        summaries.append({
            "budget_id": budget.id,
            "category_name": budget.category.name,
            "amount_spent": spent,
            "budget_amount": budget.amount,
            "percentage_used": percentage,
            "start_date": budget.start_date,
            "end_date": budget.end_date,
            "is_active": is_active
        })
    return summaries

@router.get("/{budget_id}", response_model=schemas.BudgetResponse)
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/{budget_id}", response_model=schemas.BudgetResponse)
def update_budget(budget_id: int, budget_update: schemas.BudgetBase, db: Session = Depends(get_db)):
    db_budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    for key, value in budget_update.dict(exclude_unset=True).items():
        setattr(db_budget, key, value)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    db_budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(db_budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
