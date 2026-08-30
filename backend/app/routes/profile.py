from fastapi import APIRouter, HTTPException, status
from app.database.mongodb import get_database
from app.schemas.profile import LearnerProfileCreate, LearnerProfileUpdate, LearnerProfileResponse
from datetime import datetime

router = APIRouter()

MOCK_USER_ID = "mock-user-123"

@router.get("/", response_model=LearnerProfileResponse)
async def get_profile():
    db = get_database()
    profile = await db.profiles.find_one({"user_id": MOCK_USER_ID})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile["_id"] = str(profile["_id"])
    return profile

@router.post("/onboarding/complete", response_model=LearnerProfileResponse)
async def complete_onboarding(profile_data: LearnerProfileCreate):
    db = get_database()
    user_id = MOCK_USER_ID
    
    # Check if profile already exists
    existing = await db.profiles.find_one({"user_id": user_id})
    
    profile_dict = profile_data.model_dump()
    profile_dict["user_id"] = user_id
    profile_dict["onboarding_status"] = "completed"
    profile_dict["updated_at"] = datetime.utcnow()
    
    if existing:
        await db.profiles.update_one(
            {"user_id": user_id}, 
            {"$set": profile_dict}
        )
        updated = await db.profiles.find_one({"user_id": user_id})
        updated["_id"] = str(updated["_id"])
        return updated
    else:
        profile_dict["created_at"] = datetime.utcnow()
        result = await db.profiles.insert_one(profile_dict)
        created = await db.profiles.find_one({"_id": result.inserted_id})
        created["_id"] = str(created["_id"])
        return created

@router.put("/goals", response_model=LearnerProfileResponse)
async def update_goals(update_data: LearnerProfileUpdate):
    db = get_database()
    user_id = MOCK_USER_ID
    
    if update_data.goals is None:
        raise HTTPException(status_code=422, detail="Goals data is required")
        
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {
            "goals": [g.model_dump() for g in update_data.goals],
            "updated_at": datetime.utcnow()
        }}
    )
    updated = await db.profiles.find_one({"user_id": user_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    updated["_id"] = str(updated["_id"])
    return updated

@router.put("/skills", response_model=LearnerProfileResponse)
async def update_skills(update_data: LearnerProfileUpdate):
    db = get_database()
    user_id = MOCK_USER_ID
    
    if update_data.skills is None:
        raise HTTPException(status_code=422, detail="Skills data is required")
        
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {
            "skills": [s.model_dump() for s in update_data.skills],
            "updated_at": datetime.utcnow()
        }}
    )
    updated = await db.profiles.find_one({"user_id": user_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    updated["_id"] = str(updated["_id"])
    return updated

@router.put("/preferences", response_model=LearnerProfileResponse)
async def update_preferences(update_data: LearnerProfileUpdate):
    db = get_database()
    user_id = MOCK_USER_ID
    
    update_fields = {"updated_at": datetime.utcnow()}
    if update_data.learning_preferences is not None:
        update_fields["learning_preferences"] = update_data.learning_preferences.model_dump()
    if update_data.availability is not None:
        update_fields["availability"] = update_data.availability.model_dump()
        
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": update_fields}
    )
    updated = await db.profiles.find_one({"user_id": user_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    updated["_id"] = str(updated["_id"])
    return updated
