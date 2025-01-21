from app.database import engine
from sqlalchemy import inspect

def check_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("\nExisting tables:")
    for table in tables:
        print(f"\nTable: {table}")
        columns = inspector.get_columns(table)
        print("Columns:")
        for column in columns:
            print(f"  - {column['name']}: {column['type']}")

if __name__ == "__main__":
    check_tables()
