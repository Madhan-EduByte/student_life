"""
DestinAI — College Schemas
Pydantic schemas for college endpoints.
"""

from typing import List, Optional

from pydantic import BaseModel


class CollegeFilters(BaseModel):
    """Filters for college search."""

    stream: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    type: Optional[str] = None  # private, government, deemed
    fee_max: Optional[float] = None
    min_placement_rate: Optional[float] = None
    search: Optional[str] = None
    page: int = 1
    per_page: int = 20


class CollegeCreate(BaseModel):
    """Schema for creating a college."""

    name: str
    slug: str
    university: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    website: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    description: Optional[str] = None
    established_year: Optional[int] = None
    accreditation: Optional[str] = None
    nirf_rank: Optional[int] = None
    fee_range_min: Optional[float] = None
    fee_range_max: Optional[float] = None
    placement_rate: Optional[float] = None
    average_package: Optional[float] = None
    highest_package: Optional[float] = None


class CollegeCourseResponse(BaseModel):
    """College course response."""

    id: int
    course_name: str
    degree_type: Optional[str] = None
    duration_years: Optional[float] = None
    stream: Optional[str] = None
    specialization: Optional[str] = None
    annual_fee: Optional[float] = None
    seats_available: Optional[int] = None
    entrance_exam: Optional[str] = None
    eligibility: Optional[str] = None

    class Config:
        from_attributes = True


class CollegeScoreResponse(BaseModel):
    """College DNA score response."""

    academic_score: Optional[float] = None
    infrastructure_score: Optional[float] = None
    placement_score: Optional[float] = None
    faculty_score: Optional[float] = None
    culture_score: Optional[float] = None
    alumni_score: Optional[float] = None
    research_score: Optional[float] = None
    overall_score: Optional[float] = None

    class Config:
        from_attributes = True


class CollegeResponse(BaseModel):
    """Single college response."""

    id: int
    name: str
    slug: str
    university: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    established_year: Optional[int] = None
    accreditation: Optional[str] = None
    nirf_rank: Optional[int] = None
    fee_range_min: Optional[float] = None
    fee_range_max: Optional[float] = None
    placement_rate: Optional[float] = None
    average_package: Optional[float] = None
    highest_package: Optional[float] = None

    class Config:
        from_attributes = True


class CollegeDetailResponse(CollegeResponse):
    """Detailed college response with courses and scores."""

    courses: List[CollegeCourseResponse] = []
    scores: Optional[CollegeScoreResponse] = None


class CollegeMatchResponse(BaseModel):
    """AI-matched college response."""

    college: CollegeResponse
    match_score: float  # 0-100
    match_reasons: List[str]


class CollegeListResponse(BaseModel):
    """Paginated college list response."""

    colleges: List[CollegeResponse]
    total: int
    page: int
    per_page: int
