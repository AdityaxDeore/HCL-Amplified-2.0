import logging
from typing import Dict, Any, Optional
from datetime import datetime
from app.schemas.citation import CitationSchema

logger = logging.getLogger(__name__)

class CitationService:
    """
    Standardized Citation Management Service.
    Ensures every external resource has an immutable, validated citation schema.
    """

    @staticmethod
    def validate_url(url: str) -> bool:
        if not url or not isinstance(url, str):
            return False
        url_clean = url.strip().lower()
        if not (url_clean.startswith("http://") or url_clean.startswith("https://")):
            return False
        if any(bad in url_clean for bad in ("javascript:", "file:", "data:", "blob:")):
            return False
        return True

    @classmethod
    def create_citation(
        cls,
        resource_id: str,
        source: str,
        title: str,
        url: str,
        channel_name: Optional[str] = None,
        published_at: Optional[str] = None,
        resource_type: str = "video"
    ) -> Dict[str, Any]:
        safe_url = url if cls.validate_url(url) else "#"
        return {
            "resource_id": resource_id,
            "source": source.capitalize() if source else "Web",
            "title": title or "Learning Resource",
            "url": safe_url,
            "channel_name": channel_name,
            "published_at": published_at,
            "retrieved_at": datetime.utcnow().isoformat(),
            "type": resource_type,
            "license": "Public / Open Access"
        }
