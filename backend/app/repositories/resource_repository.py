from typing import Optional, Dict, Any, List
import re
from app.database.mongodb import get_database
from app.utils.serializers import serialize_doc, utc_now

class ResourceRepository:
    @staticmethod
    def _collection():
        db = get_database()
        if db is None:
            return None
        return db.resources

    @classmethod
    async def get_all(
        cls,
        skill_id: Optional[str] = None,
        roadmap_node_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        provider: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return []

        query: Dict[str, Any] = {}
        if skill_id:
            query["$or"] = [
                {"skillId": skill_id},
                {"relatedSkillId": skill_id}
            ]
        if roadmap_node_id:
            query["$or"] = [
                {"roadmapNodeId": roadmap_node_id},
                {"relatedNodeId": roadmap_node_id}
            ]
        if resource_type and resource_type.lower() != "all":
            query["type"] = {"$regex": f"^{re.escape(resource_type)}$", "$options": "i"}
        if provider:
            query["provider"] = {"$regex": f"^{re.escape(provider)}$", "$options": "i"}
        if difficulty:
            query["difficulty"] = {"$regex": f"^{re.escape(difficulty)}$", "$options": "i"}
        if search:
            escaped = re.escape(search)
            search_cond = [
                {"title": {"$regex": escaped, "$options": "i"}},
                {"description": {"$regex": escaped, "$options": "i"}},
                {"provider": {"$regex": escaped, "$options": "i"}}
            ]
            if "$or" in query:
                query = {"$and": [{"$or": query["$or"]}, {"$or": search_cond}]}
            else:
                query["$or"] = search_cond

        cursor = coll.find(query)
        docs = await cursor.to_list(length=200)
        return serialize_doc(docs)

    @classmethod
    async def get_by_id(cls, resource_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        doc = await coll.find_one({"id": resource_id})
        return serialize_doc(doc)

    @classmethod
    async def upsert(cls, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = cls._collection()
        if coll is None:
            return resource_data
        resource_id = resource_data["id"]
        now = utc_now()
        resource_data["updatedAt"] = now
        await coll.update_one(
            {"id": resource_id},
            {
                "$set": resource_data,
                "$setOnInsert": {"createdAt": now}
            },
            upsert=True
        )
        return await cls.get_by_id(resource_id)

    @classmethod
    async def upsert_many(cls, resources_list: List[Dict[str, Any]]) -> int:
        count = 0
        for item in resources_list:
            await cls.upsert(item)
            count += 1
        return count
