from main import app
from fastapi.testclient import TestClient
from database import SessionLocal
from models import User

db = SessionLocal()
try:
    u = db.query(User).filter(User.id == 5).first()
    if u:
        print(f"ID: {u.id}")
        print(f"Name: {u.name}")
        print(f"Role: {u.role}")
        print(f"Status: {u.status}")
    else:
        print("User with ID 5 not found.")
finally:
    db.close()
