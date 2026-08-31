from typing import Optional, Dict, Any
from app.repositories.learner_repository import LearnerRepository
from app.schemas.profile import LearnerProfile, LearnerProfileUpdate
from app.utils.errors import ResourceNotFoundError

DEMO_LEARNER_ID = "demo-learner"

class LearnerService:
    @staticmethod
    async def get_demo_learner() -> Dict[str, Any]:
        learner = await LearnerRepository.get_by_id(DEMO_LEARNER_ID)
        if not learner:
            # Fallback check for alternate ID 'alex-morgan'
            learner = await LearnerRepository.get_by_id("alex-morgan")
        if not learner:
            raise ResourceNotFoundError(f"Demo learner '{DEMO_LEARNER_ID}' not found in database. Run seed script.")
        return learner

    @staticmethod
    async def get_profile(learner_id: str = DEMO_LEARNER_ID) -> Dict[str, Any]:
        learner = await LearnerRepository.get_by_id(learner_id)
        if not learner:
            learner = await LearnerRepository.get_by_id("alex-morgan")
        if not learner:
            raise ResourceNotFoundError("Learner profile not found")
        return learner

    @staticmethod
    async def update_profile(updates: LearnerProfileUpdate, learner_id: str = DEMO_LEARNER_ID) -> Dict[str, Any]:
        # Filter out None values
        update_dict = updates.model_dump(exclude_unset=True, exclude_none=True)
        if not update_dict:
            return await LearnerService.get_profile(learner_id)

        # Sync alias fields if present
        if "primaryGoal" in update_dict:
            update_dict["goal"] = update_dict["primaryGoal"]
        elif "goal" in update_dict:
            update_dict["primaryGoal"] = update_dict["goal"]

        if "availableHoursPerWeek" in update_dict:
            update_dict["hoursPerWeek"] = update_dict["availableHoursPerWeek"]
        elif "hoursPerWeek" in update_dict:
            update_dict["availableHoursPerWeek"] = update_dict["hoursPerWeek"]

        if "experience" in update_dict:
            update_dict["experienceLevel"] = update_dict["experience"]
        elif "experienceLevel" in update_dict:
            update_dict["experience"] = update_dict["experienceLevel"]

        updated = await LearnerRepository.update(learner_id, update_dict)
        if not updated:
            updated = await LearnerRepository.update("alex-morgan", update_dict)
        if not updated:
            raise ResourceNotFoundError("Learner not found to update")
        return updated
