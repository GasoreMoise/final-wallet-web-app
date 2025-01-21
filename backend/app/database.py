from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Use the get_database_url method to get the appropriate URL with SSL if needed
SQLALCHEMY_DATABASE_URL = settings.get_database_url()

# Add connect_args for potential SSL requirements
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=5,         # Set a reasonable pool size
    max_overflow=10      # Allow some additional connections when pool is full
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
