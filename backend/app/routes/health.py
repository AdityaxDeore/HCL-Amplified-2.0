from fastapi import APIRouter
from app.database.mongodb import get_database
from typing import Dict, Any

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any])
async def check_health():
    db = get_database()
    db_status = "disconnected"
    if db is not None:
        try:
            await db.command("ping")
            db_status = "connected"
        except Exception:
            db_status = "error"

    return {
        "status": "ok",
        "database": db_status
    }
