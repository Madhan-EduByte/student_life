"""
CareerCompass — Admin CRUD Routes
Admin full CRUD for colleges, careers, students, users.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.models.college import College
from app.models.career import Career
from app.models.student import StudentProfile
from app.schemas.college import CollegeCreate, CollegeResponse, CollegeListResponse
from app.schemas.auth import UserCreate, UserResponse
from app.schemas.career import CareerResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# Admin role check
def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """List all users."""
    users = db.query(User).all()
    return users


@router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin creates user."""
    # Same logic as register but no email check limit
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
    )
    db.add(user)
    db.flush()
    if user.role == "student":
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin deletes a user and associated records."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} successfully deleted"}


@router.get("/colleges", response_model=CollegeListResponse)
async def admin_list_colleges(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin lists colleges."""
    colleges = db.query(College).all()
    return CollegeListResponse(colleges=[CollegeResponse.model_validate(c) for c in colleges], total=len(colleges), page=1, per_page=len(colleges))


@router.post("/colleges")
async def admin_create_college(college_data: CollegeCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin creates college."""
    college = College(**college_data.model_dump())
    db.add(college)
    db.commit()
    db.refresh(college)
    return CollegeResponse.model_validate(college)


@router.delete("/colleges/{college_id}")
async def admin_delete_college(college_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin deletes college."""
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    db.delete(college)
    db.commit()
    return {"message": "College deleted"}


# Similar for careers...
@router.get("/careers")
async def admin_list_careers(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    careers = db.query(Career).all()
    return {"careers": [CareerResponse.model_validate(c) for c in careers]}


@router.delete("/careers/{career_id}")
async def admin_delete_career(career_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Admin deletes a career from the master list."""
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    db.delete(career)
    db.commit()
    return {"message": f"Career {career_id} successfully deleted"}
