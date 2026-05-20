"""
DestinAI — Admin Routes
Global Command Center, Institution Manager, and IAM Endpoints.
"""
import csv
import io
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import MessageResponse

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure only admins and superadmins can access these routes."""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access the admin portal",
        )
    return current_user


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> Any:
    """Get high-level statistics for the Global Command Center."""
    # Example logic: count total students, active roadmaps, etc.
    return {
        "total_students": 0,
        "active_roadmaps": 0,
        "at_risk_students": 0,
        "system_health": "operational"
    }


@router.post("/colleges/bulk-upload")
async def bulk_upload_colleges(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
) -> MessageResponse:
    """Process CSV/Excel uploads for updating college and course data."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Only CSV files are allowed"
        )

    try:
        contents = await file.read()
        decoded = contents.decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(decoded))
        
        processed_count = 0
        for row in reader:
            # TODO: Add logic to update models.College or create new ones using the row dictionary
            processed_count += 1
            
        return MessageResponse(message=f"Successfully processed {processed_count} college records", success=True)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing file: {str(e)}")