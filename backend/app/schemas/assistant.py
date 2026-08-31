from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from app.schemas.citation import CitationSchema

ActionType = Literal[
    "open_roadmap",
    "open_roadmap_node",
    "open_skill",
    "open_resource",
    "open_progress",
    "open_learning",
    "open_profile"
]

class SuggestedAction(BaseModel):
    type: str  # "open_roadmap", "open_roadmap_node", "open_skill", "open_resource", "open_progress", "open_learning", "open_profile"
    targetId: Optional[str] = None
    label: str

class ChatMessage(BaseModel):
    id: str
    role: str = "user"  # "user", "assistant", "system"
    content: str
    citations: List[CitationSchema] = []
    relatedSkills: List[str] = []
    suggestedActions: List[SuggestedAction] = []
    followUpQuestions: List[str] = []
    createdAt: Optional[str] = None

class ConversationSchema(BaseModel):
    id: str
    learnerId: str = "demo-learner"
    title: str = "New Conversation"
    messages: List[ChatMessage] = []
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class ChatRequest(BaseModel):
    learnerId: str = "demo-learner"
    conversationId: Optional[str] = None
    message: str

class ChatResponseData(BaseModel):
    conversationId: str
    message: ChatMessage

class ChatResponse(BaseModel):
    data: ChatResponseData
