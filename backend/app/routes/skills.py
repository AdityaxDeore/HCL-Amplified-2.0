from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.skill_service import SkillService
from app.schemas.skill import (
    SkillSchema,
    SkillGraphResponse,
    SkillPathResponse,
    SkillCreate
)
from app.schemas.common import DataResponse, ListResponse
from app.utils.errors import ResourceNotFoundError

router = APIRouter()

@router.get("/graph", response_model=DataResponse[SkillGraphResponse])
async def get_skill_graph():
    """Returns complete skill ontology graph with nodes, directed edges, and categories."""
    graph = await SkillService.get_skill_graph()
    return DataResponse(data=graph)

@router.get("/path", response_model=DataResponse[SkillPathResponse])
async def find_skill_path(
    source: str = Query(..., description="Source skill ID (e.g. 'python')"),
    target: str = Query(..., description="Target skill ID (e.g. 'generative-ai')")
):
    """Calculates the shortest prerequisite learning sequence from source to target skill."""
    path_data = await SkillService.find_path(source, target)
    return DataResponse(data=path_data)

@router.get("/search", response_model=ListResponse[SkillSchema])
async def search_skills(
    q: str = Query("", description="Search term for name, description, or category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty")
):
    """Searches skills by keyword and filters."""
    skills = await SkillService.search_skills(query=q, category=category, difficulty=difficulty)
    return ListResponse(data=skills, count=len(skills))

@router.get("/{skill_id}/prerequisites", response_model=ListResponse[SkillSchema])
async def get_skill_prerequisites(skill_id: str):
    """Returns direct prerequisite skills."""
    prereqs = await SkillService.get_prerequisites(skill_id)
    return ListResponse(data=prereqs, count=len(prereqs))

@router.get("/{skill_id}/dependents", response_model=ListResponse[SkillSchema])
async def get_skill_dependents(skill_id: str):
    """Returns direct dependent skills that require this skill."""
    dependents = await SkillService.get_dependents(skill_id)
    return ListResponse(data=dependents, count=len(dependents))

@router.get("/{skill_id}/related", response_model=ListResponse[SkillSchema])
async def get_related_skills(skill_id: str):
    """Returns related and complementary skills."""
    related = await SkillService.get_related(skill_id)
    return ListResponse(data=related, count=len(related))

@router.get("/{skill_id}/upstream", response_model=ListResponse[SkillSchema])
async def get_upstream_skills(skill_id: str):
    """Returns transitive upstream prerequisite tree ('What leads to this skill?')."""
    upstream = await SkillService.get_upstream(skill_id)
    return ListResponse(data=upstream, count=len(upstream))

@router.get("/{skill_id}/downstream", response_model=ListResponse[SkillSchema])
async def get_downstream_skills(skill_id: str):
    """Returns transitive downstream unlockable skills ('What can I reach next?')."""
    downstream = await SkillService.get_downstream(skill_id)
    return ListResponse(data=downstream, count=len(downstream))

@router.get("/{skill_id}", response_model=DataResponse[SkillSchema])
async def get_skill_by_id(skill_id: str):
    """Returns single skill details with alias resolution."""
    skill = await SkillService.get_by_id(skill_id)
    return DataResponse(data=skill)

@router.get("", response_model=ListResponse[SkillSchema])
@router.get("/", response_model=ListResponse[SkillSchema])
async def get_all_skills(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty")
):
    """Lists all skills in the skill ontology."""
    skills = await SkillService.get_all_skills(category=category, difficulty=difficulty)
    return ListResponse(data=skills, count=len(skills))
