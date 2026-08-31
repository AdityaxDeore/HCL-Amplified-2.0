from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.roadmap_service import RoadmapService
from app.services.personalized_roadmap_service import PersonalizedRoadmapService
from app.schemas.personalized_roadmap import PersonalizedRoadmapResponse
from app.schemas.roadmap import (
    RoadmapSchema,
    RoadmapGraphResponse,
    RoadmapSummary,
    RoadmapNode,
    RoadmapMilestone,
    RoadmapUpdate,
    RoadmapNodePatch
)
from app.schemas.common import DataResponse, ListResponse
from app.utils.errors import ResourceNotFoundError

router = APIRouter()

@router.get("/personalized", response_model=DataResponse[PersonalizedRoadmapResponse])
async def get_personalized_roadmap(
    learner_id: str = Query("demo-learner", description="Learner ID"),
    target_role: Optional[str] = Query(None, description="Target role override")
):
    """Returns fully personalized roadmap with blocked state, priority, and reality check insights."""
    pers_roadmap = await PersonalizedRoadmapService.get_personalized_roadmap(learner_id=learner_id, target_role=target_role)
    return DataResponse(data=pers_roadmap)

@router.get("/list", response_model=ListResponse[RoadmapSummary])
async def list_all_roadmaps():
    """Lists all available canonical roadmaps discovered in roadmaps/ directory."""
    roadmaps = RoadmapService.list_all_roadmaps()
    return ListResponse(data=roadmaps, count=len(roadmaps))

@router.get("", response_model=DataResponse[RoadmapSchema])
@router.get("/", response_model=DataResponse[RoadmapSchema])
async def get_current_roadmap():
    """Returns active personalized roadmap for demo learner."""
    roadmap = await RoadmapService.get_current_roadmap()
    return DataResponse(data=roadmap)

@router.get("/{roadmap_id}/graph", response_model=DataResponse[RoadmapGraphResponse])
async def get_roadmap_graph(roadmap_id: str = Path(..., description="Roadmap slug ID (e.g. ai-engineer)")):
    """Returns validated graph representation with topological sequence, edges, and next actionable nodes."""
    graph_data = await RoadmapService.get_roadmap_graph(roadmap_id)
    return DataResponse(data=graph_data)

@router.get("/{roadmap_id}/milestones", response_model=ListResponse[RoadmapMilestone])
async def get_roadmap_milestones(roadmap_id: str):
    """Returns evaluated milestones for the roadmap."""
    milestones = await RoadmapService.get_milestones(roadmap_id)
    return ListResponse(data=milestones, count=len(milestones))

@router.get("/{roadmap_id}/next", response_model=ListResponse[RoadmapNode])
async def get_next_learning_nodes(
    roadmap_id: str,
    limit: int = Query(3, ge=1, le=10, description="Max candidate nodes to return")
):
    """Calculates deterministic next actionable learning nodes based on completed prerequisites."""
    nodes = await RoadmapService.get_next_learning_nodes(roadmap_id, limit=limit)
    return ListResponse(data=nodes, count=len(nodes))

@router.get("/{roadmap_id}/nodes", response_model=ListResponse[RoadmapNode])
async def get_roadmap_nodes(roadmap_id: str):
    """Returns all nodes in the roadmap."""
    roadmap = await RoadmapService.get_by_id(roadmap_id)
    nodes = roadmap.get("nodes", [])
    return ListResponse(data=nodes, count=len(nodes))

@router.get("/{roadmap_id}/nodes/{node_id}", response_model=DataResponse[RoadmapNode])
@router.get("/{roadmap_id}/node/{node_id}", response_model=DataResponse[RoadmapNode])
async def get_single_roadmap_node(roadmap_id: str, node_id: str):
    """Returns a specific node within a roadmap."""
    roadmap = await RoadmapService.get_by_id(roadmap_id)
    node = next((n for n in roadmap.get("nodes", []) if n.get("id") == node_id), None)
    if not node:
        raise ResourceNotFoundError(f"Node '{node_id}' not found in roadmap '{roadmap_id}'.")
    return DataResponse(data=node)

@router.get("/{roadmap_id}", response_model=DataResponse[RoadmapSchema])
async def get_roadmap_by_id(roadmap_id: str):
    """Returns full roadmap document by ID."""
    roadmap = await RoadmapService.get_by_id(roadmap_id)
    return DataResponse(data=roadmap)

@router.put("/{roadmap_id}", response_model=DataResponse[RoadmapSchema])
async def update_roadmap_metadata(roadmap_id: str, updates: RoadmapUpdate):
    """Updates roadmap metadata."""
    updated = await RoadmapService.update_metadata(roadmap_id, updates)
    return DataResponse(data=updated)

@router.patch("/{roadmap_id}/nodes/{node_id}", response_model=DataResponse[RoadmapSchema])
async def patch_roadmap_node(roadmap_id: str, node_id: str, patch: RoadmapNodePatch):
    """Mutates a node status/importance/order and recalculates roadmap progress."""
    updated = await RoadmapService.patch_node(roadmap_id, node_id, patch)
    return DataResponse(data=updated)

@router.delete("/{roadmap_id}/nodes/{node_id}", response_model=DataResponse[RoadmapSchema])
async def delete_roadmap_node(roadmap_id: str, node_id: str):
    """Removes a node from the personalized roadmap."""
    updated = await RoadmapService.delete_node(roadmap_id, node_id)
    return DataResponse(data=updated)
