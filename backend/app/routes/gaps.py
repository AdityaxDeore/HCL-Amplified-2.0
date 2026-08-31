from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.gap_service import GapService
from app.schemas.gap import (
    SkillGapItem,
    SkillGapAnalysisResponse,
    SkillGapAnalyzeRequest
)
from app.schemas.common import DataResponse, ListResponse

router = APIRouter()

@router.get("", response_model=DataResponse[SkillGapAnalysisResponse])
@router.get("/", response_model=DataResponse[SkillGapAnalysisResponse])
async def get_learner_gaps(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Optional target role override")
):
    """Analyzes learner skill proficiency against target roadmap and returns detailed gap report."""
    analysis = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
    return DataResponse(data=analysis)

@router.post("/analyze", response_model=DataResponse[SkillGapAnalysisResponse])
async def analyze_custom_gaps(request: SkillGapAnalyzeRequest):
    """Performs dynamic skill gap analysis with custom known skills or target role parameters."""
    analysis = await GapService.analyze_gaps(
        learner_id=request.learner_id or "demo-learner",
        target_role=request.target_role,
        custom_known_skills=request.known_skills
    )
    return DataResponse(data=analysis)

@router.get("/{skill_id}", response_model=DataResponse[SkillGapItem])
async def get_skill_gap_by_id(
    skill_id: str = Path(..., description="Skill ID to inspect gap for"),
    learner_id: str = Query("demo-learner", description="Learner ID")
):
    """Inspects proficiency gap and prerequisites for a single skill."""
    gap_item = await GapService.get_single_gap(learner_id=learner_id, skill_id=skill_id)
    return DataResponse(data=gap_item)
