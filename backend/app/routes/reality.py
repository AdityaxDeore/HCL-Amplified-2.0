from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.reality_service import RealityService
from app.schemas.reality import (
    RealityCheckResponse,
    RealityCheckRequest
)
from app.schemas.common import DataResponse

router = APIRouter()

@router.get("", response_model=DataResponse[RealityCheckResponse])
@router.get("/", response_model=DataResponse[RealityCheckResponse])
async def get_reality_check(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Target role override"),
    target_months: Optional[int] = Query(None, description="Target deadline in months"),
    hours_per_week: Optional[float] = Query(None, description="Available study hours per week")
):
    """Calculates workload feasibility, required weekly hours, and adjustment alternatives."""
    reality = await RealityService.evaluate_reality(
        learner_id=learner_id,
        target_role=target_role,
        target_months=target_months,
        hours_per_week=hours_per_week
    )
    return DataResponse(data=reality)

@router.post("", response_model=DataResponse[RealityCheckResponse])
@router.post("/", response_model=DataResponse[RealityCheckResponse])
async def evaluate_custom_reality_check(request: RealityCheckRequest):
    """Performs dynamic reality check with custom time constraints and goal parameters."""
    reality = await RealityService.evaluate_reality(
        learner_id=request.learner_id or "demo-learner",
        target_role=request.target_role,
        deadline=request.deadline,
        target_months=request.target_months,
        hours_per_week=request.hours_per_week
    )
    return DataResponse(data=reality)
