import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Action Types
ACTION_LEARN = "LEARN_SKILL"
ACTION_REVIEW = "REVIEW_SKILL"
ACTION_PRACTICE = "PRACTICE_SKILL"
ACTION_BUILD_PROJECT = "BUILD_PROJECT"
ACTION_ASSESS = "ASSESS_SKILL"

# Recommendation Score Weights (Sum to 100)
WEIGHT_GOAL_RELEVANCE = 30.0
WEIGHT_SKILL_GAP = 25.0
WEIGHT_DEPENDENCY_UNLOCK = 20.0
WEIGHT_LEARNER_FIT = 15.0
WEIGHT_TIME_FIT = 10.0

class RecommendationScoring:
    """
    Deterministic Recommendation Scoring Module.
    Combines goal relevance, gap depth, dependency unlock potential,
    learner fit, and time constraints into a 0-100 score with explainable justifications.
    """

    @classmethod
    def calculate_recommendation_score(
        cls,
        importance: str,
        gap_type: str,
        downstream_count: int,
        estimated_hours: float,
        hours_per_week: float,
        is_blocked: bool = False,
        experience_level: str = "Beginner"
    ) -> Tuple[int, Dict[str, float]]:
        """
        Calculates 0-100 recommendation priority score and decision factors.
        """
        if is_blocked:
            return 0, {"blocked": 0.0}

        # 1. Goal Relevance (0.0 to 1.0)
        relevance_map = {"mandatory": 1.0, "required": 1.0, "recommended": 0.7, "optional": 0.4}
        goal_rel = relevance_map.get(importance.lower(), 0.5)

        # 2. Skill Gap Severity (0.0 to 1.0)
        gap_map = {"FULL_GAP": 1.0, "PARTIAL_GAP": 0.8, "OPTIONAL_GAP": 0.5, "NO_GAP": 0.1}
        gap_val = gap_map.get(gap_type, 0.5)

        # 3. Dependency Unlock Potential (0.0 to 1.0)
        unlock_val = min(1.0, downstream_count / 3.0)

        # 4. Learner Fit (0.0 to 1.0)
        learner_fit = 0.9 if experience_level.lower() in ("beginner", "intermediate") else 0.85

        # 5. Time Fit (0.0 to 1.0)
        weekly_ratio = estimated_hours / max(1.0, hours_per_week)
        if weekly_ratio <= 2.0:
            time_fit = 1.0
        elif weekly_ratio <= 4.0:
            time_fit = 0.8
        else:
            time_fit = 0.6

        # Composite Score (0 to 100)
        raw_score = (
            (goal_rel * WEIGHT_GOAL_RELEVANCE) +
            (gap_val * WEIGHT_SKILL_GAP) +
            (unlock_val * WEIGHT_DEPENDENCY_UNLOCK) +
            (learner_fit * WEIGHT_LEARNER_FIT) +
            (time_fit * WEIGHT_TIME_FIT)
        )

        final_score = int(round(min(100.0, max(0.0, raw_score))))

        decision_factors = {
            "goal_relevance": round(goal_rel, 2),
            "skill_gap": round(gap_val, 2),
            "dependency_unlock": round(unlock_val, 2),
            "learner_fit": round(learner_fit, 2),
            "time_fit": round(time_fit, 2)
        }

        return final_score, decision_factors

    @classmethod
    def determine_action_type(cls, gap_type: str, node_type: str = "skill") -> str:
        if node_type == "project":
            return ACTION_BUILD_PROJECT
        if gap_type == "PARTIAL_GAP":
            return ACTION_REVIEW
        if gap_type == "NO_GAP":
            return ACTION_PRACTICE
        return ACTION_LEARN

    @classmethod
    def generate_recommendation_reason(
        cls,
        skill_name: str,
        action_type: str,
        gap_type: str,
        importance: str,
        downstream_skills: List[str],
        target_role: str = "AI Engineer"
    ) -> str:
        """
        Generates deterministic, clear explainable justifications for recommendations.
        """
        if action_type == ACTION_REVIEW:
            return f"Review and reinforce {skill_name} to elevate your proficiency from beginner to intermediate for {target_role}."
        
        if downstream_skills:
            downstream_sample = ", ".join(downstream_skills[:2])
            return f"Master {skill_name} first because it is a foundational prerequisite that directly unlocks {downstream_sample} in your {target_role} path."
        
        if importance in ("mandatory", "required"):
            return f"Learn {skill_name} next as it is a core mandatory competency for the {target_role} roadmap."

        return f"Study {skill_name} to strengthen your practical knowledge in {target_role} workflows."
