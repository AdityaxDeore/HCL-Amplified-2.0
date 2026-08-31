import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.ingestion.youtube_ingestor import YouTubeIngestor
from app.ingestion.web_ingestor import WebIngestor
from app.ingestion.course_ingestor import CourseIngestor
from app.ranking.resource_scoring import ResourceScoring
from app.services.skill_graph_engine import SkillGraphEngine

logger = logging.getLogger(__name__)

# Discovery In-Memory Cache: cache_key -> { "timestamp": datetime, "resources": List }
_DISCOVERY_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_HOURS = 24

class ResourceDiscoveryService:
    """
    Resource Discovery & Ranking Orchestrator.
    Manages multi-source ingestion, query templating, caching, deduplication,
    deterministic scoring, and diversity filtering.
    """

    youtube_ingestor = YouTubeIngestor()
    web_ingestor = WebIngestor()
    course_ingestor = CourseIngestor()

    @classmethod
    def generate_search_query(cls, skill_name: str, difficulty: str = "Beginner", preference: str = "video") -> str:
        skill_clean = skill_name.replace("-", " ").title()
        diff_clean = difficulty.lower()
        if diff_clean == "beginner":
            return f"{skill_clean} for beginners tutorial"
        if diff_clean == "advanced":
            return f"{skill_clean} advanced architecture masterclass"
        return f"{skill_clean} full tutorial guide"

    @classmethod
    async def discover_resources_for_skill(
        cls,
        skill_id: str,
        skill_name: Optional[str] = None,
        difficulty: str = "Beginner",
        learner_level: str = "Beginner",
        learner_preference: str = "video",
        hours_per_week: float = 10.0,
        limit: int = 5,
        force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
        canon_id = SkillGraphEngine.normalize_skill_id(skill_id)
        effective_name = skill_name or canon_id.replace("-", " ").title()
        cache_key = f"{canon_id}:{difficulty.lower()}:{learner_preference.lower()}"

        # 1. Check Cache
        if not force_refresh and cache_key in _DISCOVERY_CACHE:
            cached_entry = _DISCOVERY_CACHE[cache_key]
            if datetime.utcnow() - cached_entry["timestamp"] < timedelta(hours=CACHE_TTL_HOURS):
                return cached_entry["resources"][:limit]

        query = cls.generate_search_query(effective_name, difficulty, learner_preference)

        # 2. Fetch from multi-source adapters concurrently
        tasks = [
            cls.youtube_ingestor.fetch_resources(query, canon_id, effective_name, difficulty, limit=limit),
            cls.web_ingestor.fetch_resources(query, canon_id, effective_name, difficulty, limit=2),
            cls.course_ingestor.fetch_resources(query, canon_id, effective_name, difficulty, limit=2)
        ]
        results_nested = await asyncio.gather(*tasks, return_exceptions=True)

        candidates = []
        for res in results_nested:
            if isinstance(res, list):
                candidates.extend(res)

        if not candidates:
            # Fallback web documentation
            candidates = await cls.web_ingestor.fetch_resources(query, canon_id, effective_name, difficulty, limit=2)

        # 3. Deduplication by ID and URL
        seen_ids = set()
        seen_urls = set()
        unique_candidates = []

        for item in candidates:
            rid = item.get("id") or item.get("resource_id")
            url = item.get("url")
            if rid not in seen_ids and url not in seen_urls:
                seen_ids.add(rid)
                seen_urls.add(url)
                unique_candidates.append(item)

        # 4. Multi-Factor Scoring & Reasoning
        scored_resources = []
        for r in unique_candidates:
            r_copy = dict(r)
            final_score, factors = ResourceScoring.calculate_final_resource_score(
                resource_title=r_copy.get("title", ""),
                resource_desc=r_copy.get("description", ""),
                resource_topics=r_copy.get("topics", []),
                target_skill_id=canon_id,
                target_skill_name=effective_name,
                resource_difficulty=r_copy.get("difficulty", difficulty),
                learner_level=learner_level,
                views=r_copy.get("view_count"),
                likes=r_copy.get("like_count"),
                channel_name=r_copy.get("channel_name"),
                duration_seconds=r_copy.get("duration_seconds"),
                published_at=r_copy.get("published_at"),
                resource_type=r_copy.get("type", "video"),
                learner_preference=learner_preference,
                hours_per_week=hours_per_week
            )

            reason = ResourceScoring.generate_resource_reason(
                skill_name=effective_name,
                resource_title=r_copy.get("title", ""),
                resource_type=r_copy.get("type", "video"),
                difficulty=r_copy.get("difficulty", difficulty),
                channel_name=r_copy.get("channel_name"),
                learner_level=learner_level
            )

            r_copy["relevance_score"] = factors["relevance"]
            r_copy["quality_score"] = factors["quality"]
            r_copy["personalization_score"] = factors["personalization"]
            r_copy["final_score"] = final_score
            r_copy["decision_factors"] = factors
            r_copy["whyRecommended"] = reason
            r_copy["reason"] = reason

            scored_resources.append(r_copy)

        # 5. Sort by final score descending
        scored_resources.sort(key=lambda x: x["final_score"], reverse=True)

        # 6. Cache results
        _DISCOVERY_CACHE[cache_key] = {
            "timestamp": datetime.utcnow(),
            "resources": scored_resources
        }

        return scored_resources[:limit]

    @classmethod
    async def search_resources(
        cls,
        query: str,
        skill_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        target_skill = skill_id or "machine-learning"
        resources = await cls.discover_resources_for_skill(
            skill_id=target_skill,
            skill_name=query if query else None,
            difficulty=difficulty or "Beginner",
            limit=limit
        )

        if resource_type and resource_type.lower() != "all":
            resources = [r for r in resources if r.get("type", "").lower() == resource_type.lower()]

        if difficulty and difficulty.lower() != "all":
            resources = [r for r in resources if r.get("difficulty", "").lower() == difficulty.lower()]

        return {
            "query": query,
            "total_results": len(resources),
            "resources": resources,
            "source_statuses": {
                "youtube": "ACTIVE",
                "official_docs": "ACTIVE",
                "coursera": "ACTIVE"
            }
        }
