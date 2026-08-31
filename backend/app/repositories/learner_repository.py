from typing import Optional, Dict, Any
from app.database.mongodb import get_database
from app.utils.serializers import serialize_doc, utc_now

class LearnerRepository:
    @staticmethod
    def _collection():
        db = get_database()
        if db is None:
            return None
        return db.learners

    @classmethod
    async def get_by_id(cls, learner_id: str) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        doc = await coll.find_one({"id": learner_id})
        return serialize_doc(doc)

    @classmethod
    async def upsert(cls, learner_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = cls._collection()
        if coll is None:
            return learner_data
        learner_id = learner_data.get("id", "demo-learner")
        now = utc_now()
        learner_data["updatedAt"] = now
        await coll.update_one(
            {"id": learner_id},
            {
                "$set": learner_data,
                "$setOnInsert": {"createdAt": now}
            },
            upsert=True
        )
        return await cls.get_by_id(learner_id)

    @classmethod
    async def update(cls, learner_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        coll = cls._collection()
        if coll is None:
            return None
        updates["updatedAt"] = utc_now()
        await coll.update_one(
            {"id": learner_id},
            {"$set": updates}
        )
        return await cls.get_by_id(learner_id)
