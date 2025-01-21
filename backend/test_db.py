import psycopg2
from app.config import settings

def test_connection():
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        print("Database connection successful!")
        conn.close()
    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    test_connection()
