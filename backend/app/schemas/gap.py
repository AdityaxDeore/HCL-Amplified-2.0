from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    required_level: str = "intermediate"
    current_level: str = "none"
    gap_type: str = "FULL_GAP"  # "NO_GAP", "PARTIAL_GAP", "FULL_GAP", "BLOCKED_GAP", "OPTIONAL_GAP"
    importance: str = "mandatory"  # "mandatory", "recommended", "optional"
    priority: float = 0.50
    prerequisites: List[str] = []
    blocking_skills: List[str] = []
    is_blocked: bool = False
    estimated_hours: float = 15.0
    reason: str = ""
    decision_factors: Optional[Dict[str, float]] = None

class SkillGapSummary(BaseModel):
    target_role: str = "AI Engineer"
    total_required_skills: int = 0
    known_skills_count: int = 0
    full_gaps_count: int = 0
    partial_gaps_count: int = 0
    blocked_gaps_count: int = 0
    optional_gaps_count: int = 0
    total_estimated_gap_hours: float = 0.0

class SkillGapAnalysisResponse(BaseModel):
    summary: SkillGapSummary
    gaps: List[SkillGapItem]
    known_skills: List[Dict[str, Any]] = []
    actionable_gaps: List[SkillGapItem] = []
    blocked_gaps: List[SkillGapItem] = []

class SkillGapAnalyzeRequest(BaseModel):
    learner_id: Optional[str] = "demo-learner"
    target_role: Optional[str] = "ai-engineer"
    known_skills: Optional[List[Dict[str, Any]]] = None
    hours_per_week: Optional[float] = 10.0
    target_months: Optional[int] = 4
