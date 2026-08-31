import logging
from fastapi import APIRouter
from typing import Dict, Any
from app.database.seed import seed_database
from app.database.mongodb import get_database

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/reset", response_model=Dict[str, Any])
async def reset_demo_data():
    """
    Safely resets all demo data back to clean deterministic initial state for judges and presenters.
    Reseeds demo-learner, personalized roadmap, skill graph, and clears mock interview sessions.
    """
    try:
        db = get_database()
        if db is not None:
            # Clear test mock interview sessions
            await db.interview_sessions.delete_many({"learnerId": "demo-learner"})
            logger.info("Cleared test mock interview sessions for demo-learner.")

        # Reseed database
        await seed_database()
        
        return {
            "status": "ok",
            "message": "Demo data successfully reset to initial clean state (AI Engineer, 4-month goal, 10h/week)."
        }
    except Exception as e:
        logger.error(f"Failed to reset demo data: {e}")
        return {
            "status": "error",
            "message": f"Failed to reset demo data: {str(e)}"
        }
