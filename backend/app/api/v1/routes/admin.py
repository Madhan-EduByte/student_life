"""
DestinAI — Admin Routes
Global Command Center, User CRUD, and DB Model Inspectors.
"""
from typing import Any, List, Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.career import Career
from app.models.college import College
from app.models.career_guide import CareerGuide, Milestone, CareerGuideHistory, SessionLog, StudentOutcome
from app.core.security import hash_password
from app.schemas.auth import MessageResponse

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure only admins can access these endpoints."""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access the admin portal",
        )
    return current_user


# ─── ADMIN SCHEMAS ──────────────────────────────────────────

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: Optional[str] = None
    role: str = "student"
    is_active: bool = True

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


# ─── DASHBOARD STATS ─────────────────────────────────────────

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """Get high-level statistics for the Global Command Center."""
    total_students = db.query(User).filter(User.role == "student").count()
    active_career_guides = db.query(CareerGuide).filter(CareerGuide.is_active == True).count()
    total_careers = db.query(Career).count()
    total_colleges = db.query(College).count()
    return {
        "total_students": total_students,
        "active_career_guides": active_career_guides,
        "total_careers": total_careers,
        "total_colleges": total_colleges,
        "system_health": "operational"
    }


# ─── USER MANAGEMENT (CRUD) ──────────────────────────────────

@router.get("/users")
async def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all registered users."""
    users = db.query(User).order_by(User.id.desc()).all()
    return [{
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "phone": u.phone,
        "role": u.role,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "created_at": u.created_at,
        "last_login_at": u.last_login_at
    } for u in users]

@router.post("/users", status_code=201)
async def create_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """Create a new user securely."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        is_active=data.is_active,
        is_verified=True
    )
    db.add(user)
    db.flush()
    
    if user.role == "student":
        # Create empty profile
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        
    db.commit()
    return {"message": "User created successfully", "user_id": user.id}

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """Update user information."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_dict = data.model_dump(exclude_unset=True)
    if "password" in update_dict and update_dict["password"]:
        user.password_hash = hash_password(update_dict.pop("password"))
        
    for k, v in update_dict.items():
        setattr(user, k, v)
        
    db.commit()
    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """Delete a user and associated student profile recursively."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Delete dependent student profile
    db.query(StudentProfile).filter(StudentProfile.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User and profile deleted successfully"}


# ─── DATABASE INSPECTORS ────────────────────────────────────

@router.get("/student-profiles")
async def list_student_profiles(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all student profile AI inputs."""
    profiles = db.query(StudentProfile).all()
    return [{
        "id": p.id,
        "user_id": p.user_id,
        "interest_areas": p.interest_areas,
        "strengths": p.strengths,
        "preferred_stream": p.preferred_stream,
        "education_level": p.education_level,
        "budget_range": p.budget_range,
        "location_preference": p.location_preference,
        "work_life_balance": p.work_life_balance,
        "risk_tolerance": p.risk_tolerance,
        "interaction_style": p.interaction_style,
        "created_at": p.created_at
    } for p in profiles]

@router.get("/careers")
async def list_careers(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all careers database entries."""
    careers = db.query(Career).all()
    return [{
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "skills_required": c.skills_required,
        "salary_range": c.salary_range,
        "growth_rate": c.growth_rate
    } for c in careers]

@router.get("/colleges")
async def list_colleges(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all colleges database entries."""
    colleges = db.query(College).all()
    return [{
        "id": col.id,
        "name": col.name,
        "location": col.location,
        "ranking": col.ranking,
        "fees_range": col.fees_range,
        "website": col.website
    } for col in colleges]

@router.get("/career-guides")
async def list_career_guides(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all generated career_guides."""
    career_guides = db.query(CareerGuide).all()
    return [{
        "id": rm.id,
        "user_id": rm.user_id,
        "title": rm.title,
        "career_path": rm.career_path,
        "recommended_stream": rm.recommended_stream,
        "confidence_score": rm.confidence_score,
        "future_proof_score": rm.future_proof_score,
        "version": rm.version,
        "is_active": rm.is_active,
        "created_at": rm.created_at
    } for rm in career_guides]

@router.get("/milestones")
async def list_milestones(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all career_guide milestones."""
    milestones = db.query(Milestone).all()
    return [{
        "id": m.id,
        "career_guide_id": m.career_guide_id,
        "week_number": m.week_number,
        "title": m.title,
        "category": m.category,
        "priority": m.priority,
        "is_completed": m.is_completed,
        "due_date": m.due_date
    } for m in milestones]

@router.get("/career-guide-histories")
async def list_career_guide_histories(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all active career_guide version histories."""
    histories = db.query(CareerGuideHistory).all()
    return [{
        "id": h.id,
        "career_guide_id": h.career_guide_id,
        "version": h.version,
        "changes_summary": h.changes_summary,
        "reason": h.reason,
        "created_at": h.created_at
    } for h in histories]

@router.get("/session-logs")
async def list_session_logs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all user navigation activity session logs."""
    logs = db.query(SessionLog).all()
    return [{
        "id": l.id,
        "user_id": l.user_id,
        "action": l.action,
        "duration": l.duration,
        "created_at": l.created_at
    } for l in logs]

@router.get("/student-outcomes")
async def list_student_outcomes(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """List all tracked student outcomes."""
    outcomes = db.query(StudentOutcome).all()
    return [{
        "id": o.id,
        "user_id": o.user_id,
        "outcome_type": o.outcome_type,
        "details": o.details,
        "created_at": o.created_at
    } for o in outcomes]