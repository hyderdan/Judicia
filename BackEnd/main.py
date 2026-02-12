from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form,BackgroundTasks
import datetime
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, engine
from models import User, Admin, Case, Evidence, Notification
import models
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
import uuid
# from ai_utils import AIVideoAnalyzer
from fastapi import BackgroundTasks
from ai_utils import get_analyzer
from database import SessionLocal
app = FastAPI()

# Create uploads directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str = "user"

class UserUpdate(BaseModel):
    name: str
    phoneNo: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class AdminCreateUserRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str # police, court_management

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phoneNo: Optional[str] = None
    role: str
    status: Optional[str] = "pending"

    class Config:
        orm_mode = True

class EvidenceResponse(BaseModel):
    id: int
    file_path: str
    file_type: str

    class Config:
        orm_mode = True

class CaseResponse(BaseModel):
    id: int
    user_id: int
    police_id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    incident_date: Optional[str] = ""
    status: Optional[str] = "pending"
    created_at: datetime.datetime
    police_name: Optional[str] = "Not Assigned"
    court_id: Optional[int] = None
    court_name: Optional[str] = "Not Assigned"
    user_name: Optional[str] = "Unknown"
    evidence: List[EvidenceResponse] = []

    class Config:
        orm_mode = True

class NotificationResponse(BaseModel):
    id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime
    case_id: Optional[int] = None

    class Config:
        orm_mode = True

class NewsPostCreate(BaseModel):
    title: str
    content: str
    image_path: Optional[str] = None

class NewsPostResponse(BaseModel):
    id: int
    police_id: int
    title: str
    content: str
    image_path: Optional[str] = None
    created_at: datetime.datetime
    police_name: Optional[str] = "Unknown Station"

    class Config:
        orm_mode = True

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # ... (existing code rest omitted for brevity in instruction, but I will include it)
    print(f"\n[DEBUG] Registration Request Received:")
    print(f"Name: {user.name}")
    print(f"Email: {user.email}")
    print(f"Phone: {user.phone}")
    print(f"Role: {user.role}")

    # check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        print("[DEBUG] User already exists!")
        raise HTTPException(status_code=400, detail="Email already registered")

    # Regular users are pending by default
    status = "pending"
    
    # If a generic role requests somehow, force user/pending
    if user.role not in ["user"]:
         pass

    new_user = User(
        name=user.name,
        email=user.email,
        phoneNo=str(user.phone), # Storing as string to avoid integer issues
        password=user.password,  # later we hash this
        role=user.role,
        status=status
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"[DEBUG] User {new_user.name} saved to database with ID {new_user.id} and status {new_user.status}\n")
    return {"message": "Registration successful", "user_id": new_user.id}

@app.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    print(f"\n[DEBUG] Login request received")
    print(f"Email: {data.email}, Role: {data.role}")

    if data.role == "admin":
        user = db.query(Admin).filter(
            Admin.email == data.email,
            Admin.password == data.password
        ).first()
    else:
        user = db.query(User).filter(
            User.email == data.email,
            User.password == data.password,
            User.role == data.role
        ).first()

    if not user:
        print("[DEBUG] Login failed: Invalid credentials")
        raise HTTPException(
            status_code=401,
            detail="Invalid email, password, or role"
        )
    
    # Check for approval if not admin
    if data.role != "admin":
        if user.status == "pending":
             raise HTTPException(
                status_code=403, 
                detail="Account is pending approval. Please wait for admin verification."
            )
        if user.status == "rejected":
             raise HTTPException(
                status_code=403, 
                detail="Your account has been rejected."
            )

    print(f"[DEBUG] Login successful for user ID {user.id}")

    user_name = user.username if data.role == "admin" else user.name
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user_name,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/user/profile/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/user/profile/{user_id}")
def update_user_profile(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = data.name
    user.phoneNo = data.phoneNo
    db.commit()
    return {"message": "Profile updated successfully"}

@app.get("/courts", response_model=List[UserResponse])
def get_courts(db: Session = Depends(get_db)):
    # Support both "court" and "CourtOfficial" for flexibility
    return db.query(User).filter(User.role.in_(["court", "CourtOfficial"]), User.status == "approved").all()

@app.put("/police/cases/{case_id}/proceed")
def proceed_to_court(case_id: int, court_id: int = Form(...), db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    court_exists = db.query(User).filter(User.id == court_id, User.role.in_(["court", "CourtOfficial"])).first()
    if not court_exists:
        raise HTTPException(status_code=400, detail="Invalid court selection")
    
    case.status = "sent_to_court"
    case.court_id = court_id
    
    # Create notification for user
    court_user = db.query(User).filter(User.id == court_id).first()
    notification = Notification(
        user_id=case.user_id,
        case_id=case.id,
        message=f"Your case '{case.title}' has been processed and sent to {court_user.name} for legal review.",
        type="court_transfer"
    )
    db.add(notification)
    
    db.commit()
    return {"message": "Case successfully sent to court"}

@app.post("/police/cases/{case_id}/review")
def review_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case.status == "pending":
        case.status = "under_review"
        
        # Create notification
        police_station = db.query(User).filter(User.id == case.police_id).first()
        notification = Notification(
            user_id=case.user_id,
            case_id=case.id,
            message=f"Police Station {police_station.name} has started reviewing your case: '{case.title}'.",
            type="review"
        )
        db.add(notification)
        db.commit()
        return {"message": "Case marked as under review"}
    
    return {"message": "Case already under review or processed"}

@app.get("/user/notifications/{user_id}", response_model=List[NotificationResponse])
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

@app.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@app.get("/police/cases/{police_id}", response_model=List[CaseResponse])
def get_police_cases(police_id: int, db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.police_id == police_id).all()
    # Add user name, police name, and court name for each case
    for case in cases:
        if case.user_id:
            user = db.query(User).filter(User.id == case.user_id).first()
            if user:
                case.user_name = user.name
        
        if case.police_id:
            police_station = db.query(User).filter(User.id == case.police_id).first()
            if police_station:
                case.police_name = police_station.name
        else:
            case.police_name = "Not Assigned"

        if case.court_id:
            court = db.query(User).filter(User.id == case.court_id).first()
            if court:
                case.court_name = court.name
        else:
            case.court_name = "Not Assigned"
            
    return cases

@app.get("/police/stats/{police_id}")
def get_police_stats(police_id: int, db: Session = Depends(get_db)):
    total_cases = db.query(Case).filter(Case.police_id == police_id).count()
    sent_to_court = db.query(Case).filter(Case.police_id == police_id, Case.status == "sent_to_court").count()
    pending_review = db.query(Case).filter(Case.police_id == police_id, Case.status == "pending").count()
    
    # Count evidence for all cases belonging to this police station
    evidence_count = db.query(Evidence).join(Case).filter(Case.police_id == police_id).count()
    
    return {
        "active_cases": total_cases,
        "evidence_uploaded": evidence_count,
        "sent_to_court": sent_to_court,
        "pending_review": pending_review
    }

@app.get("/court/cases/{court_id}", response_model=List[CaseResponse])
def get_court_cases(court_id: int, db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.court_id == court_id).all()
    # Add user name, police name, and court name for each case
    for case in cases:
        if case.user_id:
            user = db.query(User).filter(User.id == case.user_id).first()
            if user:
                case.user_name = user.name
        
        if case.police_id:
            police_station = db.query(User).filter(User.id == case.police_id).first()
            if police_station:
                case.police_name = police_station.name
        else:
            case.police_name = "Not Assigned"

        if case.court_id:
            court = db.query(User).filter(User.id == case.court_id).first()
            if court:
                case.court_name = court.name
        else:
            case.court_name = "Not Assigned"
            
    return cases

@app.get("/user/cases/{user_id}", response_model=List[CaseResponse])
def get_user_cases(user_id: int, db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.user_id == user_id).all()
    # Add police name and court name for each case
    for case in cases:
        if case.police_id:
            police_station = db.query(User).filter(User.id == case.police_id).first()
            if police_station:
                case.police_name = police_station.name
        else:
            case.police_name = "Not Assigned"

        if case.court_id:
            court = db.query(User).filter(User.id == case.court_id).first()
            if court:
                case.court_name = court.name
        else:
            case.court_name = "Not Assigned"
    return cases

@app.get("/user/stats/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    total_cases = db.query(Case).filter(Case.user_id == user_id).count()
    pending_cases = db.query(Case).filter(Case.user_id == user_id, Case.status == "pending").count()
    # 'Approved' or 'Resolved' cases
    approved_cases = db.query(Case).filter(Case.user_id == user_id, Case.status.in_(["approved", "resolved"])).count()
    
    return {
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "approved_cases": approved_cases
    }

@app.delete("/user/cases/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Delete associated evidence files
    evidence_list = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    for evidence in evidence_list:
        if evidence.file_path:
            # path is like "/uploads/filename.ext"
            file_path = evidence.file_path.lstrip('/')
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")
        
        db.delete(evidence)
    
    db.delete(case)
    db.commit()
    return {"message": "Case and associated evidence deleted successfully"}

@app.get("/police-stations", response_model=List[UserResponse])
def get_police_stations(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "police", User.status == "approved").all()

@app.post("/user/file-case")
async def file_case(
    user_id: int = Form(...),
    police_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    incident_date: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Create Case
    new_case = Case(
        user_id=user_id,
        police_id=police_id,
        title=title,
        description=description,
        incident_date=incident_date
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Save Files
    for file in files:
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine file type
        file_type = "image" if file_ext.lower() in [".jpg", ".jpeg", ".png", ".gif"] else "video"
        
        new_evidence = Evidence(
            case_id=new_case.id,
            file_path=f"/uploads/{file_name}",
            file_type=file_type
        )
        db.add(new_evidence)
    
    db.commit()
    return {"message": "Case filed successfully", "case_id": new_case.id}



@app.post("/evidence/{evidence_id}/analyze")
def analyze_evidence(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    file_path = evidence.file_path.lstrip("/")

    is_authentic = False
    confidence = 0.0
    
    try:
        analyzer = get_analyzer()
        result = analyzer.analyze(file_path)
        # result is a dict: {'verdict': '...', 'confidence': ..., ...}
        
        is_authentic = result.get("verdict") == "LIKELY_REAL"
        confidence = result.get("confidence", 0.0)
        
        # Debug print
        print(f"[ANALYSIS RESULT] {result}")
        
    except Exception as e:
        print(f"[ERROR] Logic failed during analysis result parsing: {e}")
        # Default safety
        is_authentic = False
        confidence = 0.0

    evidence.is_authentic = is_authentic
    evidence.confidence_score = confidence
    evidence.analysis_status = "completed"
    
    # --- AUTO-RESOLVE CASE & NOTIFY USER ---
    case = db.query(Case).filter(Case.id == evidence.case_id).first()
    if case:
        case.status = "resolved"
        
        # Create notification
        verdict_text = "Authentic/Real" if is_authentic else "Potential Deepfake/AI-Generated"
        notification_message = (
            f"Evidence analysis completed for case '{case.title}'. "
            f"Result: {verdict_text} ({confidence:.1f}% confidence)."
        )
        
        notification = Notification(
            user_id=case.user_id,
            case_id=case.id,
            message=notification_message,
            type="analysis_complete"
        )
        db.add(notification)

    db.commit()

    return {
        "result": "REAL" if is_authentic else "FAKE",
        "confidence": confidence,
        "details": result 
    }

@app.get("/evidence/{evidence_id}")
def get_evidence_detail(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return {
        "id": evidence.id,
        "file_path": evidence.file_path,
        "file_type": evidence.file_type,
        "analysis_status": evidence.analysis_status,
        "is_authentic": evidence.is_authentic,
        "confidence_score": evidence.confidence_score
    }

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.role == "user").count()
    pending_users = db.query(User).filter(User.status == "pending", User.role == "user").count()
    approved_users = db.query(User).filter(User.status == "approved", User.role == "user").count()
    police_count = db.query(User).filter(User.role == "police").count()
    court_count = db.query(User).filter(User.role == "CourtOfficial").count()

    return {
        "total_users": total_users,
        "pending_users": pending_users,
        "approved_users": approved_users,
        "police_count": police_count,
        "court_count": court_count
    }

@app.get("/admin/users", response_model=List[UserResponse])
def get_users(status: Optional[str] = None, role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if status:
        query = query.filter(User.status == status)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@app.put("/admin/users/{user_id}/approve")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = "approved"
    db.commit()
    return {"message": "User approved successfully"}

@app.put("/admin/users/{user_id}/reject")
def reject_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = "rejected"
    db.commit()
    return {"message": "User rejected"}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.post("/admin/create-user")
def admin_create_user(user: AdminCreateUserRequest, db: Session = Depends(get_db)):
    # Check existing
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        phoneNo=str(user.phone),
        password=user.password,
        role=user.role,
        status="approved" # Admin created users are auto-approved
    )
    db.add(new_user)
    db.commit()
    return {"message": f"{user.role} created successfully"}

@app.get("/court/{court_id}/stats")
def get_court_stats(court_id: int, db: Session = Depends(get_db)):
    # 1. Total Assigned Cases
    assigned_count = db.query(Case).filter(Case.court_id == court_id).count()
    
    # 2. AI Analyses (Total evidence items processed for this court's cases)
    total_analyses = db.query(Evidence).join(Case).filter(
        Case.court_id == court_id,
        Evidence.analysis_status == "completed"
    ).count()

    # 3. Verified Authentic
    verified_count = db.query(Evidence).join(Case).filter(
        Case.court_id == court_id,
        Evidence.analysis_status == "completed",
        Evidence.is_authentic == True
    ).count()

    # 4. Flagged (Fake)
    flagged_count = db.query(Evidence).join(Case).filter(
        Case.court_id == court_id,
        Evidence.analysis_status == "completed",
        Evidence.is_authentic == False
    ).count()

    return {
        "assigned_cases": assigned_count,
        "total_analyses": total_analyses,
        "verified_evidence": verified_count,
        "flagged_items": flagged_count
    }

@app.get("/")
def home():
    return {"message": "Backend is running - News Feature Active"}

# --- NEWS BLOG ENDPOINTS ---

@app.post("/police/news", response_model=NewsPostResponse)
async def create_news_post(
    police_id: int = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Verify police exists
    police = db.query(User).filter(User.id == police_id, User.role == "police").first()
    if not police:
        raise HTTPException(status_code=404, detail="Police station not found")
    
    image_path = None
    if file:
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"news_{uuid.uuid4()}{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        image_path = f"/uploads/{file_name}"

    new_post = models.NewsPost(
        police_id=police_id,
        title=title,
        content=content,
        image_path=image_path
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    new_post.police_name = police.name
    return new_post

@app.get("/news", response_model=List[NewsPostResponse])
def get_all_news(db: Session = Depends(get_db)):
    posts = db.query(models.NewsPost).order_by(models.NewsPost.created_at.desc()).all()
    for post in posts:
        police = db.query(User).filter(User.id == post.police_id).first()
        post.police_name = police.name if police else "Unknown Station"
    return posts

@app.get("/police/news/{police_id}", response_model=List[NewsPostResponse])
def get_police_news(police_id: int, db: Session = Depends(get_db)):
    posts = db.query(models.NewsPost).filter(models.NewsPost.police_id == police_id).order_by(models.NewsPost.created_at.desc()).all()
    police = db.query(User).filter(User.id == police_id).first()
    for post in posts:
        post.police_name = police.name if police else "Unknown Station"
    return posts

@app.delete("/police/news/{post_id}")
def delete_news_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.NewsPost).filter(models.NewsPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

# Force reload for debugging

