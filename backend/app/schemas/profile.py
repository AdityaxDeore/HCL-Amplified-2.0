from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class CurrentSkillItem(BaseModel):
    skillId: str
    name: str
    level: str = "Beginner"  # "Beginner", "Intermediate", "Advanced"

class LearnerProfile(BaseModel):
    id: str = "demo-learner"
    name: str = "Alex Morgan"
    goal: Optional[str] = "Become an AI Engineer"
    primaryGoal: Optional[str] = "Become an AI Engineer"
    targetRole: str = "AI Engineer"
    experienceLevel: str = "Intermediate"
    experience: Optional[str] = "Intermediate"
    hoursPerWeek: int = Field(default=10, ge=1, le=100)
    availableHoursPerWeek: int = Field(default=10, ge=1, le=100)
    targetMonths: int = Field(default=4, ge=1, le=60)
    interests: List[str] = ["Artificial Intelligence", "Machine Learning", "Generative AI"]
    completedCourses: List[str] = []
    currentSkills: List[CurrentSkillItem] = [
        CurrentSkillItem(skillId="python", name="Python", level="Intermediate"),
        CurrentSkillItem(skillId="sql", name="SQL", level="Intermediate"),
        CurrentSkillItem(skillId="git", name="Git", level="Intermediate"),
        CurrentSkillItem(skillId="numpy", name="NumPy", level="Beginner"),
    ]
    careerGoals: List[str] = ["AI Engineer", "Machine Learning Engineer"]
    learningPreferences: Dict[str, Any] = {
        "formats": ["video", "interactive", "project"],
        "pace": "balanced"
    }
    overallProgress: int = Field(default=32, ge=0, le=100)
    readiness: int = Field(default=78, ge=0, le=100)
    streak: int = Field(default=7, ge=0)
    learningHours: int = Field(default=42, ge=0)
    topicsCompleted: int = Field(default=18, ge=0)
    profileCompletion: int = Field(default=85, ge=0, le=100)
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class LearnerProfileUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    primaryGoal: Optional[str] = None
    targetRole: Optional[str] = None
    experienceLevel: Optional[str] = None
    experience: Optional[str] = None
    hoursPerWeek: Optional[int] = Field(None, ge=1, le=100)
    availableHoursPerWeek: Optional[int] = Field(None, ge=1, le=100)
    targetMonths: Optional[int] = Field(None, ge=1, le=60)
    interests: Optional[List[str]] = None
    currentSkills: Optional[List[CurrentSkillItem]] = None
    careerGoals: Optional[List[str]] = None
    learningPreferences: Optional[Dict[str, Any]] = None
