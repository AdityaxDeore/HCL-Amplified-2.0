import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from app.database.mongodb import get_database

logger = logging.getLogger(__name__)

# In-memory feedback cache
_FEEDBACK_STORE: Dict[str, Dict[str, Any]] = {}

class ResourceFeedbackService:
    """
    Service for recording and tracking learner interaction feedback on learning resources.
    Feeds future adaptation and reinforcement loops.
    """

    @classmethod
    async def record_feedback(
        cls,
        learner_id: str = "demo-learner",
        resource_id: Optional[str] = None,
        skill_id: Optional[str] = None,
        feedback: str = "HELPFUL",
        comment: Optional[str] = None
    ) -> Dict[str, Any]:
        feedback_id = f"fb_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        record = {
            "id": feedback_id,
            "feedback_id": feedback_id,
            "learner_id": learner_id,
            "resource_id": resource_id,
            "skill_id": skill_id,
            "feedback": feedback.upper(),
            "comment": comment,
            "recorded_at": now_iso
        }

        # Save to memory cache
        _FEEDBACK_STORE[feedback_id] = record

        # Save to MongoDB if available
        try:
            db = get_database()
            if db is not None:
                await db.resource_feedback.insert_one(record)
        except Exception as e:
            logger.warning(f"Could not persist feedback to MongoDB ({e}), saved in-memory.")

        return {
            "success": True,
            "message": f"Feedback '{feedback.upper()}' recorded for resource {resource_id or 'general'}.",
            "feedback_id": feedback_id,
            "recorded_at": now_iso
        }
