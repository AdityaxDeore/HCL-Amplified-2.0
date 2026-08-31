from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ResourceFeedbackRequest(BaseModel):
    learner_id: str = "demo-learner"
    resource_id: Optional[str] = None
    skill_id: Optional[str] = None
    feedback: str = "HELPFUL"  # "HELPFUL", "NOT_HELPFUL", "TOO_EASY", "TOO_HARD", "OUTDATED", "COMPLETED", "LIKE", "DISLIKE"
    comment: Optional[str] = None

class ResourceFeedbackResponse(BaseModel):
    success: bool = True
    message: str = "Feedback recorded successfully"
    feedback_id: str
    recorded_at: Optional[str] = None
