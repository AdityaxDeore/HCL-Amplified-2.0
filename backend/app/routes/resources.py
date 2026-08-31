from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.resource_service import ResourceService
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.resource_feedback_service import ResourceFeedbackService
from app.services.rag_context_service import RAGContextService
from app.schemas.resource import ResourceSchema, ResourceSearchResult
from app.schemas.feedback import ResourceFeedbackRequest, ResourceFeedbackResponse
from app.schemas.rag import RAGContextResponse
from app.schemas.common import DataResponse, ListResponse
from app.utils.errors import ResourceNotFoundError

router = APIRouter()

@router.get("/search", response_model=DataResponse[ResourceSearchResult])
async def search_resources(
    q: str = Query("", description="Search term for learning resources"),
    skill_id: Optional[str] = Query(None, description="Optional target skill ID"),
    type: Optional[str] = Query(None, description="Filter by resource type (video, course, documentation)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    limit: int = Query(10, ge=1, le=20, description="Max results")
):
    """Searches learning resources across YouTube, official documentation, and course catalogs."""
    results = await ResourceDiscoveryService.search_resources(
        query=q,
        skill_id=skill_id,
        resource_type=type,
        difficulty=difficulty,
        limit=limit
    )
    return DataResponse(data=results)

@router.get("/skill/{skill_id}", response_model=ListResponse[ResourceSchema])
async def get_resources_for_skill(
    skill_id: str = Path(..., description="Canonical skill ID (e.g. statistics, machine-learning)"),
    limit: int = Query(5, ge=1, le=10, description="Max ranked resources to return")
):
    """Retrieves top ranked learning resources with citations for a specific skill."""
    resources = await ResourceService.get_resources_for_skill(skill_id=skill_id, limit=limit)
    return ListResponse(data=resources, count=len(resources))

@router.get("/next-action", response_model=DataResponse[Dict[str, Any]])
@router.get("/personalized/next-action", response_model=DataResponse[Dict[str, Any]])
async def get_next_action_resource(
    learner_id: str = Query("demo-learner", description="Learner ID")
):
    """Retrieves top recommended resource with citation for the learner's next actionable skill."""
    result = await ResourceService.get_next_action_resource(learner_id=learner_id)
    return DataResponse(data=result)

@router.get("/rag/context", response_model=DataResponse[RAGContextResponse])
async def get_rag_context(
    skill_id: str = Query("statistics", description="Skill ID to retrieve context for"),
    query: Optional[str] = Query(None, description="User learning query"),
    learner_id: str = Query("demo-learner", description="Learner ID")
):
    """Retrieves grounded structured context and verified citations for conversational AI (Part 9)."""
    context = await RAGContextService.retrieve_context_for_skill(
        learner_id=learner_id,
        skill_id=skill_id,
        query=query,
        limit=3
    )
    return DataResponse(data=context)

@router.post("/{resource_id}/feedback", response_model=DataResponse[ResourceFeedbackResponse])
async def submit_resource_feedback(
    resource_id: str,
    feedback_req: ResourceFeedbackRequest
):
    """Submits learner interaction feedback on a learning resource."""
    res = await ResourceFeedbackService.record_feedback(
        learner_id=feedback_req.learner_id,
        resource_id=resource_id,
        skill_id=feedback_req.skill_id,
        feedback=feedback_req.feedback,
        comment=feedback_req.comment
    )
    return DataResponse(data=res)

@router.get("/{resource_id}", response_model=DataResponse[ResourceSchema])
async def get_resource_by_id(resource_id: str):
    """Retrieves single resource details with embedded citation metadata."""
    resource = await ResourceService.get_by_id(resource_id)
    return DataResponse(data=resource)

@router.get("", response_model=ListResponse[ResourceSchema])
@router.get("/", response_model=ListResponse[ResourceSchema])
async def get_all_resources(
    skillId: Optional[str] = Query(None, alias="skill_id"),
    roadmapNodeId: Optional[str] = Query(None, alias="roadmap_node_id"),
    type: Optional[str] = Query(None, alias="resource_type"),
    provider: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50)
):
    """Retrieves catalog resources with optional filtering."""
    resources = await ResourceService.get_resources(
        skill_id=skillId,
        roadmap_node_id=roadmapNodeId,
        resource_type=type,
        provider=provider,
        difficulty=difficulty,
        search=search,
        limit=limit
    )
    return ListResponse(data=resources, count=len(resources))
