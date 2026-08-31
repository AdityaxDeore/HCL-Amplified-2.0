from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=3000
        )
        db.db = db.client[settings.DATABASE_NAME]
        # Verify connection
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {settings.DATABASE_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("Closed MongoDB connection")

def get_database():
    return db.db
