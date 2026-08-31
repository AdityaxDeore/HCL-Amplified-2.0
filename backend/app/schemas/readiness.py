from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

class ReadinessDimensions(BaseModel):
    skillCoverage: Optional[float] = None
    prerequisiteCompletion: Optional[float] = None
    roadmapProgress: Optional[float] = None
    practicalExperience: Optional[float] = None
    assessmentPerformance: Optional[float] = None
    learningConsistency: Optional[float] = None
    goalAlignment: Optional[float] = None

class SkillReadinessItem(BaseModel):
    skillId: str
    name: str
    score: float
    status: str  # "READY", "DEVELOPING", "NEEDS_ATTENTION", "NOT_STARTED"
    currentLevel: int
    requiredLevel: int
    gap: int
    isBlocked: bool = False
    blockingPrerequisites: List[str] = []

class CriticalGapItem(BaseModel):
    skillId: str
    name: str
    currentLevel: int
    requiredLevel: int
    gap: int
    importance: str = "critical"  # "critical", "high", "medium"
    reason: str
    prerequisiteBlocked: bool = False

class NextActionItem(BaseModel):
    id: str
    type: str = "skill"  # "skill" | "roadmap_node" | "resource" | "project" | "assessment"
    title: str
    reason: str
    priority: str = "high"  # "high" | "medium" | "low"
    estimatedHours: Optional[float] = None
    impact: Optional[float] = None
    targetId: Optional[str] = None

class ReadinessResponse(BaseModel):
    learnerId: str = "demo-learner"
    score: float
    status: str  # "READY" | "NEAR_READY" | "BUILDING" | "NOT_READY"
    confidence: str = "medium"  # "high" | "medium" | "low"
    dataCompleteness: float
    dimensions: ReadinessDimensions
    dimensionWeights: Dict[str, float] = {}
    strengths: List[str] = []
    criticalGaps: List[CriticalGapItem] = []
    nextActions: List[NextActionItem] = []
    interviewReady: bool = False
    interviewReadinessExplanation: str = ""
    explanation: str = ""
    lastCalculatedAt: Optional[str] = None

class ReadinessSnapshotSchema(BaseModel):
    id: Optional[str] = None
    learnerId: str = "demo-learner"
    score: float
    status: str
    createdAt: str
