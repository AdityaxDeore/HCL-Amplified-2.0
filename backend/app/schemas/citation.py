from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CitationSchema(BaseModel):
    resource_id: str
    source: str = "YouTube"  # "YouTube", "Official Documentation", "Coursera", "Udemy", "Web"
    title: str
    url: str
    channel_name: Optional[str] = None
    author: Optional[str] = None
    published_at: Optional[str] = None
    retrieved_at: Optional[str] = None
    type: str = "video"  # "video", "course", "article", "documentation", "tutorial", "project"
    license: Optional[str] = "Public"
