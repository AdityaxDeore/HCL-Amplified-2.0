from fastapi import APIRouter, Path, Query
from typing import List, Dict, Any, Optional
from app.services.interview_service import InterviewService
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    ClientQuestionView,
    FinalReportSchema,
    InterviewSessionSchema
)
from app.schemas.common import DataResponse, ListResponse

router = APIRouter()

@router.post("", response_model=DataResponse[InterviewSessionSchema])
@router.post("/", response_model=DataResponse[InterviewSessionSchema])
async def start_interview_session(req: InterviewStartRequest):
    """Initializes a new personalized mock interview session."""
    session = await InterviewService.start_interview(
        learner_id=req.learnerId,
        target_role=req.targetRole,
        interview_type=req.interviewType,
        difficulty=req.difficulty,
        question_count=req.questionCount,
        focus_skills=req.focusSkills
    )
    return DataResponse(data=session)

@router.get("/history/{learner_id}", response_model=ListResponse[Dict[str, Any]])
async def get_interview_history(
    learner_id: str = Path(..., description="Learner ID")
):
    """Retrieves chronological past completed interview sessions."""
    history = await InterviewService.get_interview_history(learner_id)
    return ListResponse(data=history, count=len(history))

@router.get("/{session_id}", response_model=DataResponse[InterviewSessionSchema])
async def get_interview_session_state(
    session_id: str = Path(..., description="Interview Session ID")
):
    """Retrieves current interview session state and progress."""
    session = await InterviewService.get_session(session_id)
    return DataResponse(data=session)

@router.get("/{session_id}/current", response_model=DataResponse[ClientQuestionView])
async def get_current_question(
    session_id: str = Path(..., description="Interview Session ID")
):
    """Returns the current active question without revealing expected concepts."""
    q_data = await InterviewService.get_current_question(session_id)
    return DataResponse(data=q_data)

@router.post("/{session_id}/answer", response_model=DataResponse[InterviewAnswerResponse])
async def submit_answer(
    session_id: str = Path(..., description="Interview Session ID"),
    req: InterviewAnswerRequest = ...
):
    """Submits candidate answer for multi-factor evaluation."""
    result = await InterviewService.submit_answer(session_id, req.answer)
    return DataResponse(data=result)

@router.post("/{session_id}/follow-up", response_model=DataResponse[InterviewAnswerResponse])
async def submit_follow_up_answer(
    session_id: str = Path(..., description="Interview Session ID"),
    req: InterviewAnswerRequest = ...
):
    """Submits follow-up answer and refines evaluated scores."""
    result = await InterviewService.submit_follow_up(session_id, req.answer)
    return DataResponse(data=result)

@router.post("/{session_id}/next", response_model=DataResponse[Any])
async def advance_next_question(
    session_id: str = Path(..., description="Interview Session ID")
):
    """Advances to the next question or completes the interview."""
    result = await InterviewService.next_question(session_id)
    return DataResponse(data=result)

@router.post("/{session_id}/complete", response_model=DataResponse[FinalReportSchema])
async def complete_interview_session(
    session_id: str = Path(..., description="Interview Session ID")
):
    """Completes the interview and produces final report with RAG recommendations."""
    report = await InterviewService.complete_interview(session_id)
    return DataResponse(data=report)
