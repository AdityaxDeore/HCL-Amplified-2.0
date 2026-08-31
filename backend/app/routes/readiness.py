from fastapi import APIRouter, Path, Query
from typing import List, Dict, Any, Optional
from app.services.readiness_service import ReadinessService
from app.schemas.readiness import ReadinessResponse, SkillReadinessItem, NextActionItem, ReadinessSnapshotSchema
from app.schemas.common import DataResponse, ListResponse

router = APIRouter()

@router.get("", response_model=DataResponse[ReadinessResponse])
@router.get("/", response_model=DataResponse[ReadinessResponse])
async def get_default_readiness():
    """Retrieves authoritative estimated job readiness for demo-learner."""
    result = await ReadinessService.evaluate_readiness("demo-learner")
    return DataResponse(data=result)

@router.get("/{learner_id}", response_model=DataResponse[ReadinessResponse])
async def get_learner_readiness(
    learner_id: str = Path(..., description="Learner ID")
):
    """Retrieves authoritative estimated job readiness evaluation for a specific learner."""
    result = await ReadinessService.evaluate_readiness(learner_id)
    return DataResponse(data=result)

@router.get("/{learner_id}/skills", response_model=ListResponse[SkillReadinessItem])
async def get_learner_skills_readiness(
    learner_id: str = Path(..., description="Learner ID")
):
    """Returns granular per-skill readiness scores with prerequisite gating."""
    skills = await ReadinessService.get_skill_readiness_list(learner_id)
    return ListResponse(data=skills, count=len(skills))

@router.get("/{learner_id}/next-action", response_model=DataResponse[NextActionItem])
async def get_learner_next_action(
    learner_id: str = Path(..., description="Learner ID")
):
    """Returns top prioritized next best action from readiness analysis."""
    action = await ReadinessService.get_next_action(learner_id)
    return DataResponse(data=action)

@router.get("/{learner_id}/history", response_model=ListResponse[ReadinessSnapshotSchema])
async def get_learner_readiness_history(
    learner_id: str = Path(..., description="Learner ID")
):
    """Returns chronological readiness score history snapshots."""
    snapshots = await ReadinessService.get_snapshots(learner_id)
    return ListResponse(data=snapshots, count=len(snapshots))
