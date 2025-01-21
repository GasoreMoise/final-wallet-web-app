import os
from sqlalchemy import create_engine, text
from app.config import settings

# Set the database URL with full hostname
os.environ['DATABASE_URL'] = "postgresql://wallet_web_db_user:T2I0rC0m4WgKn4wtT0gGcvod9FdCdZik@dpg-cu7isibv2p9s73bgkiv0-a.oregon-postgres.render.com/wallet_web_db"

# Get the database URL with SSL mode
database_url = f"{os.getenv('DATABASE_URL')}?sslmode=require"

try:
    # Create engine
    engine = create_engine(database_url)
    
    # Try to connect and execute a simple query
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Successfully connected to the database!")
        
        # List all tables
        result = connection.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        print("\nExisting tables:")
        for row in result:
            print(f"- {row[0]}")
            
except Exception as e:
    print(f"Error connecting to the database: {str(e)}")
