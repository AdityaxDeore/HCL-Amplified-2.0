from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RoadmapEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str = "prerequisite"  # "prerequisite", "recommended_before", "related", "alternative", "part_of"
    data: Optional[Dict[str, Any]] = None

class RoadmapNode(BaseModel):
    id: str
    skillId: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str = "General"
    type: str = "skill"  # "skill", "topic", "tool", "technology", "concept", "project", "milestone"
    importance: str = "mandatory"  # "mandatory", "recommended", "optional"
    status: str = "not_started"  # "locked", "not_started", "in_progress", "completed", "skipped"
    estimatedHours: Optional[float] = 10.0
    estimatedWeeks: Optional[int] = 1
    difficulty: Optional[str] = "Beginner"
    prerequisites: List[str] = []
    children: Optional[List[str]] = []
    related_skills: Optional[List[str]] = []
    order: int = 1
    milestone: Optional[str] = None
    whyItMatters: Optional[str] = None
    month: Optional[int] = 1
    is_available: Optional[bool] = True
    is_blocked: Optional[bool] = False
    source: Optional[str] = "roadmap.sh"
    metadata: Optional[Dict[str, Any]] = None

class RoadmapMilestone(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    month: Optional[int] = 1
    nodeIds: List[str] = []
    status: str = "not_started"
    progress: int = Field(default=0, ge=0, le=100)
    completion_rule: Optional[str] = "all_mandatory_completed"

class RoadmapSchema(BaseModel):
    id: str
    roadmap_id: Optional[str] = None
    learnerId: Optional[str] = "demo-learner"
    title: str
    goal: Optional[str] = None
    targetRole: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = "1.0"
    source: Optional[str] = "roadmap.sh"
    status: str = "active"
    timeline: Optional[str] = "4 months"
    hoursPerWeek: Optional[int] = 10
    overallProgress: int = Field(default=0, ge=0, le=100)
    currentPhase: Optional[str] = None
    categories: List[str] = []
    nodes: List[RoadmapNode] = []
    edges: List[RoadmapEdge] = []
    milestones: List[RoadmapMilestone] = []
    metadata: Optional[Dict[str, Any]] = None
    updatedAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None

class RoadmapGraphResponse(BaseModel):
    roadmap_id: str
    title: str
    description: Optional[str] = None
    nodes: List[RoadmapNode]
    edges: List[RoadmapEdge]
    categories: List[str]
    milestones: List[RoadmapMilestone]
    topological_order: List[str]
    next_nodes: List[RoadmapNode]

class RoadmapSummary(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    node_count: int = 0
    source: str = "roadmap.sh"

class RoadmapNodePatch(BaseModel):
    status: Optional[str] = None
    importance: Optional[str] = None
    order: Optional[int] = None
    estimatedHours: Optional[float] = None
    estimatedWeeks: Optional[int] = None
    category: Optional[str] = None

class RoadmapUpdate(BaseModel):
    title: Optional[str] = None
    goal: Optional[str] = None
    targetRole: Optional[str] = None
    timeline: Optional[str] = None
    hoursPerWeek: Optional[int] = None
    status: Optional[str] = None
    overallProgress: Optional[int] = None
