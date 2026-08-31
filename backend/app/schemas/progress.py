from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillProgressItem(BaseModel):
    skillId: str
    name: str
    progress: int = Field(default=0, ge=0, le=100)
    status: str = "not_started"  # "not_started", "in_progress", "completed", "locked"
    hoursSpent: Optional[float] = 0.0

class MilestoneProgressItem(BaseModel):
    id: str
    title: str
    status: str = "not_started"
    progress: int = Field(default=0, ge=0, le=100)
    targetDate: Optional[str] = None
    completedDate: Optional[str] = None

class WeeklyActivityItem(BaseModel):
    day: str
    hours: float = 0.0

class NextActionItem(BaseModel):
    title: str
    description: Optional[str] = None
    estimatedMinutes: Optional[int] = 30
    whyImportant: Optional[str] = None
    resourceId: Optional[str] = None
    skillId: Optional[str] = None

class ProgressSchema(BaseModel):
    learnerId: str = "demo-learner"
    overall: int = Field(default=32, ge=0, le=100)
    overallProgress: Optional[int] = Field(default=32, ge=0, le=100)
    readiness: int = Field(default=78, ge=0, le=100)
    learningHours: float = Field(default=42.0, ge=0)
    topicsCompleted: int = Field(default=18, ge=0)
    streak: int = Field(default=7, ge=0)
    currentStreak: Optional[int] = Field(default=7, ge=0)
    skillProgress: List[SkillProgressItem] = []
    milestones: List[MilestoneProgressItem] = []
    weeklyActivity: List[WeeklyActivityItem] = []
    nextAction: Optional[NextActionItem] = None
    updatedAt: Optional[datetime] = None

class ProgressPatch(BaseModel):
    learningHours: Optional[float] = Field(None, ge=0)
    topicsCompleted: Optional[int] = Field(None, ge=0)
    streak: Optional[int] = Field(None, ge=0)
    overall: Optional[int] = Field(None, ge=0, le=100)
    readiness: Optional[int] = Field(None, ge=0, le=100)
