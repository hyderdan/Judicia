import sqlite3
import os

db_path = 'test.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Add police_id column to cases table
        cursor.execute("ALTER TABLE cases ADD COLUMN police_id INTEGER REFERENCES users(id)")
        conn.commit()
        print("Successfully added police_id column to cases table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column police_id already exists.")
        else:
            print(f"Error adding column: {e}")
    finally:
        conn.close()
else:
    print("test.db not found.")
