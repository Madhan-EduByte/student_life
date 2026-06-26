"""
DestinAI — AI Advisor Route
Provides an interface to ask DestinAI questions about colleges and careers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import get_current_user_optional
from app.models.user import User
from app.services.ai_service import ai_service

router = APIRouter()


class AdvisorQueryRequest(BaseModel):
    query: str


class AdvisorQueryResponse(BaseModel):
    response: str


@router.post("/ask", response_model=AdvisorQueryResponse)
async def ask_advisor(
    data: AdvisorQueryRequest,
    current_user: User = Depends(get_current_user_optional),
):
    """Ask DestinAI (AI search advisor) a question about careers, colleges or education."""
    if not data.query or not data.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    try:
        response_text = await ai_service.ask_advisor(data.query.strip())
        return AdvisorQueryResponse(response=response_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Advisor service error: {str(e)}",
        )
