from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Admin

def test_admin_login_logic():
    db = SessionLocal()
    try:
        print("Testing Admin Login Logic directly against DB...")
        email = "admin@virtual.com"
        password = "admin123"
        role = "admin"
        
        print(f"Attempting query for email={email}, role={role}")
        
        if role == "admin":
            user = db.query(Admin).filter(
                Admin.email == email,
                Admin.password == password
            ).first()
        else:
            user = db.query(User).filter(
                User.email == email,
                User.password == password,
                User.role == role
            ).first()
            
        if user:
            print("Login Logic Successful!")
            print(f"Found User/Admin: {user.username if hasattr(user, 'username') else user.name} (ID: {user.id})")
        else:
            print("Login Logic Failed: User not found or password incorrect.")
            
    except Exception as e:
        print(f"Error during verification: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_admin_login_logic()
