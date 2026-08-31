from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PersonalizedRoadmapNode(BaseModel):
    id: str
    title: str
    category: str
    type: str = "skill"
    importance: str = "mandatory"  # "mandatory", "recommended", "optional"
    status: str = "not_started"  # "completed", "in_progress", "not_started", "locked", "skipped"
    priority: float = 0.5
    is_blocked: bool = False
    blocking_skills: List[str] = []
    estimated_hours: float = 15.0
    reason: str = ""
    included: bool = True
    prerequisites: List[str] = []
    order: int = 1
    month: int = 1

class PersonalizedRoadmapResponse(BaseModel):
    roadmap_id: str = "ai-engineer"
    learner_id: str = "demo-learner"
    target_role: str = "AI Engineer"
    title: str = "Personalized AI Engineer Roadmap"
    description: str = ""
    overall_progress: int = 0
    total_nodes: int = 0
    completed_nodes_count: int = 0
    blocked_nodes_count: int = 0
    actionable_nodes_count: int = 0
    nodes: List[PersonalizedRoadmapNode] = []
    next_best_action: Optional[Dict[str, Any]] = None
    reality_summary: Optional[Dict[str, Any]] = None
