import logging
from app.database.mongodb import get_database

logger = logging.getLogger(__name__)

async def create_indexes():
    db = get_database()
    if db is None:
        logger.warning("Database not connected. Skipping index creation.")
        return

    try:
        # Learners collection indexes
        await db.learners.create_index("id", unique=True)

        # Roadmaps collection indexes
        await db.roadmaps.create_index("id", unique=True)
        await db.roadmaps.create_index("learnerId")

        # Skills collection indexes
        await db.skills.create_index("id", unique=True)
        await db.skills.create_index("category")
        await db.skills.create_index("difficulty")

        # Resources collection indexes
        await db.resources.create_index("id", unique=True)
        await db.resources.create_index("skillId")
        await db.resources.create_index("relatedSkillId")
        await db.resources.create_index("type")

        # Progress collection indexes
        await db.progress.create_index("learnerId", unique=True)

        logger.info("Successfully ensured MongoDB indexes.")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
