from typing import Optional, Dict, Any, List
from app.repositories.skill_repository import SkillRepository
from app.services.skill_graph_engine import SkillGraphEngine
from app.utils.errors import ResourceNotFoundError

class SkillService:
    @staticmethod
    async def get_all_skills(category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_all_skills(category=category, difficulty=difficulty)

    @staticmethod
    async def search_skills(query: str, category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return await SkillGraphEngine.get_all_skills(category=category, difficulty=difficulty)
        
        # Search via repo if available, else in-memory search
        try:
            results = await SkillRepository.search(query.strip(), category=category, difficulty=difficulty)
            if results:
                return results
        except Exception:
            pass

        all_skills = await SkillGraphEngine.get_all_skills(category=category, difficulty=difficulty)
        q = query.strip().lower()
        return [
            s for s in all_skills
            if q in s.get("name", "").lower()
            or q in s.get("description", "").lower()
            or q in s.get("category", "").lower()
            or any(q in alias.lower() for alias in s.get("aliases", []))
        ]

    @staticmethod
    async def get_by_id(skill_id: str) -> Dict[str, Any]:
        return await SkillGraphEngine.get_skill(skill_id)

    @staticmethod
    async def get_skill_graph() -> Dict[str, Any]:
        return await SkillGraphEngine.get_skill_graph()

    @staticmethod
    async def get_prerequisites(skill_id: str) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_skill_prerequisites(skill_id)

    @staticmethod
    async def get_dependents(skill_id: str) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_skill_dependents(skill_id)

    @staticmethod
    async def get_related(skill_id: str) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_related_skills(skill_id)

    @staticmethod
    async def get_upstream(skill_id: str) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_upstream_skills(skill_id)

    @staticmethod
    async def get_downstream(skill_id: str) -> List[Dict[str, Any]]:
        return await SkillGraphEngine.get_downstream_skills(skill_id)

    @staticmethod
    async def find_path(source_id: str, target_id: str) -> Dict[str, Any]:
        return await SkillGraphEngine.find_skill_path(source_id, target_id)
