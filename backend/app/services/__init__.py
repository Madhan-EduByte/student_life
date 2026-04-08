"""
DestinAI — Services Package
"""

from app.services.ai_service import ai_service
from app.services.college_service import college_service
from app.services.email_service import email_service
from app.services.roadmap_service import roadmap_service

__all__ = ["ai_service", "roadmap_service", "college_service", "email_service"]
