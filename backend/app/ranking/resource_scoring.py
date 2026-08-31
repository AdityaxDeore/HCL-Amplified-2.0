import logging
import math
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

# Configurable Scoring Weights (Sum to 1.0)
WEIGHT_RELEVANCE = 0.35
WEIGHT_QUALITY = 0.25
WEIGHT_DIFFICULTY = 0.15
WEIGHT_PERSONALIZATION = 0.10
WEIGHT_RECENCY = 0.10
WEIGHT_ENGAGEMENT = 0.05

# Recognized Educational Authorities
AUTHORITATIVE_CHANNELS = {
    "statquest with josh starmer": 1.0,
    "statquest": 1.0,
    "3blue1brown": 1.0,
    "freecodecamp.org": 1.0,
    "freecodecamp": 1.0,
    "andrej karpathy": 1.0,
    "deeplearning.ai": 1.0,
    "deeplearningai": 1.0,
    "mit opencourseware": 1.0,
    "stanford online": 1.0,
    "traversy media": 0.95,
    "corey schafer": 0.95,
    "sentdex": 0.90,
    "krish naik": 0.90,
    "alex the analyst": 0.90,
    "official documentation": 1.0
}

class ResourceScoring:
    """
    Deterministic Resource Ranking & Scoring Module.
    Combines skill relevance, quality signals, difficulty alignment,
    learner preferences, and recency into an explainable 0-100 score.
    """

    @classmethod
    def calculate_relevance_score(
        cls,
        resource_title: str,
        resource_desc: Optional[str],
        resource_topics: List[str],
        target_skill_id: str,
        target_skill_name: str
    ) -> float:
        title_lower = (resource_title or "").lower()
        desc_lower = (resource_desc or "").lower()
        skill_clean = target_skill_name.lower().replace("-", " ")
        skill_id_clean = target_skill_id.lower().replace("-", " ")

        score = 40.0

        # Exact title match
        if skill_clean in title_lower or skill_id_clean in title_lower:
            score += 45.0
        elif any(tok in title_lower for tok in skill_clean.split() if len(tok) > 3):
            score += 25.0

        # Topic list match
        if any(skill_clean in str(t).lower() or skill_id_clean in str(t).lower() for t in resource_topics):
            score += 15.0

        # Description match
        if skill_clean in desc_lower or skill_id_clean in desc_lower:
            score += 10.0

        return min(100.0, max(0.0, score))

    @classmethod
    def calculate_quality_score(
        cls,
        views: Optional[int],
        likes: Optional[int],
        channel_name: Optional[str],
        duration_seconds: Optional[int]
    ) -> Tuple[float, float]:
        channel_lower = (channel_name or "").strip().lower()
        auth_boost = AUTHORITATIVE_CHANNELS.get(channel_lower, 0.75) * 30.0

        # Log scaled views
        v = views or 1000
        view_score = min(40.0, math.log10(max(10, v)) * 8.0)

        # Likes engagement
        l = likes or 50
        engagement_ratio = l / max(1, v)
        eng_score = 15.0 if engagement_ratio >= 0.03 else 10.0 if engagement_ratio >= 0.015 else 5.0

        # Duration suitability (15m to 2h is ideal for comprehensive learning)
        dur = duration_seconds or 1800
        if 900 <= dur <= 7200:
            dur_score = 15.0
        elif 300 <= dur < 900:
            dur_score = 10.0
        else:
            dur_score = 8.0

        quality_total = min(100.0, max(10.0, auth_boost + view_score + eng_score + dur_score))
        engagement_total = min(100.0, eng_score * 6.66)
        return quality_total, engagement_total

    @classmethod
    def calculate_difficulty_match(
        cls,
        resource_difficulty: str,
        learner_level: str
    ) -> float:
        r_diff = (resource_difficulty or "Beginner").strip().lower()
        l_lvl = (learner_level or "Beginner").strip().lower()

        if r_diff == l_lvl:
            return 100.0
        
        # Beginner learner with Intermediate resource (good for progression)
        if l_lvl == "beginner" and r_diff == "intermediate":
            return 75.0
        if l_lvl == "intermediate" and r_diff in ("beginner", "advanced"):
            return 80.0
        if l_lvl == "advanced" and r_diff == "intermediate":
            return 70.0
        
        return 45.0

    @classmethod
    def calculate_personalization_score(
        cls,
        resource_type: str,
        learner_preference: Optional[str] = "video",
        available_hours_per_week: float = 10.0,
        duration_seconds: Optional[int] = 1800
    ) -> float:
        score = 70.0
        pref = (learner_preference or "video").lower()
        r_type = (resource_type or "video").lower()

        if pref in r_type or r_type in pref:
            score += 20.0

        # Time fit
        dur_hours = (duration_seconds or 1800) / 3600.0
        if dur_hours <= available_hours_per_week * 0.5:
            score += 10.0

        return min(100.0, score)

    @classmethod
    def calculate_recency_score(
        cls,
        published_at_str: Optional[str]
    ) -> float:
        if not published_at_str:
            return 80.0
        try:
            year_match = re.search(r'\b(20\d\d)\b', str(published_at_str))
            if year_match:
                pub_year = int(year_match.group(1))
                current_year = 2026
                diff = current_year - pub_year
                if diff <= 1:
                    return 98.0
                if diff <= 2:
                    return 92.0
                if diff <= 4:
                    return 82.0
                return 70.0
        except Exception:
            pass
        return 80.0

    @classmethod
    def calculate_final_resource_score(
        cls,
        resource_title: str,
        resource_desc: Optional[str],
        resource_topics: List[str],
        target_skill_id: str,
        target_skill_name: str,
        resource_difficulty: str,
        learner_level: str,
        views: Optional[int],
        likes: Optional[int],
        channel_name: Optional[str],
        duration_seconds: Optional[int],
        published_at: Optional[str],
        resource_type: str = "video",
        learner_preference: Optional[str] = "video",
        hours_per_week: float = 10.0
    ) -> Tuple[float, Dict[str, float]]:
        relevance = cls.calculate_relevance_score(
            resource_title, resource_desc, resource_topics, target_skill_id, target_skill_name
        )
        quality, engagement = cls.calculate_quality_score(views, likes, channel_name, duration_seconds)
        difficulty = cls.calculate_difficulty_match(resource_difficulty, learner_level)
        personalization = cls.calculate_personalization_score(
            resource_type, learner_preference, hours_per_week, duration_seconds
        )
        recency = cls.calculate_recency_score(published_at)

        # Weighted calculation
        raw_final = (
            (relevance * WEIGHT_RELEVANCE) +
            (quality * WEIGHT_QUALITY) +
            (difficulty * WEIGHT_DIFFICULTY) +
            (personalization * WEIGHT_PERSONALIZATION) +
            (recency * WEIGHT_RECENCY) +
            (engagement * WEIGHT_ENGAGEMENT)
        )

        final_score = round(min(100.0, max(0.0, raw_final)), 1)

        factors = {
            "relevance": round(relevance, 1),
            "quality": round(quality, 1),
            "difficulty_match": round(difficulty, 1),
            "personalization": round(personalization, 1),
            "recency": round(recency, 1),
            "engagement": round(engagement, 1)
        }

        return final_score, factors

    @classmethod
    def generate_resource_reason(
        cls,
        skill_name: str,
        resource_title: str,
        resource_type: str,
        difficulty: str,
        channel_name: Optional[str],
        learner_level: str
    ) -> str:
        channel_str = f" from {channel_name}" if channel_name else ""
        return f"Recommended because this {difficulty.lower()}-friendly {resource_type}{channel_str} directly covers {skill_name} concepts tailored for {learner_level.lower()} learners."
