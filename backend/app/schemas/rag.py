from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.citation import CitationSchema

class RAGResourceItem(BaseModel):
    resource_id: str
    title: str
    content: str
    description: Optional[str] = None
    source: str = "YouTube"
    url: str
    relevance_score: float = 0.0
    topics: List[str] = []
    skills: List[str] = []
    citation: CitationSchema

class RAGContextResponse(BaseModel):
    query: str
    skill_id: str
    skill_name: str
    resources_count: int = 0
    resources: List[RAGResourceItem] = []
    context_text: str = ""
    citations: List[CitationSchema] = []
