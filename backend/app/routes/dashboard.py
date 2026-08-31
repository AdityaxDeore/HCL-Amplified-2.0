from fastapi import APIRouter
from app.services.progress_service import ProgressService
from typing import Dict, Any

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any])
async def get_dashboard_summary():
    summary = await ProgressService.get_dashboard_summary()
    return {
        "data": summary,
        # Top-level direct keys for maximum frontend backward compatibility:
        "learner": summary.get("learner"),
        "roadmap": summary.get("roadmap"),
        "progress": summary.get("progress"),
        "nextAction": summary.get("nextAction")
    }
