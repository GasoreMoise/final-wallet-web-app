from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..schemas import AccountCreate, AccountResponse
from ..database import get_db

router = APIRouter()

def get_or_create_default_user(db: Session):
    # Try to get the default user
    user = db.query(models.User).first()
    if not user:
        # Create a default user if none exists
        user = models.User(
            email="default@example.com",
            full_name="Default User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/", response_model=AccountResponse)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    # Get or create the default user
    user = get_or_create_default_user(db)

    # Create account with owner
    db_account = models.Account(
        name=account.name,
        type=account.type,
        balance=float(account.balance),
        currency=account.currency,
        description=account.description,
        owner_id=user.id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    # Get or create the default user
    user = get_or_create_default_user(db)
    
    # Get accounts for this user
    accounts = db.query(models.Account).filter(models.Account.owner_id == user.id).all()
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    # Get or create the default user
    user = get_or_create_default_user(db)
    
    account = db.query(models.Account).filter(models.Account.id == account_id, models.Account.owner_id == user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, account: AccountCreate, db: Session = Depends(get_db)):
    # Get or create the default user
    user = get_or_create_default_user(db)
    
    db_account = db.query(models.Account).filter(models.Account.id == account_id, models.Account.owner_id == user.id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Update account fields
    db_account.name = account.name
    db_account.type = account.type
    db_account.balance = float(account.balance)
    db_account.currency = account.currency
    db_account.description = account.description
    
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    # Get or create the default user
    user = get_or_create_default_user(db)
    
    db_account = db.query(models.Account).filter(models.Account.id == account_id, models.Account.owner_id == user.id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(db_account)
    db.commit()
    return {"message": "Account deleted successfully"}
