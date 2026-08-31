from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseResourceIngestor(ABC):
    """
    Abstract Base Class for Resource Ingestors.
    All source adapters (YouTube, Web, Courses) adhere to this contract.
    """

    @property
    @abstractmethod
    def source_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_resources(
        self,
        query: str,
        skill_id: str,
        skill_name: str,
        difficulty: str = "Beginner",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Fetches, normalizes, and validates candidate resources for a skill query.
        """
        pass
