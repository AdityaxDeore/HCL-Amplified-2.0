from typing import Optional, Dict, Any, List
from app.repositories.resource_repository import ResourceRepository
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.recommendation_service import RecommendationService
from app.services.skill_graph_engine import SkillGraphEngine
from app.utils.errors import ResourceNotFoundError

class ResourceService:
    @staticmethod
    async def get_resources(
        skill_id: Optional[str] = None,
        roadmap_node_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        provider: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        # If specific skill is requested, run live discovery and ranking
        target_skill = skill_id or roadmap_node_id
        if target_skill or search:
            discovered = await ResourceDiscoveryService.discover_resources_for_skill(
                skill_id=target_skill or search or "machine-learning",
                skill_name=search,
                difficulty=difficulty or "Beginner",
                limit=limit
            )
            if discovered:
                if resource_type and resource_type.lower() != "all":
                    discovered = [r for r in discovered if r.get("type", "").lower() == resource_type.lower()]
                return discovered

        # Fallback to repository
        return await ResourceRepository.get_all(
            skill_id=skill_id,
            roadmap_node_id=roadmap_node_id,
            resource_type=resource_type,
            provider=provider,
            difficulty=difficulty,
            search=search
        )

    @staticmethod
    async def get_by_id(resource_id: str) -> Dict[str, Any]:
        # Check repository
        try:
            res = await ResourceRepository.get_by_id(resource_id)
            if res:
                return res
        except Exception:
            pass

        # Check if YouTube or Docs resource ID (e.g. youtube:dQw4w9WgXcQ)
        if ":" in resource_id:
            prefix, identifier = resource_id.split(":", 1)
            discovered = await ResourceDiscoveryService.discover_resources_for_skill(identifier, limit=5)
            for r in discovered:
                if r.get("id") == resource_id or r.get("resource_id") == resource_id or identifier in r.get("id", ""):
                    return r

        raise ResourceNotFoundError(f"Resource with id '{resource_id}' not found.")

    @staticmethod
    async def get_resources_for_skill(skill_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        return await ResourceDiscoveryService.discover_resources_for_skill(skill_id=skill_id, limit=limit)

    @classmethod
    async def get_next_action_resource(cls, learner_id: str = "demo-learner") -> Dict[str, Any]:
        actions = await RecommendationService.get_next_best_actions(learner_id=learner_id, limit=1)
        if not actions:
            target_skill = "statistics"
            action_title = "Statistics Fundamentals"
            action_reason = "Foundational prerequisite for AI Engineer."
        else:
            top_action = actions[0]
            target_skill = top_action.get("skill_id", "statistics")
            action_title = top_action.get("title", "Statistics")
            action_reason = top_action.get("reason", "")

        resources = await ResourceDiscoveryService.discover_resources_for_skill(
            skill_id=target_skill,
            skill_name=action_title,
            limit=3
        )
        top_resource = resources[0] if resources else None

        return {
            "learner_id": learner_id,
            "skill_id": target_skill,
            "skill_title": action_title,
            "recommendation_reason": action_reason,
            "top_resource": top_resource,
            "alternative_resources": resources[1:] if len(resources) > 1 else []
        }
