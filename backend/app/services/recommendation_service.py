import logging
from typing import Dict, Any, List, Optional
from app.repositories.learner_repository import LearnerRepository
from app.services.gap_service import GapService
from app.services.skill_graph_engine import SkillGraphEngine
from app.scoring.recommendation_scoring import RecommendationScoring

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Personalized Recommendation Engine Service.
    Transforms skill gaps, learner profile parameters, and graph relationships
    into prioritized, explainable next best learning actions.
    """

    @classmethod
    async def get_recommendations(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Generates top ranked personalized recommendations and next best action.
        """
        # Run gap analysis
        gap_analysis = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
        gaps = gap_analysis.get("gaps", [])
        summary = gap_analysis.get("summary", {})
        effective_role = summary.get("target_role", "AI Engineer")

        learner = await LearnerRepository.get_by_id(learner_id) or {}
        hours_per_week = float(learner.get("hoursPerWeek", 10.0))
        experience_level = learner.get("experienceLevel", "Beginner")

        recommendations: List[Dict[str, Any]] = []

        # Filter for actionable unblocked items
        actionable_items = [g for g in gaps if not g.get("is_blocked") and g.get("gap_type") != "NO_GAP"]

        # If all core items completed, consider practice / project items
        if not actionable_items:
            actionable_items = [g for g in gaps if not g.get("is_blocked")]

        for gap in actionable_items:
            sid = gap["skill_id"]
            title = gap["skill_name"]
            importance = gap.get("importance", "mandatory")
            gap_type = gap.get("gap_type", "FULL_GAP")
            est_hours = float(gap.get("estimated_hours", 15.0))
            category = gap.get("category", "Core AI")

            # Get downstream unlocked skills from SkillGraphEngine
            downstream_skills = []
            try:
                downstream_list = await SkillGraphEngine.get_downstream_skills(sid)
                downstream_skills = [s.get("name", s["id"]) for s in downstream_list]
            except Exception:
                pass

            # Calculate recommendation score (0 to 100)
            rec_score, decision_factors = RecommendationScoring.calculate_recommendation_score(
                importance=importance,
                gap_type=gap_type,
                downstream_count=len(downstream_skills),
                estimated_hours=est_hours,
                hours_per_week=hours_per_week,
                is_blocked=gap.get("is_blocked", False),
                experience_level=experience_level
            )

            # Action type
            action_type = RecommendationScoring.determine_action_type(
                gap_type=gap_type,
                node_type="project" if "project" in title.lower() or "capstone" in title.lower() else "skill"
            )

            # Explainable reason
            reason = RecommendationScoring.generate_recommendation_reason(
                skill_name=title,
                action_type=action_type,
                gap_type=gap_type,
                importance=importance,
                downstream_skills=downstream_skills,
                target_role=effective_role
            )

            # Expected outcome
            expected_outcome = f"Gain practical competency in {title} to fulfill your {effective_role} roadmap milestone."

            rec_item = {
                "id": f"rec-{sid}",
                "type": action_type,
                "skill_id": sid,
                "title": title,
                "category": category,
                "importance": importance,
                "priority": rec_score,
                "estimated_hours": est_hours,
                "reason": reason,
                "prerequisites": gap.get("prerequisites", []),
                "expected_outcome": expected_outcome,
                "confidence": 0.95,
                "decision_factors": decision_factors,
                "order": gap.get("order", 999)
            }
            recommendations.append(rec_item)

        # Sort descending by priority score and ascending by natural order
        recommendations.sort(key=lambda r: (r["priority"], -r["order"]), reverse=True)

        top_recommendations = recommendations[:limit]
        next_best_action = top_recommendations[0] if top_recommendations else None

        return {
            "learner_id": learner_id,
            "target_role": effective_role,
            "total_recommendations": len(top_recommendations),
            "recommendations": top_recommendations,
            "next_best_action": next_best_action
        }

    @classmethod
    async def get_next_best_actions(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = None,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        result = await cls.get_recommendations(learner_id=learner_id, target_role=target_role, limit=limit)
        return result.get("recommendations", [])
