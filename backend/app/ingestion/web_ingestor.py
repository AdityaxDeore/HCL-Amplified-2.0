import logging
from typing import List, Dict, Any
from datetime import datetime
from app.ingestion.base import BaseResourceIngestor
from app.services.skill_graph_engine import SkillGraphEngine

logger = logging.getLogger(__name__)

OFFICIAL_DOCS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "python": {
        "id": "docs:python",
        "title": "Python 3 Official Documentation & Tutorial",
        "provider": "Python Software Foundation",
        "type": "documentation",
        "url": "https://docs.python.org/3/tutorial/",
        "description": "Official Python language documentation, standard library reference, and comprehensive tutorial.",
        "difficulty": "Beginner",
        "topics": ["python", "standard-library", "oop", "syntax"]
    },
    "numpy": {
        "id": "docs:numpy",
        "title": "NumPy User Guide & API Reference",
        "provider": "NumPy Org",
        "type": "documentation",
        "url": "https://numpy.org/doc/stable/user/",
        "description": "Official NumPy guide covering n-dimensional arrays, indexing, vectorization, and mathematical routines.",
        "difficulty": "Beginner",
        "topics": ["numpy", "arrays", "broadcasting", "linear-algebra"]
    },
    "machine-learning": {
        "id": "docs:scikit-learn",
        "title": "Scikit-Learn User Guide — Machine Learning in Python",
        "provider": "Scikit-Learn Community",
        "type": "documentation",
        "url": "https://scikit-learn.org/stable/user_guide.html",
        "description": "Official Scikit-Learn documentation with mathematical equations, algorithmic diagrams, and code snippets.",
        "difficulty": "Intermediate",
        "topics": ["machine-learning", "scikit-learn", "classification", "regression"]
    },
    "deep-learning": {
        "id": "docs:pytorch",
        "title": "PyTorch Documentation & Deep Learning Tutorials",
        "provider": "Linux Foundation / PyTorch",
        "type": "documentation",
        "url": "https://pytorch.org/tutorials/",
        "description": "Comprehensive PyTorch documentation covering automatic differentiation, neural networks, and GPU acceleration.",
        "difficulty": "Advanced",
        "topics": ["deep-learning", "pytorch", "tensors", "autograd"]
    },
    "generative-ai": {
        "id": "docs:huggingface",
        "title": "Hugging Face Transformers Documentation",
        "provider": "Hugging Face",
        "type": "documentation",
        "url": "https://huggingface.co/docs/transformers/",
        "description": "State-of-the-art Natural Language Processing and Generative AI model architectures, tokenizers, and pipelines.",
        "difficulty": "Advanced",
        "topics": ["generative-ai", "transformers", "llm", "nlp"]
    },
    "mlops": {
        "id": "docs:fastapi",
        "title": "FastAPI Framework Documentation — High Performance AI APIs",
        "provider": "FastAPI Tiangolo",
        "type": "documentation",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "description": "Interactive documentation for building modern, high-performance web APIs for AI model deployment.",
        "difficulty": "Intermediate",
        "topics": ["mlops", "fastapi", "deployment", "async"]
    },
    "sql": {
        "id": "docs:postgresql",
        "title": "PostgreSQL Interactive Tutorial & SQL Manual",
        "provider": "PostgreSQL Global Development Group",
        "type": "documentation",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "description": "Official relational database querying manual, indexes, transactions, and performance optimization.",
        "difficulty": "Beginner",
        "topics": ["sql", "databases", "queries", "indexing"]
    }
}

class WebIngestor(BaseResourceIngestor):
    """
    Ingestor for Official Documentation and recognized open web educational guides.
    """

    @property
    def source_name(self) -> str:
        return "official_docs"

    async def fetch_resources(
        self,
        query: str,
        skill_id: str,
        skill_name: str,
        difficulty: str = "Beginner",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        canon_skill = SkillGraphEngine.normalize_skill_id(skill_id)
        doc = OFFICIAL_DOCS_REGISTRY.get(canon_skill)

        if not doc:
            # Check partial match
            for k, v in OFFICIAL_DOCS_REGISTRY.items():
                if k in canon_skill or canon_skill in k:
                    doc = v
                    break

        if not doc:
            doc = {
                "id": f"docs:{canon_skill}",
                "title": f"{canon_skill.replace('-', ' ').title()} Technical Documentation & Reference",
                "provider": "Official Documentation",
                "type": "documentation",
                "url": f"https://developer.mozilla.org/en-US/search?q={canon_skill}",
                "description": f"Authoritative developer documentation and syntax guide for {canon_skill.replace('-', ' ').title()}.",
                "difficulty": difficulty,
                "topics": [canon_skill]
            }

        res_id = doc["id"]
        return [
            {
                "id": res_id,
                "resource_id": res_id,
                "source": "official_docs",
                "provider": doc["provider"],
                "type": doc["type"],
                "title": doc["title"],
                "description": doc["description"],
                "url": doc["url"],
                "thumbnail_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60",
                "thumbnail": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60",
                "channel_name": doc["provider"],
                "published_at": "2024-01-01",
                "duration_seconds": 1800,
                "duration": "Self-paced",
                "duration_category": "MEDIUM",
                "durationHours": 1.0,
                "view_count": 500000,
                "like_count": 25000,
                "comment_count": 0,
                "rating": 4.9,
                "topics": doc["topics"],
                "skills": [canon_skill],
                "skillId": canon_skill,
                "relatedSkillId": canon_skill,
                "difficulty": doc.get("difficulty", difficulty),
                "citation": {
                    "resource_id": res_id,
                    "source": "Official Documentation",
                    "title": doc["title"],
                    "url": doc["url"],
                    "channel_name": doc["provider"],
                    "published_at": "2024-01-01",
                    "retrieved_at": datetime.utcnow().isoformat(),
                    "type": "documentation",
                    "license": "Open Access"
                }
            }
        ]
