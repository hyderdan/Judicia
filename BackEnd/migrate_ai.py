import sqlite3
import os

db_path = 'test.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    columns_to_add = [
        ("analysis_status", "TEXT DEFAULT 'not_started'"),
        ("is_authentic", "BOOLEAN"),
        ("confidence_score", "INTEGER")
    ]
    
    for col_name, col_def in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE evidence ADD COLUMN {col_name} {col_def}")
            conn.commit()
            print(f"Successfully added {col_name} column to evidence table.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding column {col_name}: {e}")
    
    conn.close()
else:
    print("test.db not found.")
