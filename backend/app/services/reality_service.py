import logging
import math
from typing import Dict, Any, List, Optional
from app.repositories.learner_repository import LearnerRepository
from app.services.gap_service import GapService
from app.scoring.reality_scoring import RealityScoring
from app.utils.errors import ValidationError

logger = logging.getLogger(__name__)

class RealityService:
    """
    Reality Checker Service.
    Determines feasibility of learning goals against available time and workload.
    Generates required weekly commitment, minimum timeline, and adjustment alternatives.
    """

    @classmethod
    async def evaluate_reality(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = None,
        deadline: Optional[str] = None,
        target_months: Optional[int] = None,
        hours_per_week: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Performs comprehensive reality check for a learner goal.
        """
        learner = await LearnerRepository.get_by_id(learner_id) or {}
        
        effective_role = target_role or learner.get("targetRole", "AI Engineer")
        effective_months = target_months if target_months is not None else int(learner.get("targetMonths", 4))
        effective_hours_week = hours_per_week if hours_per_week is not None else float(learner.get("hoursPerWeek", 10.0))

        # Input Validation
        if effective_hours_week <= 0:
            raise ValidationError("INVALID_WEEKLY_HOURS: Hours per week must be greater than 0.")
        if effective_months <= 0:
            raise ValidationError("DEADLINE_INVALID: Target timeline months must be greater than 0.")

        # Run gap analysis to determine true required learning workload
        gap_analysis = await GapService.analyze_gaps(learner_id=learner_id, target_role=effective_role)
        summary = gap_analysis.get("summary", {})
        gaps = gap_analysis.get("gaps", [])

        required_hours = float(summary.get("total_estimated_gap_hours", 180.0))
        weeks_remaining = RealityScoring.calculate_weeks_remaining(deadline_str=deadline, target_months=effective_months)
        available_hours = round(weeks_remaining * effective_hours_week, 1)

        # Evaluate feasibility
        status, workload_ratio = RealityScoring.evaluate_feasibility(
            required_hours=required_hours,
            available_hours=available_hours
        )

        min_weekly = round(required_hours / max(1.0, weeks_remaining), 1)
        min_weeks = round(required_hours / max(1.0, effective_hours_week), 1)

        # Identify prunable optional topics
        optional_topics = [
            {
                "id": g["skill_id"],
                "title": g["skill_name"],
                "category": g.get("category", "Specialized"),
                "estimated_hours": g.get("estimated_hours", 15.0),
                "importance": "optional",
                "reason": "Specialized extension topic that can be postponed to accelerate core career milestone."
            }
            for g in gaps
            if g.get("importance") == "optional" and g.get("gap_type") != "NO_GAP"
        ]

        # Calculate adjustments
        adjustments = RealityScoring.calculate_adjustments(
            required_hours=required_hours,
            available_hours=available_hours,
            weeks_remaining=weeks_remaining,
            hours_per_week=effective_hours_week,
            optional_topics=optional_topics
        )

        # Generate transparent explanation
        explanation = RealityScoring.generate_reality_explanation(
            status=status,
            required_hours=required_hours,
            available_hours=available_hours,
            weeks_remaining=weeks_remaining,
            hours_per_week=effective_hours_week,
            target_role=effective_role
        )

        return {
            "learner_id": learner_id,
            "target_role": effective_role,
            "target_months": effective_months,
            "weeks_remaining": weeks_remaining,
            "hours_per_week": effective_hours_week,
            "available_hours": available_hours,
            "required_hours": required_hours,
            "workload_ratio": workload_ratio,
            "status": status,
            "minimum_weekly_hours": min_weekly,
            "minimum_required_weeks": min_weeks,
            "explanation": explanation,
            "adjustments": adjustments,
            "prunable_topics": optional_topics
        }
