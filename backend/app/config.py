from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Get DATABASE_URL from environment variable, fallback to local database for development
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/wallet_db"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

    def get_database_url(self) -> str:
        """Get database URL with SSL mode for production"""
        if "DATABASE_URL" in os.environ:
            # Add SSL mode for production database
            return f"{self.DATABASE_URL}?sslmode=require"
        return self.DATABASE_URL

settings = Settings()
