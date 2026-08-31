from fastapi import APIRouter
from app.services.learner_service import LearnerService
from app.schemas.profile import LearnerProfile, LearnerProfileUpdate
from app.schemas.common import DataResponse

router = APIRouter()

@router.get("", response_model=DataResponse[LearnerProfile])
@router.get("/", response_model=DataResponse[LearnerProfile])
async def get_demo_learner():
    learner = await LearnerService.get_demo_learner()
    return DataResponse(data=learner)

@router.get("/profile", response_model=DataResponse[LearnerProfile])
async def get_learner_profile():
    profile = await LearnerService.get_profile()
    return DataResponse(data=profile)

@router.put("/profile", response_model=DataResponse[LearnerProfile])
async def update_learner_profile(updates: LearnerProfileUpdate):
    updated = await LearnerService.update_profile(updates)
    return DataResponse(data=updated)
