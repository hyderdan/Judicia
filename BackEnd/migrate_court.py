import sqlite3

def migrate():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE cases ADD COLUMN court_id INTEGER REFERENCES users(id)")
        print("Successfully added court_id column to cases table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column court_id already exists.")
        else:
            print(f"Error: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
