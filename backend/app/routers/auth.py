from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from ..database import get_db
from .. import models, schemas

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login", response_model=schemas.UserResponse)
async def login(db: Session = Depends(get_db)):
    """Login endpoint for single user"""
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
