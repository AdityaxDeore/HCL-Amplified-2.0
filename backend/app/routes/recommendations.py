from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import (
    RecommendationItem,
    RecommendationResponse,
    NextBestActionsResponse
)
from app.schemas.common import DataResponse, ListResponse

router = APIRouter()

@router.get("", response_model=DataResponse[RecommendationResponse])
@router.get("/", response_model=DataResponse[RecommendationResponse])
async def get_personalized_recommendations(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Target role override"),
    limit: int = Query(5, ge=1, le=10, description="Max recommendations to return")
):
    """Generates personalized, prioritized next learning recommendations with explainability metadata."""
    recs = await RecommendationService.get_recommendations(
        learner_id=learner_id,
        target_role=target_role,
        limit=limit
    )
    return DataResponse(data=recs)

@router.get("/next", response_model=ListResponse[RecommendationItem])
async def get_next_best_actions(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Target role override"),
    limit: int = Query(3, ge=1, le=5, description="Max actions to return")
):
    """Returns top 3 unblocked actionable next steps for the learner."""
    actions = await RecommendationService.get_next_best_actions(
        learner_id=learner_id,
        target_role=target_role,
        limit=limit
    )
    return ListResponse(data=actions, count=len(actions))

@router.post("/refresh", response_model=DataResponse[RecommendationResponse])
async def refresh_recommendations(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Target role override")
):
    """Refreshes recommendation calculations based on recent progress."""
    recs = await RecommendationService.get_recommendations(
        learner_id=learner_id,
        target_role=target_role,
        limit=5
    )
    return DataResponse(data=recs)
