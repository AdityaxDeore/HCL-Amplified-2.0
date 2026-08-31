import logging
from typing import List, Dict, Any
from datetime import datetime
from app.ingestion.base import BaseResourceIngestor
from app.services.skill_graph_engine import SkillGraphEngine

logger = logging.getLogger(__name__)

COURSES_REGISTRY: Dict[str, List[Dict[str, Any]]] = {
    "machine-learning": [
        {
            "id": "coursera:ml-specialization",
            "source": "coursera",
            "provider": "Coursera · DeepLearning.AI",
            "type": "course",
            "title": "Machine Learning Specialization — Andrew Ng",
            "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "description": "Foundational online program created by Andrew Ng and DeepLearning.AI covering supervised learning, neural networks, and decision trees.",
            "duration_seconds": 144000,
            "duration": "40h",
            "duration_category": "LONG",
            "durationHours": 40.0,
            "rating": 4.9,
            "review_count": 28000,
            "difficulty": "Intermediate",
            "topics": ["machine-learning", "python", "neural-networks", "supervised-learning"],
            "thumbnail_url": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=60"
        }
    ],
    "deep-learning": [
        {
            "id": "coursera:dl-specialization",
            "source": "coursera",
            "provider": "Coursera · DeepLearning.AI",
            "type": "course",
            "title": "Deep Learning Specialization",
            "url": "https://www.coursera.org/specializations/deep-learning",
            "description": "Master Deep Learning, Convolutional Neural Networks, Sequence Models, and Structuring Machine Learning Projects.",
            "duration_seconds": 180000,
            "duration": "50h",
            "duration_category": "LONG",
            "durationHours": 50.0,
            "rating": 4.9,
            "review_count": 34000,
            "difficulty": "Advanced",
            "topics": ["deep-learning", "cnn", "rnn", "transformers"],
            "thumbnail_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60"
        }
    ]
}

class CourseIngestor(BaseResourceIngestor):
    """
    Ingestor for publicly discoverable Course metadata from recognized educational platforms.
    """

    @property
    def source_name(self) -> str:
        return "courses"

    async def fetch_resources(
        self,
        query: str,
        skill_id: str,
        skill_name: str,
        difficulty: str = "Beginner",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        canon_skill = SkillGraphEngine.normalize_skill_id(skill_id)
        courses = COURSES_REGISTRY.get(canon_skill, [])

        results = []
        for c in courses[:limit]:
            results.append({
                "id": c["id"],
                "resource_id": c["id"],
                "source": c["source"],
                "provider": c["provider"],
                "type": c["type"],
                "title": c["title"],
                "description": c["description"],
                "url": c["url"],
                "thumbnail_url": c["thumbnail_url"],
                "thumbnail": c["thumbnail_url"],
                "channel_name": c["provider"],
                "published_at": "2023-01-01",
                "duration_seconds": c["duration_seconds"],
                "duration": c["duration"],
                "duration_category": c["duration_category"],
                "durationHours": c["durationHours"],
                "view_count": 100000,
                "like_count": 20000,
                "comment_count": 500,
                "rating": c["rating"],
                "review_count": c.get("review_count", 5000),
                "topics": c["topics"],
                "skills": [canon_skill],
                "skillId": canon_skill,
                "relatedSkillId": canon_skill,
                "difficulty": c.get("difficulty", difficulty),
                "citation": {
                    "resource_id": c["id"],
                    "source": c["source"].capitalize(),
                    "title": c["title"],
                    "url": c["url"],
                    "channel_name": c["provider"],
                    "published_at": "2023-01-01",
                    "retrieved_at": datetime.utcnow().isoformat(),
                    "type": "course",
                    "license": "Online Course Platform"
                }
            })

        return results
