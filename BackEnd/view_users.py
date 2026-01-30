from database import SessionLocal
from models import User
import sys

def view_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("No users found in the database.")
            return

        print("\n" + "=" * 120)
        print(f"{'ID':<5} | {'Name':<15} | {'Email':<25} | {'Password':<15} | {'Role':<15} | {'Status':<10}")
        print("-" * 120)
        
        for user in users:
            print(f"{user.id:<5} | {user.name[:15]:<15} | {user.email[:25]:<25} | {user.password[:15]:<15} | {user.role:<15} | {user.status:<10}")
        
        print("=" * 120 + "\n")
        print(f"Total Users: {len(users)}")

    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_users()
