from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from app.schemas.citation import CitationSchema

class InterviewStartRequest(BaseModel):
    learnerId: str = "demo-learner"
    targetRole: Optional[str] = "AI Engineer"
    interviewType: str = "mixed"  # "technical" | "conceptual" | "project" | "mixed"
    difficulty: str = "adaptive"  # "beginner" | "intermediate" | "advanced" | "adaptive"
    questionCount: int = Field(default=6, ge=3, le=10)
    focusSkills: List[str] = []

class AnswerEvaluationSchema(BaseModel):
    technicalScore: float
    conceptualScore: float
    completenessScore: float
    relevanceScore: float
    communicationScore: float
    overallScore: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    missingConcepts: List[str] = []
    feedback: str
    idealAnswerPoints: List[str] = []

class InterviewQuestionSchema(BaseModel):
    id: str
    question: str
    skill: str
    difficulty: str  # "easy" | "medium" | "hard"
    type: str = "technical"  # "technical" | "conceptual" | "project" | "behavioral"
    expectedConcepts: List[str] = []
    answer: Optional[str] = None
    evaluation: Optional[AnswerEvaluationSchema] = None
    followUpQuestion: Optional[str] = None
    followUpExpectedConcepts: List[str] = []
    followUpAnswer: Optional[str] = None
    followUpEvaluation: Optional[AnswerEvaluationSchema] = None
    status: str = "pending"

class ClientQuestionView(BaseModel):
    id: str
    question: str
    skill: str
    difficulty: str
    type: str
    questionNumber: int
    totalQuestions: int
    isFollowUp: bool = False
    parentQuestionText: Optional[str] = None

class InterviewAnswerRequest(BaseModel):
    answer: str

class InterviewAnswerResponse(BaseModel):
    questionId: str
    evaluation: AnswerEvaluationSchema
    hasFollowUp: bool = False
    followUpQuestion: Optional[str] = None
    nextStep: str  # "follow_up" | "next_question" | "complete"

class SkillPerformanceItem(BaseModel):
    skill: str
    score: float
    status: str  # "STRONG" | "GOOD" | "DEVELOPING" | "NEEDS_IMPROVEMENT"

class FinalReportSchema(BaseModel):
    sessionId: str
    overallScore: float
    status: str  # "STRONG" | "GOOD" | "DEVELOPING" | "NEEDS_IMPROVEMENT"
    technicalScore: float
    conceptualScore: float
    communicationScore: float
    problemSolvingScore: float
    skillPerformance: List[SkillPerformanceItem] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    missingConcepts: List[str] = []
    recommendedSteps: List[Dict[str, Any]] = []
    recommendedResources: List[Dict[str, Any]] = []
    interviewReadinessSummary: str

class InterviewSessionSchema(BaseModel):
    id: str
    learnerId: str = "demo-learner"
    targetRole: str = "AI Engineer"
    interviewType: str = "mixed"
    difficulty: str = "adaptive"
    questionCount: int = 6
    focusSkills: List[str] = []
    status: str = "STARTED"  # "SETUP", "STARTED", "WAITING_FOR_ANSWER", "FEEDBACK", "FOLLOW_UP", "COMPLETED"
    currentQuestionIndex: int = 0
    questions: List[InterviewQuestionSchema] = []
    finalReport: Optional[FinalReportSchema] = None
    startedAt: str
    completedAt: Optional[str] = None
