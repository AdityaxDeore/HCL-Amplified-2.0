from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class LearnerFeedbackRequest(BaseModel):
    learnerId: str = "demo-learner"
    type: str = "difficulty"  # "difficulty", "content_preference", "resource_preference", "time_constraint", "confidence", "relevance", "completion", "skip_reason"
    value: str = "too_difficult"  # "too_easy", "appropriate", "too_difficult", "video", "article", "project", "less_time", "more_time", "not_relevant"
    targetId: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class LearnerFeedbackResponse(BaseModel):
    success: bool = True
    message: str = "Feedback recorded successfully"
    feedbackId: str
    adaptationSummary: Optional[str] = None
    createdAt: Optional[str] = None

# Backward compatibility alias for Part 8 resource feedback
class ResourceFeedbackRequest(BaseModel):
    learner_id: str = "demo-learner"
    resource_id: Optional[str] = None
    skill_id: Optional[str] = None
    feedback: str = "HELPFUL"
    comment: Optional[str] = None

class ResourceFeedbackResponse(BaseModel):
    success: bool = True
    message: str = "Feedback recorded successfully"
    feedback_id: str
    recorded_at: Optional[str] = None
