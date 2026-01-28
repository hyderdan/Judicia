from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel

router = APIRouter()

# Pydantic model for request body
class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str = "user" # Default role

@router.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # PRINT STATEMENT AS REQUESTED BY USER
    print(f"\n[DEBUG] Registration Request Received:")
    print(f"Name: {user.name}")
    print(f"Email: {user.email}")
    print(f"Phone: {user.phone}")
    print(f"Role: {user.role}")
    print(f"Password: {user.password} (hashing needed in real app)\n")

    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        print("[DEBUG] User already exists!")
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    new_user = models.User(
        name=user.name,
        email=user.email,
        phoneNo=int(user.phone) if user.phone.isdigit() else 0, # Simple conversion
        password=user.password, # In real app, hash this!
        role=user.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"[DEBUG] User {new_user.name} saved to database with ID {new_user.id}\n")
    return {"message": "User registered successfully", "user_id": new_user.id}
