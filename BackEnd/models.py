from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    phoneNo = Column(String)
    password = Column(String)
    role = Column(String, default="user")
    status = Column(String, default="pending")  # pending / approved

    # Relationships
    cases = relationship("Case", back_populates="user", primaryjoin="User.id == Case.user_id")
    notifications = relationship("Notification", back_populates="user")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="admin")

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    police_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    court_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String)
    description = Column(Text)
    incident_date = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="cases")
    police = relationship("User", foreign_keys=[police_id])
    court = relationship("User", foreign_keys=[court_id])
    evidence = relationship("Evidence", back_populates="case")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    file_path = Column(String)
    file_type = Column(String) # image / video
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    analysis_status = Column(String, default="not_started") # not_started, processing, completed, failed
    is_authentic = Column(Boolean, nullable=True)
    confidence_score = Column(Integer, nullable=True)

    # Relationship
    case = relationship("Case", back_populates="evidence")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    message = Column(Text)
    type = Column(String) # "review" / "court_transfer"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
    case = relationship("Case")

class NewsPost(Base) :
    __tablename__ = "news_posts"

    id = Column(Integer, primary_key=True)
    police_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship
    police = relationship("User")

