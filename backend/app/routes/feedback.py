from fastapi import APIRouter
from app.schemas.feedback import LearnerFeedbackRequest, LearnerFeedbackResponse
from app.schemas.common import DataResponse
from app.services.adaptation_service import AdaptationService

router = APIRouter()

@router.post("", response_model=DataResponse[LearnerFeedbackResponse])
@router.post("/", response_model=DataResponse[LearnerFeedbackResponse])
async def submit_learner_feedback(req: LearnerFeedbackRequest):
    """
    Submits explicit learner feedback (difficulty, content preference, time constraint)
    to drive adaptive learning without mutating the roadmap.
    """
    result = await AdaptationService.record_feedback(
        learner_id=req.learnerId,
        feedback_type=req.type,
        value=req.value,
        target_id=req.targetId,
        metadata=req.metadata
    )
    return DataResponse(data=result)
