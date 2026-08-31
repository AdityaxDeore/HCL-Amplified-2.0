import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.database.mongodb import get_database
from app.services.context_service import ContextService
from app.services.gemini_service import GeminiService
from app.utils.prompt_builder import PromptBuilder
from app.utils.errors import ValidationError, ResourceNotFoundError

logger = logging.getLogger(__name__)

# In-Memory Cache for Conversations
_CONVERSATION_STORE: Dict[str, Dict[str, Any]] = {}

WHITELISTED_ACTION_TYPES = {
    "open_roadmap",
    "open_roadmap_node",
    "open_skill",
    "open_resource",
    "open_progress",
    "open_learning",
    "open_profile"
}

class AssistantService:
    """
    Core Assistant Orchestrator.
    Manages conversations, context bundle construction, Gemini inference,
    citation resolution, and persistence.
    """

    @classmethod
    async def handle_chat(
        cls,
        learner_id: str = "demo-learner",
        conversation_id: Optional[str] = None,
        message: str = ""
    ) -> Dict[str, Any]:
        clean_msg = (message or "").strip()
        if not clean_msg:
            raise ValidationError("Message content cannot be empty.")

        now_iso = datetime.utcnow().isoformat()
        conv_id = conversation_id or f"conv_{uuid.uuid4().hex[:10]}"

        # 1. Load or initialize conversation
        conv = await cls._load_conversation(conv_id, learner_id)
        if not conv:
            # Generate title from first 6 words of message
            words = clean_msg.split()
            title = " ".join(words[:6]).title()
            if len(words) > 6:
                title += "..."
            conv = {
                "id": conv_id,
                "learnerId": learner_id,
                "title": title,
                "messages": [],
                "createdAt": now_iso,
                "updatedAt": now_iso
            }

        # 2. Add user message
        user_msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        user_msg = {
            "id": user_msg_id,
            "role": "user",
            "content": clean_msg,
            "citations": [],
            "relatedSkills": [],
            "suggestedActions": [],
            "followUpQuestions": [],
            "createdAt": now_iso
        }
        conv["messages"].append(user_msg)

        # 3. Gather Context
        context_data = await ContextService.gather_context(learner_id=learner_id, user_message=clean_msg)

        # 4. Build Prompt
        system_instruction = PromptBuilder.build_system_prompt()
        context_bundle = PromptBuilder.build_context_bundle(context_data)
        user_prompt = PromptBuilder.build_user_prompt(
            conversation_history=conv["messages"][:-1],
            current_message=clean_msg,
            context_bundle=context_bundle
        )

        # 5. Invoke Gemini (or grounded fallback)
        gemini_result = await GeminiService.generate_response(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            fallback_context=context_data
        )

        # 6. Map and Attach Real Citations
        retrieved_resources = context_data.get("resources", [])
        res_map = {str(r.get("resource_id") or r.get("id")): r for r in retrieved_resources}
        for r in retrieved_resources:
            # Also index by base video/doc id
            rid = str(r.get("resource_id") or r.get("id"))
            if ":" in rid:
                res_map[rid.split(":", 1)[1]] = r

        resolved_citations = []
        source_ids = gemini_result.get("source_ids", [])
        for sid in source_ids:
            sid_str = str(sid)
            if sid_str in res_map:
                matched_res = res_map[sid_str]
                citation_obj = matched_res.get("citation") or {
                    "resource_id": matched_res.get("id"),
                    "source": matched_res.get("provider", "Web"),
                    "title": matched_res.get("title"),
                    "url": matched_res.get("url", "#"),
                    "channel_name": matched_res.get("channel_name"),
                    "published_at": matched_res.get("published_at"),
                    "type": matched_res.get("type", "video"),
                    "license": "Public"
                }
                resolved_citations.append(citation_obj)

        # If no specific citations resolved but resources were used, attach top 1-2 resources
        if not resolved_citations and retrieved_resources and any(w in clean_msg.lower() for w in ["video", "resource", "course", "tutorial", "learn"]):
            for r in retrieved_resources[:2]:
                if r.get("citation"):
                    resolved_citations.append(r.get("citation"))

        # 7. Validate Suggested Actions
        validated_actions = []
        raw_actions = gemini_result.get("suggested_actions", [])
        for act in raw_actions:
            if isinstance(act, dict):
                act_type = act.get("type", "open_roadmap")
                if act_type in WHITELISTED_ACTION_TYPES:
                    validated_actions.append({
                        "type": act_type,
                        "targetId": act.get("targetId"),
                        "label": act.get("label", "View Details")
                    })

        # 8. Create Assistant Message
        assistant_msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        assistant_msg = {
            "id": assistant_msg_id,
            "role": "assistant",
            "content": gemini_result.get("answer", "Here is guidance on your learning path."),
            "citations": resolved_citations,
            "relatedSkills": gemini_result.get("related_skills", []),
            "suggestedActions": validated_actions,
            "followUpQuestions": gemini_result.get("follow_up_questions", []),
            "createdAt": datetime.utcnow().isoformat()
        }

        # 9. Append to conversation and Persist
        conv["messages"].append(assistant_msg)
        conv["updatedAt"] = datetime.utcnow().isoformat()
        await cls._save_conversation(conv)

        return {
            "conversationId": conv_id,
            "message": assistant_msg
        }

    @classmethod
    async def get_conversations(cls, learner_id: str = "demo-learner") -> List[Dict[str, Any]]:
        # Check MongoDB
        try:
            db = get_database()
            if db is not None:
                cursor = db.conversations.find({"learnerId": learner_id}).sort("updatedAt", -1)
                convs = await cursor.to_list(length=50)
                if convs:
                    for c in convs:
                        c["_id"] = str(c.get("_id"))
                    return convs
        except Exception:
            pass

        # Fallback in-memory
        mem_convs = [c for c in _CONVERSATION_STORE.values() if c.get("learnerId") == learner_id]
        mem_convs.sort(key=lambda x: x.get("updatedAt", ""), reverse=True)
        return mem_convs

    @classmethod
    async def get_conversation_by_id(cls, conversation_id: str) -> Dict[str, Any]:
        conv = await cls._load_conversation(conversation_id)
        if not conv:
            raise ResourceNotFoundError(f"Conversation '{conversation_id}' not found.")
        return conv

    @classmethod
    async def delete_conversation(cls, conversation_id: str) -> bool:
        if conversation_id in _CONVERSATION_STORE:
            del _CONVERSATION_STORE[conversation_id]

        try:
            db = get_database()
            if db is not None:
                await db.conversations.delete_one({"id": conversation_id})
        except Exception:
            pass
        return True

    @classmethod
    async def _load_conversation(cls, conversation_id: str, learner_id: str = "demo-learner") -> Optional[Dict[str, Any]]:
        if conversation_id in _CONVERSATION_STORE:
            return _CONVERSATION_STORE[conversation_id]

        try:
            db = get_database()
            if db is not None:
                doc = await db.conversations.find_one({"id": conversation_id})
                if doc:
                    doc["_id"] = str(doc.get("_id"))
                    _CONVERSATION_STORE[conversation_id] = doc
                    return doc
        except Exception:
            pass
        return None

    @classmethod
    async def _save_conversation(cls, conv: Dict[str, Any]):
        cid = conv["id"]
        _CONVERSATION_STORE[cid] = conv

        try:
            db = get_database()
            if db is not None:
                await db.conversations.update_one(
                    {"id": cid},
                    {"$set": conv},
                    upsert=True
                )
        except Exception as e:
            logger.warning(f"Could not persist conversation to MongoDB ({e}). Preserved in-memory.")
