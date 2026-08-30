from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_dashboard_summary():
    return {
        "career_goal": {
            "role": "AI Engineer",
            "timeline": "8 Months",
            "readiness": 76
        },
        "next_action": {
            "title": "Complete Classification Algorithms",
            "estimated_time": "45 minutes",
            "reasons": [
                "Prerequisites completed",
                "Important skill gap identified",
                "Matches your current learner level"
            ]
        },
        "learning_plan": [
            {
                "title": "Intro to Logistic Regression",
                "type": "Course",
                "time": "20 mins",
                "format": "Video"
            }
        ],
        "skills_progress": [
            {"name": "Python", "value": 90},
            {"name": "SQL", "value": 85},
            {"name": "Machine Learning", "value": 62}
        ]
    }
