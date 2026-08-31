import logging
import math
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Feasibility Thresholds (Configurable)
STATUS_COMFORTABLE = "COMFORTABLE"
STATUS_REALISTIC = "REALISTIC"
STATUS_TIGHT = "TIGHT"
STATUS_AT_RISK = "AT_RISK"
STATUS_UNREALISTIC = "UNREALISTIC"

class RealityScoring:
    """
    Deterministic Reality Checker Scoring Module.
    Calculates workload ratio, feasibility status, required weekly hours,
    minimum timeline, and concrete adjustment options.
    """

    @staticmethod
    def calculate_weeks_remaining(
        deadline_str: Optional[str] = None,
        target_months: Optional[int] = 4
    ) -> float:
        """
        Computes remaining weeks from deadline string or target months.
        Defaults to 4 months = 16.0 weeks.
        """
        if target_months and target_months > 0:
            return round(target_months * 4.33, 1)
        return 16.0

    @classmethod
    def evaluate_feasibility(
        cls,
        required_hours: float,
        available_hours: float
    ) -> Tuple[str, float]:
        """
        Computes workload ratio (required / available) and status.
        """
        if required_hours <= 0:
            return STATUS_COMFORTABLE, 0.0
        if available_hours <= 0:
            return STATUS_UNREALISTIC, 99.9

        ratio = round(required_hours / available_hours, 2)

        if ratio < 0.70:
            status = STATUS_COMFORTABLE
        elif ratio <= 0.90:
            status = STATUS_REALISTIC
        elif ratio <= 1.00:
            status = STATUS_TIGHT
        elif ratio <= 1.20:
            status = STATUS_AT_RISK
        else:
            status = STATUS_UNREALISTIC

        return status, ratio

    @classmethod
    def calculate_adjustments(
        cls,
        required_hours: float,
        available_hours: float,
        weeks_remaining: float,
        hours_per_week: float,
        optional_topics: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates deterministic, actionable adjustments when workload is tight or at risk.
        """
        adjustments = []
        if weeks_remaining <= 0 or hours_per_week <= 0:
            return adjustments

        min_weekly = round(required_hours / weeks_remaining, 1)
        min_weeks = round(required_hours / hours_per_week, 1)

        # 1. Option A: Increase weekly study hours
        if min_weekly > hours_per_week:
            rec_hours = math.ceil(min_weekly)
            adjustments.append({
                "type": "increase_hours",
                "title": "Increase Weekly Study Time",
                "current": hours_per_week,
                "recommended": rec_hours,
                "difference": round(rec_hours - hours_per_week, 1),
                "description": f"Increase study pace to approximately {rec_hours} hrs/week (up from {hours_per_week} hrs/week) to meet your target deadline."
            })

        # 2. Option B: Extend deadline
        if min_weeks > weeks_remaining:
            rec_weeks = math.ceil(min_weeks)
            rec_months = round(rec_weeks / 4.33, 1)
            adjustments.append({
                "type": "extend_deadline",
                "title": "Extend Target Deadline",
                "current_weeks": weeks_remaining,
                "recommended_weeks": rec_weeks,
                "recommended_months": rec_months,
                "description": f"Extend target completion timeline to {rec_weeks} weeks (~{rec_months} months) while maintaining a comfortable {hours_per_week} hrs/week pace."
            })

        # 3. Option C: Prune optional topics
        if optional_topics:
            prunable_hours = sum(t.get("estimatedHours", 15) for t in optional_topics)
            if prunable_hours > 0:
                adjusted_required = max(0.0, required_hours - prunable_hours)
                adjusted_weekly = math.ceil(adjusted_required / weeks_remaining)
                adjustments.append({
                    "type": "prune_optional",
                    "title": "Prune Optional Topics",
                    "estimated_hours_saved": prunable_hours,
                    "topics_count": len(optional_topics),
                    "adjusted_weekly_hours": adjusted_weekly,
                    "description": f"Postpone {len(optional_topics)} optional topics to save ~{prunable_hours} hours, reducing required study load to {adjusted_weekly} hrs/week."
                })

        return adjustments

    @classmethod
    def generate_reality_explanation(
        cls,
        status: str,
        required_hours: float,
        available_hours: float,
        weeks_remaining: float,
        hours_per_week: float,
        target_role: str = "AI Engineer"
    ) -> str:
        """
        Generates transparent, explainable natural text summary based on calculated metrics.
        """
        weeks_int = int(round(weeks_remaining))
        req_int = int(round(required_hours))
        avail_int = int(round(available_hours))

        if status == STATUS_COMFORTABLE:
            return f"You have approximately {avail_int} learning hours available over the next {weeks_int} weeks at {hours_per_week} hrs/week. Your estimated remaining workload is {req_int} hours. Your target pace is comfortable with ample room for deep practice."
        
        if status == STATUS_REALISTIC:
            return f"You have {avail_int} learning hours available over {weeks_int} weeks ({hours_per_week} hrs/week). Your estimated remaining workload is {req_int} hours. Your timeline for {target_role} is realistic and on track."
        
        if status == STATUS_TIGHT:
            return f"You have {avail_int} available learning hours for an estimated workload of {req_int} hours over {weeks_int} weeks. Your schedule is tight; maintaining consistent weekly commitment will be critical."
        
        if status == STATUS_AT_RISK:
            min_weekly = math.ceil(required_hours / weeks_remaining)
            return f"You have {avail_int} learning hours available over {weeks_int} weeks at {hours_per_week} hrs/week, but your current skill gaps require approximately {req_int} hours. Your target is at risk unless you increase weekly study to ~{min_weekly} hrs/week, extend your deadline, or prune optional topics."
        
        # UNREALISTIC
        min_weekly = math.ceil(required_hours / weeks_remaining)
        return f"Your estimated learning workload of {req_int} hours significantly exceeds your available {avail_int} hours ({hours_per_week} hrs/week over {weeks_int} weeks). To succeed, we recommend extending your deadline or focusing strictly on core mandatory prerequisites."
