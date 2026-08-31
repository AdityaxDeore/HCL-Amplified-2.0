from typing import Optional, Dict, Any
from app.repositories.progress_repository import ProgressRepository
from app.repositories.learner_repository import LearnerRepository
from app.repositories.roadmap_repository import RoadmapRepository
from app.schemas.progress import ProgressPatch
from app.utils.errors import ResourceNotFoundError

class ProgressService:
    @staticmethod
    async def get_progress(learner_id: str = "demo-learner") -> Dict[str, Any]:
        progress = await ProgressRepository.get_by_learner_id(learner_id)
        if not progress:
            progress = await ProgressRepository.get_by_learner_id("alex-morgan")
        if not progress:
            raise ResourceNotFoundError("Progress record not found. Run seed script.")
        return progress

    @staticmethod
    async def patch_progress(patch: ProgressPatch, learner_id: str = "demo-learner") -> Dict[str, Any]:
        patch_dict = patch.model_dump(exclude_unset=True, exclude_none=True)
        if not patch_dict:
            return await ProgressService.get_progress(learner_id)

        # Sync aliases
        if "overall" in patch_dict:
            patch_dict["overallProgress"] = patch_dict["overall"]
        if "streak" in patch_dict:
            patch_dict["currentStreak"] = patch_dict["streak"]

        updated = await ProgressRepository.update(learner_id, patch_dict)
        if not updated:
            updated = await ProgressRepository.update("alex-morgan", patch_dict)
        if not updated:
            raise ResourceNotFoundError("Progress record not found to update")
        return updated

    @staticmethod
    async def get_dashboard_summary(learner_id: str = "demo-learner") -> Dict[str, Any]:
        learner = await LearnerRepository.get_by_id(learner_id) or await LearnerRepository.get_by_id("alex-morgan") or {}
        roadmap = await RoadmapRepository.get_by_learner_id(learner_id) or await RoadmapRepository.get_by_id("ai-engineer") or {}
        progress = await ProgressRepository.get_by_learner_id(learner_id) or await ProgressRepository.get_by_learner_id("alex-morgan") or {}

        next_action = progress.get("nextAction", {
            "title": "Complete Classification Algorithms",
            "description": "Prerequisites completed. Matches your current learner level.",
            "estimatedMinutes": 45,
            "skillId": "machine-learning"
        })

        return {
            "learner": learner,
            "roadmap": roadmap,
            "progress": progress,
            "nextAction": next_action
        }
