from typing import Optional, Dict, Any, List
from app.database.mongodb import get_database
from app.utils.serializers import serialize_doc, utc_now

class RoadmapRepository:
    @staticmethod
    def _collection():
        db = get_database()
        if db is None:
            return None
        return db.roadmaps

    @classmethod
    async def get_by_id(cls, roadmap_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        doc = await coll.find_one({"id": roadmap_id})
        return serialize_doc(doc)

    @classmethod
    async def get_by_learner_id(cls, learner_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        doc = await coll.find_one({"learnerId": learner_id})
        if not doc:
            doc = await coll.find_one({})  # Default active roadmap
        return serialize_doc(doc)

    @classmethod
    async def upsert(cls, roadmap_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = cls._collection()
        if coll is None:
            return roadmap_data
        roadmap_id = roadmap_data.get("id", "ai-engineer")
        now = utc_now()
        roadmap_data["updatedAt"] = now
        await coll.update_one(
            {"id": roadmap_id},
            {
                "$set": roadmap_data,
                "$setOnInsert": {"createdAt": now}
            },
            upsert=True
        )
        return await cls.get_by_id(roadmap_id)

    @classmethod
    async def update(cls, roadmap_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        updates["updatedAt"] = utc_now()
        await coll.update_one(
            {"id": roadmap_id},
            {"$set": updates}
        )
        return await cls.get_by_id(roadmap_id)

    @classmethod
    async def update_node(cls, roadmap_id: str, node_id: str, node_updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        roadmap = await cls.get_by_id(roadmap_id)
        if not roadmap:
            return None

        nodes = roadmap.get("nodes", [])
        node_found = False
        for node in nodes:
            if node.get("id") == node_id:
                node_found = True
                for k, v in node_updates.items():
                    if v is not None:
                        node[k] = v
                break

        if not node_found:
            return None

        now = utc_now()
        await coll.update_one(
            {"id": roadmap_id},
            {
                "$set": {
                    "nodes": nodes,
                    "updatedAt": now
                }
            }
        )
        return await cls.get_by_id(roadmap_id)

    @classmethod
    async def delete_node(cls, roadmap_id: str, node_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        roadmap = await cls.get_by_id(roadmap_id)
        if not roadmap:
            return None

        original_nodes = roadmap.get("nodes", [])
        filtered_nodes = [n for n in original_nodes if n.get("id") != node_id]
        if len(original_nodes) == len(filtered_nodes):
            return None  # Node was not found

        now = utc_now()
        await coll.update_one(
            {"id": roadmap_id},
            {
                "$set": {
                    "nodes": filtered_nodes,
                    "updatedAt": now
                }
            }
        )
        return await cls.get_by_id(roadmap_id)
