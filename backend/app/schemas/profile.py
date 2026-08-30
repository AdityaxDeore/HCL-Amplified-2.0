from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        
class SkillLevel(BaseModel):
    skill_name: str
    level: float
    last_assessment: Optional[datetime] = None
    
class LearnerProfileBase(BaseModel):
    user_id: str
    target_role: str
    target_timeline_months: int
    current_skills: List[SkillLevel]
    study_hours_per_week: float

class LearnerProfileResponse(LearnerProfileBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
