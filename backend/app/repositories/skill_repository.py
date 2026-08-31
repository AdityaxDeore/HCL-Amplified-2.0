from typing import Optional, Dict, Any, List
import re
from app.database.mongodb import get_database
from app.utils.serializers import serialize_doc, utc_now

class SkillRepository:
    @staticmethod
    def _collection():
        db = get_database()
        if db is None:
            return None
        return db.skills

    @classmethod
    async def get_all(cls, category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return []
        query = {}
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
        if difficulty and difficulty.lower() != "all":
            query["difficulty"] = {"$regex": f"^{re.escape(difficulty)}$", "$options": "i"}
        cursor = coll.find(query)
        docs = await cursor.to_list(length=200)
        return serialize_doc(docs)

    @classmethod
    async def get_by_id(cls, skill_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        doc = await coll.find_one({"id": skill_id})
        return serialize_doc(doc)

    @classmethod
    async def search(cls, query_str: str, category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return []
        escaped = re.escape(query_str)
        mongo_query: Dict[str, Any] = {
            "$or": [
                {"name": {"$regex": escaped, "$options": "i"}},
                {"description": {"$regex": escaped, "$options": "i"}},
                {"category": {"$regex": escaped, "$options": "i"}}
            ]
        }
        if category and category.lower() != "all":
            mongo_query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
        if difficulty and difficulty.lower() != "all":
            mongo_query["difficulty"] = {"$regex": f"^{re.escape(difficulty)}$", "$options": "i"}
        cursor = coll.find(mongo_query)
        docs = await cursor.to_list(length=100)
        return serialize_doc(docs)

    @classmethod
    async def upsert(cls, skill_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = cls._collection()
        if coll is None:
            return skill_data
        skill_id = skill_data["id"]
        now = utc_now()
        skill_data["updatedAt"] = now
        await coll.update_one(
            {"id": skill_id},
            {
                "$set": skill_data,
                "$setOnInsert": {"createdAt": now}
            },
            upsert=True
        )
        return await cls.get_by_id(skill_id)

    @classmethod
    async def upsert_many(cls, skills_list: List[Dict[str, Any]]) -> int:
        count = 0
        for item in skills_list:
            await cls.upsert(item)
            count += 1
        return count
