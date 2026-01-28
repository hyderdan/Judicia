from database import SessionLocal
from models import Admin, Base
from database import engine

def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if admin with this username already exists
        admin = db.query(Admin).filter(Admin.username == "hyder").first()
        if admin:
            print("\n" + "!"*50)
            print(f"Admin already exists with username: {admin.username}")
            print(f"Password: {admin.password}")
            print("!"*50 + "\n")
            return

        # Create new admin
        new_admin = Admin(
            username="hyder",
            password="admin123", # Default password
            role="admin",
            email="admin@virtual.com"
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("\n" + "="*50)
        print("Default Admin Created Successfully!")
        print("="*50)
        print(f"Username: {new_admin.username}")
        print(f"Password: {new_admin.password}")
        print(f"Role:     {new_admin.role}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
