from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RealityAdjustmentOption(BaseModel):
    type: str  # "increase_hours", "extend_deadline", "prune_optional"
    title: str
    description: str
    current: Optional[float] = None
    recommended: Optional[float] = None
    difference: Optional[float] = None
    current_weeks: Optional[float] = None
    recommended_weeks: Optional[float] = None
    recommended_months: Optional[float] = None
    estimated_hours_saved: Optional[float] = None
    topics_count: Optional[int] = None
    adjusted_weekly_hours: Optional[float] = None

class PrunableTopicItem(BaseModel):
    id: str
    title: str
    category: str
    estimated_hours: float = 15.0
    importance: str = "optional"
    reason: str = ""

class RealityCheckResponse(BaseModel):
    learner_id: str = "demo-learner"
    target_role: str = "AI Engineer"
    target_months: int = 4
    weeks_remaining: float = 16.0
    hours_per_week: float = 10.0
    available_hours: float = 160.0
    required_hours: float = 180.0
    workload_ratio: float = 1.13
    status: str = "AT_RISK"  # "COMFORTABLE", "REALISTIC", "TIGHT", "AT_RISK", "UNREALISTIC"
    minimum_weekly_hours: float = 11.3
    minimum_required_weeks: float = 18.0
    explanation: str = ""
    adjustments: List[RealityAdjustmentOption] = []
    prunable_topics: List[PrunableTopicItem] = []

class RealityCheckRequest(BaseModel):
    learner_id: Optional[str] = "demo-learner"
    target_role: Optional[str] = "ai-engineer"
    deadline: Optional[str] = None
    target_months: Optional[int] = 4
    hours_per_week: Optional[float] = 10.0
