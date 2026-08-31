from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillProject(BaseModel):
    id: str
    title: str
    difficulty: str = "Beginner"  # "Beginner", "Intermediate", "Advanced"

class SkillGraphEdge(BaseModel):
    source: str
    target: str
    type: str = "prerequisite"  # "prerequisite", "related", "specialization", "alternative", "builds_on"

class SkillSchema(BaseModel):
    id: str
    name: str
    description: str
    category: str
    difficulty: str = "Beginner"
    level: Optional[str] = "Beginner"
    prerequisites: List[str] = []
    relatedSkills: List[str] = []
    roadmap_nodes: Optional[List[str]] = []
    careerPaths: List[str] = []
    aliases: List[str] = []
    projects: List[SkillProject] = []
    resourceIds: List[str] = []
    inRoadmap: bool = False
    metadata: Optional[Dict[str, Any]] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class SkillPathResponse(BaseModel):
    source: str
    target: str
    reachable: bool
    path: List[str]
    steps: int
    nodes: List[SkillSchema] = []

class SkillGraphResponse(BaseModel):
    nodes: List[SkillSchema]
    edges: List[SkillGraphEdge]
    categories: List[str]

class SkillCreate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    difficulty: str = "Beginner"
    prerequisites: List[str] = []
    relatedSkills: List[str] = []
    careerPaths: List[str] = []
