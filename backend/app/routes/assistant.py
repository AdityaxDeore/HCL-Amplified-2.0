from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from app.services.assistant_service import AssistantService
from app.schemas.assistant import ChatRequest, ChatResponse, ChatResponseData, ConversationSchema
from app.schemas.common import DataResponse, ListResponse

router = APIRouter()

@router.post("/chat", response_model=DataResponse[ChatResponseData])
async def chat_with_assistant(req: ChatRequest):
    """
    Sends a message to the Gemini AI Assistant with full roadmap, skill gap,
    and RAG context grounding.
    """
    result = await AssistantService.handle_chat(
        learner_id=req.learnerId,
        conversation_id=req.conversationId,
        message=req.message
    )
    return DataResponse(data=result)

@router.get("/conversations", response_model=ListResponse[ConversationSchema])
async def list_conversations(
    learner_id: str = Query("demo-learner", description="Learner ID")
):
    """Lists saved conversation histories for a learner."""
    convs = await AssistantService.get_conversations(learner_id=learner_id)
    return ListResponse(data=convs, count=len(convs))

@router.get("/conversations/{conversation_id}", response_model=DataResponse[ConversationSchema])
async def get_conversation(
    conversation_id: str = Path(..., description="Conversation ID")
):
    """Retrieves conversation history by conversation ID."""
    conv = await AssistantService.get_conversation_by_id(conversation_id)
    return DataResponse(data=conv)

@router.delete("/conversations/{conversation_id}", response_model=DataResponse[Dict[str, bool]])
async def delete_conversation(
    conversation_id: str = Path(..., description="Conversation ID")
):
    """Deletes a conversation history."""
    await AssistantService.delete_conversation(conversation_id)
    return DataResponse(data={"success": True})
