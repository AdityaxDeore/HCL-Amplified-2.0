from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "LearnPath AI API"
    DEBUG: bool = True
    MONGO_URI: str = Field(default="mongodb://localhost:27017", validation_alias="MONGODB_URI")
    DATABASE_NAME: str = "learnpath"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    YOUTUBE_API_KEY: Optional[str] = Field(default=None, validation_alias="YOUTUBE_API_KEY")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
