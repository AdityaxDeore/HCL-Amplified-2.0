import logging
from typing import Dict, Any, List, Optional
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.skill_graph_engine import SkillGraphEngine
from app.schemas.rag import RAGResourceItem, RAGContextResponse
from app.schemas.citation import CitationSchema

logger = logging.getLogger(__name__)

class RAGContextService:
    """
    RAG Context & Citation Preparation Service.
    Retrieves and structures grounded resource context and citation metadata
    for conversational AI and explanation pipelines (Part 9).
    """

    @classmethod
    async def retrieve_context_for_skill(
        cls,
        learner_id: str = "demo-learner",
        skill_id: str = "statistics",
        query: Optional[str] = None,
        limit: int = 3
    ) -> Dict[str, Any]:
        canon_skill = SkillGraphEngine.normalize_skill_id(skill_id)
        skill_name = canon_skill.replace("-", " ").title()
        effective_query = query or f"How to learn {skill_name} step by step"

        resources = await ResourceDiscoveryService.discover_resources_for_skill(
            skill_id=canon_skill,
            skill_name=skill_name,
            limit=limit
        )

        rag_items: List[Dict[str, Any]] = []
        citations: List[Dict[str, Any]] = []
        context_chunks: List[str] = []

        for idx, r in enumerate(resources):
            citation_obj = r.get("citation") or {
                "resource_id": r.get("id"),
                "source": r.get("provider", "Web"),
                "title": r.get("title"),
                "url": r.get("url"),
                "channel_name": r.get("channel_name"),
                "published_at": r.get("published_at"),
                "retrieved_at": r.get("published_at"),
                "type": r.get("type", "video"),
                "license": "Public"
            }

            content_text = f"[{r.get('provider')}] {r.get('title')}: {r.get('description')} (Difficulty: {r.get('difficulty')}, Duration: {r.get('duration')})"
            context_chunks.append(f"[{idx + 1}] {content_text} — Source URL: {r.get('url')}")

            rag_items.append({
                "resource_id": r.get("id"),
                "title": r.get("title"),
                "content": content_text,
                "description": r.get("description"),
                "source": r.get("source", "youtube"),
                "url": r.get("url"),
                "relevance_score": r.get("relevance_score", 90.0),
                "topics": r.get("topics", []),
                "skills": [canon_skill],
                "citation": citation_obj
            })
            citations.append(citation_obj)

        formatted_context = "\n\n".join(context_chunks)

        return {
            "query": effective_query,
            "skill_id": canon_skill,
            "skill_name": skill_name,
            "resources_count": len(rag_items),
            "resources": rag_items,
            "context_text": formatted_context,
            "citations": citations
        }
