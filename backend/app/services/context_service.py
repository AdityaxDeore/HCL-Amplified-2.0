import logging
import re
from typing import Dict, Any, List, Optional
from app.repositories.learner_repository import LearnerRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.personalized_roadmap_service import PersonalizedRoadmapService
from app.services.gap_service import GapService
from app.services.reality_service import RealityService
from app.services.recommendation_service import RecommendationService
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.skill_graph_engine import SkillGraphEngine

logger = logging.getLogger(__name__)

SKILL_KEYWORDS = [
    "python", "statistics", "machine-learning", "machine learning",
    "numpy", "pandas", "deep-learning", "deep learning",
    "neural networks", "generative-ai", "generative ai", "llm", "transformers",
    "mlops", "docker", "fastapi", "sql", "git", "data science"
]

class ContextService:
    """
    Context Assembly Service for the AI Assistant.
    Extracts relevant learner, roadmap, progress, gap, recommendation, and RAG data.
    """

    @classmethod
    async def gather_context(cls, learner_id: str = "demo-learner", user_message: str = "") -> Dict[str, Any]:
        msg_lower = (user_message or "").lower()

        # 1. Learner Profile
        learner = None
        try:
            learner = await LearnerRepository.get_by_id(learner_id)
        except Exception:
            pass

        if not learner:
            learner = {
                "id": learner_id,
                "name": "Alex Morgan",
                "targetRole": "AI Engineer",
                "goal": "Master AI Engineering",
                "experienceLevel": "Intermediate",
                "hoursPerWeek": 10.0,
                "targetMonths": 4,
                "learningPreference": "video",
                "skills": [
                    {"name": "Python", "level": "Intermediate"},
                    {"name": "SQL", "level": "Intermediate"},
                    {"name": "Git", "level": "Intermediate"},
                    {"name": "NumPy", "level": "Beginner"}
                ]
            }

        target_role = learner.get("targetRole", "AI Engineer")
        hours_per_week = float(learner.get("hoursPerWeek", 10.0))
        target_months = int(learner.get("targetMonths", 4))

        # 2. Roadmap
        try:
            roadmap = await PersonalizedRoadmapService.get_personalized_roadmap(learner_id=learner_id, target_role=target_role)
        except Exception as e:
            logger.warning(f"Could not load personalized roadmap ({e})")
            roadmap = {"nodes": []}

        # 3. Progress
        try:
            progress = await ProgressRepository.get_by_learner_id(learner_id) or {
                "overallProgress": 32,
                "learningHours": 24,
                "currentStreak": 5,
                "currentFocus": "Statistics Fundamentals"
            }
        except Exception:
            progress = {"overallProgress": 32, "learningHours": 24, "currentStreak": 5, "currentFocus": "Statistics Fundamentals"}

        # 4. Gaps
        try:
            gaps = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
        except Exception:
            gaps = {"summary": {}, "actionable_gaps": [], "blocked_gaps": []}

        # 5. Reality Check
        try:
            reality = await RealityService.evaluate_reality(
                learner_id=learner_id,
                target_role=target_role,
                target_months=target_months,
                hours_per_week=hours_per_week
            )
        except Exception:
            reality = {"status": "REALISTIC", "workload_ratio": 1.13, "available_hours": 160, "required_hours": 180}

        # 6. Readiness Evaluation
        try:
            from app.services.readiness_service import ReadinessService
            readiness = await ReadinessService.evaluate_readiness(learner_id=learner_id)
        except Exception:
            readiness = {"score": 68.0, "status": "NEAR_READY", "interviewReady": False, "criticalGaps": []}

        # 7. Recommendations
        try:
            recommendations = await RecommendationService.get_next_best_actions(learner_id=learner_id, limit=3)
        except Exception:
            recommendations = []

        # 8. Identify target skill from message or top recommendation
        target_skill = "statistics"
        for kw in SKILL_KEYWORDS:
            if kw in msg_lower:
                target_skill = SkillGraphEngine.normalize_skill_id(kw)
                break
        else:
            if recommendations:
                target_skill = recommendations[0].get("skill_id", "statistics")

        # 9. Retrieve Grounded RAG & YouTube Resources
        try:
            resources = await ResourceDiscoveryService.discover_resources_for_skill(
                skill_id=target_skill,
                difficulty=learner.get("experienceLevel", "Beginner"),
                learner_level=learner.get("experienceLevel", "Beginner"),
                learner_preference=learner.get("learningPreference", "video"),
                hours_per_week=hours_per_week,
                limit=5
            )
        except Exception as e:
            logger.warning(f"Resource discovery failed ({e})")
        # 10. Latest Interview Performance
        try:
            from app.services.interview_service import InterviewService
            interview_history = await InterviewService.get_interview_history(learner_id)
            latest_interview = interview_history[0].get("finalReport") if interview_history else None
        except Exception:
            latest_interview = None

        return {
            "learner": learner,
            "roadmap": roadmap,
            "progress": progress,
            "gaps": gaps,
            "reality": reality,
            "readiness": readiness,
            "recommendations": recommendations,
            "resources": resources,
            "target_skill": target_skill,
            "latest_interview": latest_interview
        }
