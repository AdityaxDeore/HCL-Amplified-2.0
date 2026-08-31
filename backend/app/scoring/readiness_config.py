from typing import Dict

# Configurable Dimension Weights (Sum = 1.0)
READINESS_WEIGHTS: Dict[str, float] = {
    "skillCoverage": 0.30,
    "prerequisiteCompletion": 0.20,
    "roadmapProgress": 0.15,
    "practicalExperience": 0.15,
    "assessmentPerformance": 0.10,
    "learningConsistency": 0.05,
    "goalAlignment": 0.05
}

# Overall Readiness Status Thresholds
READINESS_STATUS_THRESHOLDS = {
    "READY": 80,
    "NEAR_READY": 60,
    "BUILDING": 40,
    "NOT_READY": 0
}

# Individual Skill Status Thresholds
SKILL_STATUS_THRESHOLDS = {
    "READY": 80,
    "DEVELOPING": 60,
    "NEEDS_ATTENTION": 30,
    "NOT_STARTED": 0
}

# Interview Readiness Gate Thresholds
INTERVIEW_READINESS_THRESHOLD = 70
MIN_SKILL_COVERAGE_FOR_INTERVIEW = 60

# Data Completeness Confidence Bands
CONFIDENCE_THRESHOLDS = {
    "HIGH": 75.0,
    "MEDIUM": 50.0,
    "LOW": 0.0
}

# Roadmap Node Color Weights for Progress Dimension
ROADMAP_PRIORITY_WEIGHTS = {
    "yellow": 1.0,  # Mandatory / Core
    "white": 0.6,   # Medium importance
    "green": 0.3    # Optional / Elective
}
