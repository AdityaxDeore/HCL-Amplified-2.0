import logging
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Proficiency Level Weights
PROFICIENCY_LEVELS: Dict[str, float] = {
    "none": 0.0,
    "beginner": 0.25,
    "intermediate": 0.50,
    "advanced": 0.75,
    "expert": 1.00
}

# Importance Weights
IMPORTANCE_WEIGHTS: Dict[str, float] = {
    "mandatory": 1.0,
    "required": 1.0,
    "recommended": 0.6,
    "optional": 0.3
}

# Scoring Coefficients (Sum to 1.0)
COEFF_IMPORTANCE = 0.35
COEFF_DEPENDENCY = 0.25
COEFF_GAP_DEPTH = 0.20
COEFF_GOAL_RELEVANCE = 0.20

class GapScoring:
    """
    Deterministic Skill Gap Scoring Module.
    Evaluates learner proficiency against required levels, identifies gap types,
    and calculates explainable priority scores.
    """

    @staticmethod
    def parse_proficiency(level_str: Optional[str]) -> float:
        if not level_str:
            return 0.0
        return PROFICIENCY_LEVELS.get(level_str.strip().lower(), 0.0)

    @classmethod
    def determine_gap_type(
        cls,
        current_level_str: Optional[str],
        required_level_str: str = "intermediate",
        is_blocked: bool = False,
        importance: str = "mandatory"
    ) -> str:
        curr = cls.parse_proficiency(current_level_str)
        req = cls.parse_proficiency(required_level_str)

        if is_blocked:
            return "BLOCKED_GAP"
        if importance == "optional" and curr < req:
            return "OPTIONAL_GAP"
        if curr >= req:
            return "NO_GAP"
        if curr == 0.0:
            return "FULL_GAP"
        return "PARTIAL_GAP"

    @classmethod
    def calculate_gap_priority(
        cls,
        importance: str,
        downstream_count: int,
        current_level_str: Optional[str],
        required_level_str: str = "intermediate",
        is_in_roadmap: bool = True,
        is_blocked: bool = False
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates priority score (0.00 to 1.00) based on importance, downstream unlock impact,
        gap depth, and goal relevance.
        """
        imp_weight = IMPORTANCE_WEIGHTS.get(importance.lower(), 0.5)
        unlock_weight = min(1.0, downstream_count / 4.0)

        curr = cls.parse_proficiency(current_level_str)
        req = cls.parse_proficiency(required_level_str)
        gap_depth = max(0.0, req - curr) / max(0.25, req)

        relevance = 1.0 if is_in_roadmap else 0.5

        # Weighted calculation
        raw_score = (
            (imp_weight * COEFF_IMPORTANCE) +
            (unlock_weight * COEFF_DEPENDENCY) +
            (gap_depth * COEFF_GAP_DEPTH) +
            (relevance * COEFF_GOAL_RELEVANCE)
        )

        # Blocked penalty to ensure actionable items are prioritized first
        if is_blocked:
            raw_score *= 0.75

        final_score = round(min(1.0, max(0.0, raw_score)), 3)

        factors = {
            "importance": round(imp_weight, 2),
            "dependency_unlock": round(unlock_weight, 2),
            "gap_depth": round(gap_depth, 2),
            "goal_relevance": round(relevance, 2)
        }

        return final_score, factors

    @classmethod
    def generate_gap_reason(
        cls,
        skill_name: str,
        gap_type: str,
        current_level_str: Optional[str],
        required_level_str: str,
        blocking_skills: list,
        target_role: str = "AI Engineer"
    ) -> str:
        """
        Generates deterministic explainable reasoning for a skill gap.
        """
        if gap_type == "NO_GAP":
            return f"Your current proficiency in {skill_name} ({current_level_str}) meets the {required_level_str} requirement for {target_role}."
        if gap_type == "BLOCKED_GAP":
            blockers = ", ".join(blocking_skills) if blocking_skills else "prerequisites"
            return f"{skill_name} is required for {target_role}, but learning is blocked until you complete {blockers}."
        if gap_type == "FULL_GAP":
            return f"{skill_name} is a core {required_level_str}-level requirement for {target_role} and is currently missing from your profile."
        if gap_type == "PARTIAL_GAP":
            return f"{skill_name} requires {required_level_str} proficiency for {target_role}, while your profile currently reflects {current_level_str}."
        if gap_type == "OPTIONAL_GAP":
            return f"{skill_name} is an optional specialized topic for {target_role} and can be studied after core milestones are completed."
        return f"{skill_name} is recommended for your {target_role} learning journey."
