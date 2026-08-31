from fastapi import APIRouter
from app.services.progress_service import ProgressService
from app.schemas.progress import ProgressSchema, ProgressPatch
from app.schemas.common import DataResponse

router = APIRouter()

@router.get("", response_model=DataResponse[ProgressSchema])
@router.get("/", response_model=DataResponse[ProgressSchema])
async def get_progress():
    progress = await ProgressService.get_progress()
    return DataResponse(data=progress)

@router.patch("", response_model=DataResponse[ProgressSchema])
@router.patch("/", response_model=DataResponse[ProgressSchema])
async def patch_progress(patch: ProgressPatch):
    updated = await ProgressService.patch_progress(patch)
    return DataResponse(data=updated)
