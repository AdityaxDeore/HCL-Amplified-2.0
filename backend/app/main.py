from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.database.indexes import create_indexes
from app.database.seed import seed_database
from app.utils.errors import register_error_handlers
from app.routes import (
    health,
    learner,
    roadmap,
    skills,
    resources,
    progress,
    dashboard,
    gaps,
    recommendations,
    reality,
    assistant,
    readiness,
    feedback,
    interviews,
    demo
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await create_indexes()
    # Ensure seed data exists
    try:
        db = get_database()
        if db is not None:
            count = await db.learners.count_documents({})
            if count == 0:
                await seed_database()
    except Exception as e:
        pass
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    description="LearnPath AI — Personalized Learning Path Recommender API",
    version="2.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Register centralized error handlers
register_error_handlers(app)

# CORS configuration with explicit frontend origin
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(learner.router, prefix="/api/learner", tags=["Learner"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(roadmap.router, prefix="/api/roadmaps", tags=["Roadmaps"])
app.include_router(skills.router, prefix="/api/skills", tags=["Skills"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(gaps.router, prefix="/api/gaps", tags=["Skill Gaps"])
app.include_router(gaps.router, prefix="/api/gap", tags=["Skill Gap (Alias)"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(recommendations.router, prefix="/api/recommendation", tags=["Recommendation (Alias)"])
app.include_router(reality.router, prefix="/api/reality-check", tags=["Reality Checker"])
app.include_router(reality.router, prefix="/api/reality", tags=["Reality (Alias)"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Assistant"])
app.include_router(readiness.router, prefix="/api/readiness", tags=["Readiness Intelligence"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Adaptive Feedback"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["AI Interview Simulator"])
app.include_router(interviews.router, prefix="/api/interview", tags=["AI Interview (Alias)"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo Reset"])

# Compatibility alias for profile
app.include_router(learner.router, prefix="/api/profile", tags=["Profile (Legacy)"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to LearnPath AI API",
        "docs": "/docs",
        "health": "/api/health"
    }
