from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import dashboard, profile
from app.database.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="LearnPath AI API",
    description="Backend API for AI-Powered Personalized Learning Path Recommender",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LearnPath AI API"}
