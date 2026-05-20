from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel

# NOTE: Import your actual database session dependency and models here
# from app.database import get_db
# from sqlalchemy.orm import Session
# import app.models as models

router = APIRouter(prefix="/api/v1/careers", tags=["Careers & Simulations"])

# ------ Pydantic Response Models ------
class CareerResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    stream: str
    category: str
    average_salary_entry: int
    growth_rate: int
    demand_level: str
    work_environment: str
    icon: str

class CareerSimulationResponse(BaseModel):
    career_id: int
    career_title: str
    simulation: str
    daily_tasks: List[str]
    challenges: List[str]
    rewards: List[str]
    typical_salary: int

# ------ API Endpoints ------
@router.get("", response_model=List[CareerResponse])
def get_all_careers():
    """Fetch the list of all available careers to display on the simulation catalog."""
    # Example SQLAlchemy query:
    # careers = db.query(models.Career).all()
    # return careers
    pass

@router.get("/{career_id}/simulation", response_model=CareerSimulationResponse)
def get_career_simulation(career_id: int):
    """Fetch the simulation narrative and details for a specific career."""
    # Example SQLAlchemy query:
    # simulation = db.query(models.CareerSimulation).filter(models.CareerSimulation.career_id == career_id).first()
    # if not simulation:
    #     raise HTTPException(status_code=404, detail="Simulation data not found for this career.")
    # return simulation
    pass