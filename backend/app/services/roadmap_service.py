import logging
from typing import Optional, Dict, Any, List, Set
from app.repositories.roadmap_repository import RoadmapRepository
from app.repositories.progress_repository import ProgressRepository
from app.utils.roadmap_loader import RoadmapLoader
from app.services.roadmap_engine import RoadmapEngine, GraphValidationError, DependencyCycleError
from app.schemas.roadmap import RoadmapNodePatch, RoadmapUpdate
from app.utils.errors import ResourceNotFoundError

logger = logging.getLogger(__name__)

class RoadmapService:
    @staticmethod
    def _recalculate_progress(nodes: List[Dict[str, Any]]) -> int:
        if not nodes:
            return 0
        non_optional = [n for n in nodes if n.get("importance") != "optional"]
        target_nodes = non_optional if non_optional else nodes
        completed = sum(1 for n in target_nodes if n.get("status") == "completed")
        return int(round((completed / len(target_nodes)) * 100))

    @classmethod
    def list_all_roadmaps(cls) -> List[Dict[str, Any]]:
        return RoadmapLoader.list_available_roadmaps()

    @classmethod
    async def get_current_roadmap(cls, learner_id: str = "demo-learner") -> Dict[str, Any]:
        roadmap = await RoadmapRepository.get_by_learner_id(learner_id)
        if not roadmap:
            roadmap = await RoadmapRepository.get_by_id("ai-engineer")
        if not roadmap:
            # Fallback to normalized raw JSON
            roadmap = RoadmapLoader.normalize_roadmap("ai-engineer")
        if not roadmap:
            raise ResourceNotFoundError("Roadmap 'ai-engineer' not found.")

        # Ensure availability flags are decorated
        completed_ids = {n["id"] for n in roadmap.get("nodes", []) if n.get("status") == "completed"}
        roadmap["nodes"] = RoadmapEngine.calculate_node_availability(roadmap.get("nodes", []), completed_ids)
        roadmap["milestones"] = RoadmapEngine.evaluate_milestones(roadmap.get("milestones", []), roadmap.get("nodes", []))
        return roadmap

    @classmethod
    async def get_by_id(cls, roadmap_id: str) -> Dict[str, Any]:
        roadmap = await RoadmapRepository.get_by_id(roadmap_id)
        if not roadmap:
            # Fallback load and normalize from raw roadmap.sh JSON
            roadmap = RoadmapLoader.normalize_roadmap(roadmap_id)
        if not roadmap:
            raise ResourceNotFoundError(f"Roadmap with id '{roadmap_id}' not found.")

        completed_ids = {n["id"] for n in roadmap.get("nodes", []) if n.get("status") == "completed"}
        roadmap["nodes"] = RoadmapEngine.calculate_node_availability(roadmap.get("nodes", []), completed_ids)
        roadmap["milestones"] = RoadmapEngine.evaluate_milestones(roadmap.get("milestones", []), roadmap.get("nodes", []))
        return roadmap

    @classmethod
    async def get_roadmap_graph(cls, roadmap_id: str) -> Dict[str, Any]:
        """
        Validates graph, calculates topological order, availability, and next learning nodes.
        """
        roadmap = await cls.get_by_id(roadmap_id)
        nodes = roadmap.get("nodes", [])
        edges = roadmap.get("edges", [])

        # Validate graph
        RoadmapEngine.validate_graph(nodes, edges)

        # Topological sorting
        topological_order = RoadmapEngine.topological_sort(nodes, edges)

        # Completed IDs & Next nodes
        completed_ids = {n["id"] for n in nodes if n.get("status") == "completed"}
        next_nodes = RoadmapEngine.get_next_learning_nodes(nodes, completed_ids, limit=4)
        decorated_nodes = RoadmapEngine.calculate_node_availability(nodes, completed_ids)
        evaluated_milestones = RoadmapEngine.evaluate_milestones(roadmap.get("milestones", []), decorated_nodes)

        return {
            "roadmap_id": roadmap_id,
            "title": roadmap.get("title", roadmap_id),
            "description": roadmap.get("description"),
            "nodes": decorated_nodes,
            "edges": edges,
            "categories": roadmap.get("categories", []),
            "milestones": evaluated_milestones,
            "topological_order": topological_order,
            "next_nodes": next_nodes
        }

    @classmethod
    async def get_milestones(cls, roadmap_id: str) -> List[Dict[str, Any]]:
        roadmap = await cls.get_by_id(roadmap_id)
        nodes = roadmap.get("nodes", [])
        milestones = roadmap.get("milestones", [])
        return RoadmapEngine.evaluate_milestones(milestones, nodes)

    @classmethod
    async def get_next_learning_nodes(cls, roadmap_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        roadmap = await cls.get_by_id(roadmap_id)
        nodes = roadmap.get("nodes", [])
        completed_ids = {n["id"] for n in nodes if n.get("status") == "completed"}
        return RoadmapEngine.get_next_learning_nodes(nodes, completed_ids, limit=limit)

    @classmethod
    async def update_metadata(cls, roadmap_id: str, updates: RoadmapUpdate) -> Dict[str, Any]:
        update_dict = updates.model_dump(exclude_unset=True, exclude_none=True)
        updated = await RoadmapRepository.update(roadmap_id, update_dict)
        if not updated:
            raise ResourceNotFoundError(f"Roadmap '{roadmap_id}' not found to update")
        return updated

    @classmethod
    async def patch_node(cls, roadmap_id: str, node_id: str, patch: RoadmapNodePatch) -> Dict[str, Any]:
        patch_dict = patch.model_dump(exclude_unset=True, exclude_none=True)
        if not patch_dict:
            return await cls.get_by_id(roadmap_id)

        updated_roadmap = await RoadmapRepository.update_node(roadmap_id, node_id, patch_dict)
        if not updated_roadmap:
            # If not yet in MongoDB, persist canonical version first then patch
            canonical = RoadmapLoader.normalize_roadmap(roadmap_id)
            if not canonical:
                raise ResourceNotFoundError(f"Roadmap '{roadmap_id}' not found.")
            await RoadmapRepository.upsert(canonical)
            updated_roadmap = await RoadmapRepository.update_node(roadmap_id, node_id, patch_dict)

        if not updated_roadmap:
            raise ResourceNotFoundError(f"Node '{node_id}' in roadmap '{roadmap_id}' not found")

        # Recalculate roadmap progress
        nodes = updated_roadmap.get("nodes", [])
        new_progress = cls._recalculate_progress(nodes)
        await RoadmapRepository.update(roadmap_id, {"overallProgress": new_progress})
        updated_roadmap["overallProgress"] = new_progress

        # Also sync with learner progress record
        learner_id = updated_roadmap.get("learnerId", "demo-learner")
        await ProgressRepository.update(learner_id, {
            "overall": new_progress,
            "overallProgress": new_progress
        })

        completed_ids = {n["id"] for n in nodes if n.get("status") == "completed"}
        updated_roadmap["nodes"] = RoadmapEngine.calculate_node_availability(nodes, completed_ids)
        updated_roadmap["milestones"] = RoadmapEngine.evaluate_milestones(updated_roadmap.get("milestones", []), updated_roadmap["nodes"])
        return updated_roadmap

    @classmethod
    async def delete_node(cls, roadmap_id: str, node_id: str) -> Dict[str, Any]:
        updated_roadmap = await RoadmapRepository.delete_node(roadmap_id, node_id)
        if not updated_roadmap:
            raise ResourceNotFoundError(f"Node '{node_id}' not found in roadmap '{roadmap_id}'")

        nodes = updated_roadmap.get("nodes", [])
        new_progress = cls._recalculate_progress(nodes)
        await RoadmapRepository.update(roadmap_id, {"overallProgress": new_progress})
        updated_roadmap["overallProgress"] = new_progress

        completed_ids = {n["id"] for n in nodes if n.get("status") == "completed"}
        updated_roadmap["nodes"] = RoadmapEngine.calculate_node_availability(nodes, completed_ids)
        updated_roadmap["milestones"] = RoadmapEngine.evaluate_milestones(updated_roadmap.get("milestones", []), updated_roadmap["nodes"])
        return updated_roadmap
