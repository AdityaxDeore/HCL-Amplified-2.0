from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    db.db = db.client[settings.DATABASE_NAME]

async def close_mongo_connection():
    db.client.close()

def get_database():
    return db.db
