"""
DestinAI — API v1 Router
Aggregates all v1 route modules.
"""

from fastapi import APIRouter

from app.api.v1.routes import admin, auth, careers, colleges, roadmap, simulation, students

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(admin.router)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(careers.router, prefix="/careers", tags=["Careers"])
api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
api_router.include_router(simulation.router, prefix="/careers", tags=["Simulation"])
