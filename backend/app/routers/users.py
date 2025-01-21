from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from ..database import get_db
from .. import models, schemas

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
async def read_user_me(db: Session = Depends(get_db)):
    """Get current user"""
    # For single user app, always return the first user or create one if none exists
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="user@example.com",
            full_name="Default User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.put("/me", response_model=schemas.UserResponse)
async def update_user_me(
    user_update: schemas.UserBase,
    db: Session = Depends(get_db)
):
    """Update current user"""
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update user"
        )
    
    return user
