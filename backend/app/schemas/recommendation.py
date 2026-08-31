from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecommendationItem(BaseModel):
    id: str
    type: str = "LEARN_SKILL"  # "LEARN_SKILL", "REVIEW_SKILL", "PRACTICE_SKILL", "BUILD_PROJECT", "ASSESS_SKILL"
    skill_id: str
    title: str
    category: str = "Core AI"
    importance: str = "mandatory"
    priority: int = 85  # 0 to 100 score
    estimated_hours: float = 15.0
    reason: str = ""
    prerequisites: List[str] = []
    expected_outcome: str = ""
    confidence: float = 0.95
    decision_factors: Optional[Dict[str, float]] = None

class RecommendationResponse(BaseModel):
    learner_id: str = "demo-learner"
    target_role: str = "AI Engineer"
    total_recommendations: int = 0
    recommendations: List[RecommendationItem] = []
    next_best_action: Optional[RecommendationItem] = None

class NextBestActionsResponse(BaseModel):
    learner_id: str = "demo-learner"
    target_role: str = "AI Engineer"
    actions: List[RecommendationItem] = []
