from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class DataResponse(BaseModel, Generic[T]):
    data: T

class ListResponse(BaseModel, Generic[T]):
    data: List[T]
    count: int = Field(..., description="Total items in the list")

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
