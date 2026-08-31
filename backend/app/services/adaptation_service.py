import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.database.mongodb import get_database

logger = logging.getLogger(__name__)

# In-Memory Fallback Store for Feedback
_FEEDBACK_STORE: List[Dict[str, Any]] = []

class AdaptationService:
    """
    Adaptive Learning Service.
    Consumes learner progress, feedback, and skill states to dynamically
    adjust learning prioritization without silently altering the roadmap.
    """

    @classmethod
    async def record_feedback(
        cls,
        learner_id: str,
        feedback_type: str,
        value: str,
        target_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        feedback_id = f"fb_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        feedback_doc = {
            "id": feedback_id,
            "learnerId": learner_id,
            "type": feedback_type,
            "value": value,
            "targetId": target_id,
            "metadata": metadata or {},
            "createdAt": now_iso
        }

        # 1. Persist to in-memory store
        _FEEDBACK_STORE.append(feedback_doc)

        # 2. Persist to MongoDB
        try:
            db = get_database()
            if db is not None:
                await db.learner_feedback.insert_one(feedback_doc)
        except Exception as e:
            logger.warning(f"Could not persist feedback to MongoDB ({e}). Saved in-memory.")

        # 3. Determine Adaptation Summary (Explainable feedback response)
        adaptation_summary = cls._generate_adaptation_summary(feedback_type, value, target_id)

        return {
            "success": True,
            "message": "Feedback recorded successfully",
            "feedbackId": feedback_id,
            "adaptationSummary": adaptation_summary,
            "createdAt": now_iso
        }

    @classmethod
    async def get_feedback_for_learner(cls, learner_id: str) -> List[Dict[str, Any]]:
        # From MongoDB
        try:
            db = get_database()
            if db is not None:
                cursor = db.learner_feedback.find({"learnerId": learner_id}).sort("createdAt", -1)
                docs = await cursor.to_list(length=100)
                if docs:
                    for d in docs:
                        d["_id"] = str(d.get("_id"))
                    return docs
        except Exception:
            pass

        # In-memory fallback
        return [f for f in _FEEDBACK_STORE if f.get("learnerId") == learner_id]

    @classmethod
    def _generate_adaptation_summary(cls, feedback_type: str, value: str, target_id: Optional[str]) -> str:
        target_label = f" for '{target_id}'" if target_id else ""
        
        if feedback_type == "difficulty":
            if value in ["too_difficult", "too_hard", "struggling"]:
                return f"Adjusted pacing{target_label}: Elevated prerequisite materials and beginner-friendly walkthroughs."
            elif value in ["too_easy", "already_know", "trivial"]:
                return f"Adjusted pacing{target_label}: Reduced beginner material priority and elevated advanced exercises."
            else:
                return f"Pacing confirmed appropriate{target_label}."
        
        elif feedback_type == "content_preference":
            return f"Preferences updated: Learning recommendations will prioritize {value.replace('_', ' ')} formats."

        elif feedback_type == "time_constraint":
            if "less" in value:
                return "Time constraint noted: Prioritizing concise, high-impact core milestones."
            else:
                return "Expanded study time noted: Surfacing comprehensive deep-dive resources."

        elif feedback_type in ["relevance", "skip_reason"]:
            return f"Relevance feedback recorded{target_label}. Adjusted topic recommendations."

        return f"Feedback recorded successfully{target_label}."
