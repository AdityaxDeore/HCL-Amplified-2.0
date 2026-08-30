from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Skill(BaseModel):
    skill_name: str
    proficiency: str # "Beginner", "Intermediate", "Advanced"

class Goal(BaseModel):
    goal_text: str
    target_role: Optional[str] = None
    target_domain: Optional[str] = None
    deadline: Optional[str] = None
    goal_type: Optional[str] = "career"

class LearningHistoryItem(BaseModel):
    title: str
    provider: Optional[str] = None
    topic: Optional[str] = None
    status: str = "Completed"
    completion_date: Optional[str] = None

class Availability(BaseModel):
    hours_per_week: int
    preferred_days: List[str] = []
    preferred_study_time: Optional[str] = None

class LearningPreferences(BaseModel):
    preferred_formats: List[str] = []
    pace: Optional[str] = "balanced"

class LearnerProfileBase(BaseModel):
    user_id: str
    experience_level: Optional[str] = None
    interests: List[str] = []
    skills: List[Skill] = []
    goals: List[Goal] = []
    learning_history: List[LearningHistoryItem] = []
    availability: Optional[Availability] = None
    learning_preferences: Optional[LearningPreferences] = None
    onboarding_status: str = "not_started"

class LearnerProfileCreate(LearnerProfileBase):
    pass

class LearnerProfileUpdate(BaseModel):
    experience_level: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[Skill]] = None
    goals: Optional[List[Goal]] = None
    learning_history: Optional[List[LearningHistoryItem]] = None
    availability: Optional[Availability] = None
    learning_preferences: Optional[LearningPreferences] = None
    onboarding_status: Optional[str] = None

class LearnerProfileResponse(LearnerProfileBase):
    id: str = Field(alias="_id", default=None)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
