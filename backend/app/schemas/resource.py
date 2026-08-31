from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from app.schemas.citation import CitationSchema

ResourceType = Literal["video", "course", "article", "documentation", "tutorial", "project", "book"]

class ResourceSchema(BaseModel):
    id: str
    resource_id: Optional[str] = None
    source: str = "youtube"  # "youtube", "coursera", "udemy", "web", "official_docs"
    provider: str = "YouTube"
    type: str = "video"  # "video", "course", "article", "documentation", "tutorial", "project", "book"
    title: str
    description: Optional[str] = None
    url: str = "#"
    thumbnail_url: Optional[str] = None
    thumbnail: Optional[str] = None
    channel_name: Optional[str] = None
    published_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    duration: Optional[str] = None
    duration_category: Optional[str] = "MEDIUM"  # "SHORT", "MEDIUM", "LONG"
    durationHours: Optional[float] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    rating: Optional[float] = 4.8
    review_count: Optional[int] = None
    topics: List[str] = []
    skills: List[str] = []
    skillId: Optional[str] = None
    relatedSkillId: Optional[str] = None
    roadmapNodeId: Optional[str] = None
    relatedNodeId: Optional[str] = None
    difficulty: str = "Beginner"  # "Beginner", "Intermediate", "Advanced"
    language: str = "en"
    quality_score: float = 0.0
    relevance_score: float = 0.0
    personalization_score: float = 0.0
    final_score: float = 0.0
    whyRecommended: Optional[str] = None
    reason: Optional[str] = None
    decision_factors: Optional[Dict[str, float]] = None
    citation: Optional[CitationSchema] = None
    saved: bool = False
    progress: Optional[int] = None
    currentTopic: Optional[str] = None
    nextTopic: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class ResourceCreate(ResourceSchema):
    pass

class ResourceSearchResult(BaseModel):
    query: str
    total_results: int
    resources: List[ResourceSchema] = []
    source_statuses: Optional[Dict[str, str]] = None
