from fastapi import APIRouter
from . import accounts, categories, transactions, budgets, dashboard

# Create the main router
router = APIRouter()

# Include all sub-routers with their prefixes
router.include_router(accounts.router, prefix="/accounts", tags=["Accounts"])
router.include_router(categories.router, prefix="/categories", tags=["Categories"])
router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
router.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
