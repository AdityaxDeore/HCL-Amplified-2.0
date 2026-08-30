from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "LearnPath AI API"
    DEBUG: bool = True
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "learnpath_ai"
    JWT_SECRET: str = "supersecretkey_change_in_production"
    AI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
