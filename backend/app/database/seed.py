import asyncio
import logging
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.database.indexes import create_indexes
from app.repositories.learner_repository import LearnerRepository
from app.repositories.roadmap_repository import RoadmapRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.resource_repository import ResourceRepository
from app.repositories.progress_repository import ProgressRepository
from app.utils.roadmap_loader import RoadmapLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

SEED_LEARNER = {
    "id": "demo-learner",
    "name": "Alex Morgan",
    "avatarUrl": "https://i.pravatar.cc/150?u=alex-morgan",
    "initials": "AM",
    "goal": "Become an AI Engineer",
    "primaryGoal": "Become an AI Engineer",
    "targetRole": "AI Engineer",
    "experienceLevel": "Intermediate",
    "experience": "Intermediate",
    "hoursPerWeek": 10,
    "availableHoursPerWeek": 10,
    "targetMonths": 4,
    "currentFocus": "machine-learning",
    "readiness": 78,
    "overallProgress": 32,
    "interests": ["Artificial Intelligence", "Machine Learning", "Generative AI"],
    "currentSkills": [
        {"skillId": "python", "name": "Python", "level": "Intermediate"},
        {"skillId": "sql", "name": "SQL", "level": "Intermediate"},
        {"skillId": "git", "name": "Git", "level": "Intermediate"},
        {"skillId": "numpy", "name": "NumPy", "level": "Beginner"},
    ],
    "completedCourses": [],
    "careerGoals": ["AI Engineer", "Machine Learning Engineer"],
    "learningPreferences": {
        "formats": ["video", "interactive", "project"],
        "pace": "balanced"
    },
    "streak": 7,
    "learningHours": 42,
    "topicsCompleted": 18,
    "profileCompletion": 85,
}

SEED_ROADMAP = {
    "id": "ai-engineer",
    "learnerId": "demo-learner",
    "title": "AI Engineer Roadmap",
    "goal": "Become an AI Engineer",
    "targetRole": "AI Engineer",
    "description": "Step by step personalized guide to becoming an AI Engineer in 2026",
    "status": "active",
    "timeline": "4 months",
    "hoursPerWeek": 10,
    "overallProgress": 32,
    "currentPhase": "Machine Learning",
    "nodes": [
        {
            "id": "python",
            "skillId": "python",
            "title": "Python",
            "category": "Foundations",
            "importance": "mandatory",
            "status": "completed",
            "estimatedWeeks": 2,
            "estimatedHours": 20,
            "prerequisites": [],
            "month": 1,
            "order": 1,
            "description": "Core programming language for AI/ML. Covers syntax, data structures, functions, OOP, and libraries.",
            "whyItMatters": "Python is the primary language for all AI/ML frameworks. Without it, no other skill in this roadmap is accessible."
        },
        {
            "id": "numpy",
            "skillId": "numpy",
            "title": "NumPy",
            "category": "Foundations",
            "importance": "mandatory",
            "status": "completed",
            "estimatedWeeks": 1,
            "estimatedHours": 10,
            "prerequisites": ["python"],
            "month": 1,
            "order": 2,
            "description": "Numerical computing library. Covers arrays, matrix operations, and vectorized computations.",
            "whyItMatters": "NumPy is the foundation of every ML library including Pandas, Scikit-learn, and TensorFlow."
        },
        {
            "id": "statistics",
            "skillId": "statistics",
            "title": "Statistics",
            "category": "Foundations",
            "importance": "mandatory",
            "status": "in_progress",
            "estimatedWeeks": 2,
            "estimatedHours": 20,
            "prerequisites": ["python", "numpy"],
            "month": 1,
            "order": 3,
            "description": "Probability, distributions, hypothesis testing, and statistical inference.",
            "whyItMatters": "Understanding statistics is essential for evaluating model performance and understanding data patterns."
        },
        {
            "id": "machine-learning",
            "skillId": "machine-learning",
            "title": "Machine Learning",
            "category": "Core AI",
            "importance": "mandatory",
            "status": "not_started",
            "estimatedWeeks": 3,
            "estimatedHours": 30,
            "prerequisites": ["python", "numpy", "statistics"],
            "month": 2,
            "order": 4,
            "description": "Supervised and unsupervised learning, model evaluation, feature engineering, and common algorithms.",
            "whyItMatters": "Machine Learning is a core requirement for your AI Engineer goal. All advanced AI topics build on ML fundamentals."
        },
        {
            "id": "deep-learning",
            "skillId": "deep-learning",
            "title": "Deep Learning",
            "category": "Core AI",
            "importance": "mandatory",
            "status": "locked",
            "estimatedWeeks": 3,
            "estimatedHours": 30,
            "prerequisites": ["machine-learning"],
            "month": 3,
            "order": 5,
            "description": "Neural networks, backpropagation, CNNs, RNNs, and training deep models.",
            "whyItMatters": "Deep Learning powers modern AI applications including image recognition, NLP, and generative AI."
        },
        {
            "id": "generative-ai",
            "skillId": "generative-ai",
            "title": "Generative AI",
            "category": "Advanced AI",
            "importance": "recommended",
            "status": "locked",
            "estimatedWeeks": 2,
            "estimatedHours": 20,
            "prerequisites": ["deep-learning"],
            "month": 4,
            "order": 6,
            "description": "LLMs, transformers, prompt engineering, RAG, and fine-tuning.",
            "whyItMatters": "Generative AI is the fastest-growing area in the industry and directly relevant to your AI Engineer goal."
        },
        {
            "id": "mlops",
            "skillId": "mlops",
            "title": "MLOps",
            "category": "Production",
            "importance": "recommended",
            "status": "locked",
            "estimatedWeeks": 2,
            "estimatedHours": 20,
            "prerequisites": ["machine-learning"],
            "month": 4,
            "order": 7,
            "description": "Model deployment, monitoring, CI/CD for ML, and production best practices.",
            "whyItMatters": "MLOps bridges the gap between model development and production deployment — critical for AI Engineers."
        },
        {
            "id": "ai-projects",
            "skillId": "ai-projects",
            "title": "AI Engineer Projects",
            "category": "Capstone",
            "importance": "optional",
            "status": "locked",
            "estimatedWeeks": 2,
            "estimatedHours": 20,
            "prerequisites": ["deep-learning", "generative-ai"],
            "month": 4,
            "order": 8,
            "description": "End-to-end AI projects: recommendation systems, image classifiers, chatbots, RAG pipelines.",
            "whyItMatters": "Portfolio projects demonstrate real-world AI engineering skills to employers."
        }
    ],
    "milestones": [
        {"id": "foundations", "title": "Foundations", "month": 1, "nodeIds": ["python", "numpy", "statistics"], "status": "in_progress", "progress": 66},
        {"id": "ml", "title": "Machine Learning", "month": 2, "nodeIds": ["machine-learning"], "status": "not_started", "progress": 0},
        {"id": "deep-learning", "title": "Deep Learning", "month": 3, "nodeIds": ["deep-learning"], "status": "not_started", "progress": 0},
        {"id": "advanced", "title": "Generative AI & Projects", "month": 4, "nodeIds": ["generative-ai", "mlops", "ai-projects"], "status": "not_started", "progress": 0}
    ]
}

SEED_SKILLS = [
    {
        "id": "python",
        "name": "Python",
        "category": "Artificial Intelligence",
        "difficulty": "Beginner",
        "description": "High-level programming language widely used in AI, ML, data science, and backend development.",
        "prerequisites": [],
        "relatedSkills": ["numpy", "statistics", "machine-learning"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Data Scientist", "Backend Engineer"],
        "projects": [
            {"id": "proj-py-1", "title": "Data Pipeline Builder", "difficulty": "Beginner"},
            {"id": "proj-py-2", "title": "Web Scraper", "difficulty": "Beginner"},
            {"id": "proj-py-3", "title": "CLI Task Manager", "difficulty": "Beginner"}
        ],
        "resourceIds": ["res-python-crash", "res-python-docs"],
        "inRoadmap": True
    },
    {
        "id": "numpy",
        "name": "NumPy",
        "category": "Artificial Intelligence",
        "difficulty": "Beginner",
        "description": "Numerical computing library for Python. Essential for scientific computing and ML.",
        "prerequisites": ["python"],
        "relatedSkills": ["python", "statistics", "machine-learning"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Data Scientist"],
        "projects": [
            {"id": "proj-np-1", "title": "Matrix Operations Visualizer", "difficulty": "Beginner"},
            {"id": "proj-np-2", "title": "Signal Processing Tool", "difficulty": "Intermediate"}
        ],
        "resourceIds": ["res-numpy-tutorial"],
        "inRoadmap": True
    },
    {
        "id": "statistics",
        "name": "Statistics",
        "category": "Data Science",
        "difficulty": "Intermediate",
        "description": "Probability, distributions, hypothesis testing, and statistical inference for data analysis.",
        "prerequisites": ["python", "numpy"],
        "relatedSkills": ["machine-learning", "deep-learning", "python"],
        "careerPaths": ["Data Scientist", "ML Engineer", "AI Engineer"],
        "projects": [
            {"id": "proj-stat-1", "title": "A/B Test Analyzer", "difficulty": "Intermediate"},
            {"id": "proj-stat-2", "title": "Bayesian Inference Demo", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-stats-course"],
        "inRoadmap": True
    },
    {
        "id": "machine-learning",
        "name": "Machine Learning",
        "category": "Artificial Intelligence",
        "difficulty": "Intermediate",
        "description": "Build predictive models and understand core machine learning concepts, algorithms, and evaluation.",
        "prerequisites": ["python", "statistics"],
        "relatedSkills": ["deep-learning", "nlp", "computer-vision"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Data Scientist"],
        "projects": [
            {"id": "proj-ml-1", "title": "Customer Churn Prediction", "difficulty": "Intermediate"},
            {"id": "proj-ml-2", "title": "Image Classifier", "difficulty": "Intermediate"},
            {"id": "proj-ml-3", "title": "Recommendation System", "difficulty": "Intermediate"}
        ],
        "resourceIds": ["res-ml-full-course", "res-ml-textbook"],
        "inRoadmap": True
    },
    {
        "id": "deep-learning",
        "name": "Deep Learning",
        "category": "Artificial Intelligence",
        "difficulty": "Advanced",
        "description": "Neural networks, backpropagation, CNNs, RNNs, and training deep models with TensorFlow/PyTorch.",
        "prerequisites": ["machine-learning"],
        "relatedSkills": ["nlp", "computer-vision", "generative-ai"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Research Scientist"],
        "projects": [
            {"id": "proj-dl-1", "title": "MNIST Digit Classifier", "difficulty": "Intermediate"},
            {"id": "proj-dl-2", "title": "Sentiment Analyzer", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-dl-specialization"],
        "inRoadmap": True
    },
    {
        "id": "generative-ai",
        "name": "Generative AI",
        "category": "Artificial Intelligence",
        "difficulty": "Advanced",
        "description": "LLMs, transformers, prompt engineering, RAG pipelines, and fine-tuning foundation models.",
        "prerequisites": ["deep-learning"],
        "relatedSkills": ["nlp", "deep-learning", "mlops"],
        "careerPaths": ["AI Engineer", "Prompt Engineer", "LLM Engineer"],
        "projects": [
            {"id": "proj-gai-1", "title": "RAG Chatbot", "difficulty": "Advanced"},
            {"id": "proj-gai-2", "title": "Fine-tuned LLM", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-genai-course"],
        "inRoadmap": True
    },
    {
        "id": "mlops",
        "name": "MLOps",
        "category": "DevOps",
        "difficulty": "Intermediate",
        "description": "Model deployment, monitoring, CI/CD for ML pipelines, and production best practices.",
        "prerequisites": ["machine-learning"],
        "relatedSkills": ["docker", "kubernetes", "machine-learning"],
        "careerPaths": ["MLOps Engineer", "AI Engineer", "DevOps Engineer"],
        "projects": [
            {"id": "proj-mlops-1", "title": "ML Model API", "difficulty": "Intermediate"},
            {"id": "proj-mlops-2", "title": "Automated ML Pipeline", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-mlops-course"],
        "inRoadmap": True
    },
    {
        "id": "nlp",
        "name": "Natural Language Processing",
        "category": "Artificial Intelligence",
        "difficulty": "Advanced",
        "description": "Text processing, tokenization, embeddings, transformers, and language understanding.",
        "prerequisites": ["machine-learning", "deep-learning"],
        "relatedSkills": ["generative-ai", "deep-learning"],
        "careerPaths": ["NLP Engineer", "AI Engineer", "ML Engineer"],
        "projects": [
            {"id": "proj-nlp-1", "title": "Text Classifier", "difficulty": "Intermediate"},
            {"id": "proj-nlp-2", "title": "Named Entity Recognizer", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-nlp-course"],
        "inRoadmap": False
    },
    {
        "id": "computer-vision",
        "name": "Computer Vision",
        "category": "Artificial Intelligence",
        "difficulty": "Advanced",
        "description": "Image recognition, object detection, segmentation, and vision-language models.",
        "prerequisites": ["deep-learning"],
        "relatedSkills": ["deep-learning", "nlp"],
        "careerPaths": ["Computer Vision Engineer", "AI Engineer", "Robotics Engineer"],
        "projects": [
            {"id": "proj-cv-1", "title": "Face Detection App", "difficulty": "Intermediate"},
            {"id": "proj-cv-2", "title": "Object Counter", "difficulty": "Advanced"}
        ],
        "resourceIds": ["res-cv-course"],
        "inRoadmap": False
    },
    {
        "id": "sql",
        "name": "SQL",
        "category": "Data Science",
        "difficulty": "Beginner",
        "description": "Relational database querying, joins, aggregations, and data manipulation.",
        "prerequisites": [],
        "relatedSkills": ["python", "statistics"],
        "careerPaths": ["Data Analyst", "Data Engineer", "Data Scientist"],
        "projects": [
            {"id": "proj-sql-1", "title": "E-commerce Analytics Dashboard", "difficulty": "Beginner"}
        ],
        "resourceIds": ["res-sql-tutorial"],
        "inRoadmap": False
    }
]

SEED_RESOURCES = [
    {
        "id": "res-python-crash",
        "title": "Python Crash Course — Full Beginner Tutorial",
        "provider": "YouTube",
        "type": "video",
        "rating": 4.9,
        "durationHours": 6.0,
        "duration": "6h",
        "difficulty": "Beginner",
        "skillId": "python",
        "relatedSkillId": "python",
        "roadmapNodeId": "python",
        "relatedNodeId": "python",
        "description": "A comprehensive crash course covering Python fundamentals: variables, loops, functions, OOP, and file I/O.",
        "topics": ["Variables & Types", "Control Flow", "Functions", "OOP", "Modules"],
        "whyRecommended": "Directly matches your Python foundation milestone. Beginner-friendly and highly rated.",
        "reason": "Matches foundational milestone",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-python-docs",
        "title": "Official Python Documentation",
        "provider": "Documentation",
        "type": "documentation",
        "rating": 4.7,
        "durationHours": None,
        "duration": "Self-paced",
        "difficulty": "All Levels",
        "skillId": "python",
        "relatedSkillId": "python",
        "roadmapNodeId": "python",
        "relatedNodeId": "python",
        "description": "The official Python language reference and library documentation.",
        "topics": ["Language Reference", "Standard Library", "Built-ins"],
        "whyRecommended": "Essential reference for Python development at any level.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-numpy-tutorial",
        "title": "NumPy Complete Tutorial for Beginners",
        "provider": "YouTube",
        "type": "video",
        "rating": 4.8,
        "durationHours": 4.0,
        "duration": "4h",
        "difficulty": "Beginner",
        "skillId": "numpy",
        "relatedSkillId": "numpy",
        "roadmapNodeId": "numpy",
        "relatedNodeId": "numpy",
        "description": "Learn NumPy from scratch: arrays, indexing, broadcasting, and linear algebra operations.",
        "topics": ["Arrays", "Indexing", "Broadcasting", "Linear Algebra", "Random"],
        "whyRecommended": "Matches your NumPy milestone and builds directly on your Python knowledge.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-stats-course",
        "title": "Statistics for Machine Learning — Specialization",
        "provider": "Coursera",
        "type": "course",
        "rating": 4.7,
        "durationHours": 20.0,
        "duration": "20h",
        "difficulty": "Intermediate",
        "skillId": "statistics",
        "relatedSkillId": "statistics",
        "roadmapNodeId": "statistics",
        "relatedNodeId": "statistics",
        "description": "Probability theory, statistical distributions, hypothesis testing, and Bayesian inference for ML practitioners.",
        "topics": ["Probability", "Distributions", "Hypothesis Testing", "Bayesian Statistics", "Regression"],
        "whyRecommended": "Directly supports your current Statistics milestone on the roadmap.",
        "saved": True,
        "url": "#mock-resource"
    },
    {
        "id": "res-ml-full-course",
        "title": "Machine Learning Full Course 2024",
        "provider": "YouTube",
        "type": "video",
        "rating": 4.8,
        "durationHours": 12.0,
        "duration": "12h",
        "difficulty": "Intermediate",
        "skillId": "machine-learning",
        "relatedSkillId": "machine-learning",
        "roadmapNodeId": "machine-learning",
        "relatedNodeId": "machine-learning",
        "description": "Complete ML tutorial covering supervised learning, unsupervised learning, model evaluation, and Scikit-learn.",
        "topics": ["Linear Regression", "Decision Trees", "SVM", "Clustering", "Model Evaluation"],
        "whyRecommended": "Matches your upcoming Machine Learning milestone. Highly rated and practical.",
        "saved": False,
        "url": "#mock-resource",
        "progress": 80,
        "currentTopic": "Model Evaluation",
        "nextTopic": "Cross-Validation"
    },
    {
        "id": "res-ml-textbook",
        "title": "Hands-On Machine Learning with Scikit-Learn & TensorFlow",
        "provider": "Coursera",
        "type": "course",
        "rating": 4.9,
        "durationHours": 40.0,
        "duration": "40h",
        "difficulty": "Intermediate",
        "skillId": "machine-learning",
        "relatedSkillId": "machine-learning",
        "roadmapNodeId": "machine-learning",
        "relatedNodeId": "machine-learning",
        "description": "Industry-standard ML course with hands-on projects using Scikit-Learn, Keras, and TensorFlow.",
        "topics": ["Scikit-Learn", "TensorFlow", "Keras", "Neural Networks", "Production ML"],
        "whyRecommended": "Comprehensive coverage of your Machine Learning milestone with production focus.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-dl-specialization",
        "title": "Deep Learning Specialization",
        "provider": "Coursera",
        "type": "course",
        "rating": 4.9,
        "durationHours": 60.0,
        "duration": "60h",
        "difficulty": "Advanced",
        "skillId": "deep-learning",
        "relatedSkillId": "deep-learning",
        "roadmapNodeId": "deep-learning",
        "relatedNodeId": "deep-learning",
        "description": "5-course specialization covering neural networks, CNNs, RNNs, and structuring ML projects.",
        "topics": ["Neural Networks", "CNNs", "RNNs", "Optimization", "Sequence Models"],
        "whyRecommended": "The gold standard for deep learning education. Directly maps to your roadmap.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-genai-course",
        "title": "Generative AI with Large Language Models",
        "provider": "Coursera",
        "type": "course",
        "rating": 4.8,
        "durationHours": 16.0,
        "duration": "16h",
        "difficulty": "Advanced",
        "skillId": "generative-ai",
        "relatedSkillId": "generative-ai",
        "roadmapNodeId": "generative-ai",
        "relatedNodeId": "generative-ai",
        "description": "LLM architecture, fine-tuning, RLHF, RAG, and deploying generative AI applications.",
        "topics": ["Transformers", "Fine-tuning", "RLHF", "RAG", "Deployment"],
        "whyRecommended": "Directly addresses your Generative AI milestone — the most in-demand skill for AI Engineers.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-mlops-course",
        "title": "MLOps Fundamentals",
        "provider": "Udemy",
        "type": "course",
        "rating": 4.6,
        "durationHours": 15.0,
        "duration": "15h",
        "difficulty": "Intermediate",
        "skillId": "mlops",
        "relatedSkillId": "mlops",
        "roadmapNodeId": "mlops",
        "relatedNodeId": "mlops",
        "description": "MLflow, model serving, CI/CD pipelines, monitoring, and production deployment patterns.",
        "topics": ["MLflow", "Docker", "Model Serving", "Monitoring", "CI/CD"],
        "whyRecommended": "Supports your MLOps milestone and prepares you for production AI engineering.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-nlp-course",
        "title": "Natural Language Processing Specialization",
        "provider": "Coursera",
        "type": "course",
        "rating": 4.7,
        "durationHours": 50.0,
        "duration": "50h",
        "difficulty": "Advanced",
        "skillId": "nlp",
        "relatedSkillId": "nlp",
        "roadmapNodeId": "nlp",
        "relatedNodeId": "nlp",
        "description": "Sentiment analysis, machine translation, transformers, and attention mechanisms.",
        "topics": ["Tokenization", "Word Embeddings", "Transformers", "BERT", "GPT"],
        "whyRecommended": "NLP is a valuable related skill for your AI Engineer target role.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-cv-course",
        "title": "Computer Vision with Deep Learning",
        "provider": "Udemy",
        "type": "course",
        "rating": 4.7,
        "durationHours": 20.0,
        "duration": "20h",
        "difficulty": "Advanced",
        "skillId": "computer-vision",
        "relatedSkillId": "computer-vision",
        "roadmapNodeId": "computer-vision",
        "relatedNodeId": "computer-vision",
        "description": "Object detection, image segmentation, and vision model deployment with PyTorch.",
        "topics": ["CNNs", "YOLO", "Segmentation", "Transfer Learning", "PyTorch"],
        "whyRecommended": "Expands your AI skillset into vision systems, complementing your ML foundation.",
        "saved": False,
        "url": "#mock-resource"
    },
    {
        "id": "res-sql-tutorial",
        "title": "SQL for Data Analysis — Complete Course",
        "provider": "YouTube",
        "type": "video",
        "rating": 4.6,
        "durationHours": 8.0,
        "duration": "8h",
        "difficulty": "Beginner",
        "skillId": "sql",
        "relatedSkillId": "sql",
        "roadmapNodeId": "sql",
        "relatedNodeId": "sql",
        "description": "SQL queries, joins, window functions, and analytical SQL for data professionals.",
        "topics": ["SELECT", "JOINs", "Aggregations", "Window Functions", "CTEs"],
        "whyRecommended": "SQL is an important supporting skill for data-intensive AI engineering work.",
        "saved": False,
        "url": "#mock-resource"
    }
]

SEED_PROGRESS = {
    "learnerId": "demo-learner",
    "overall": 32,
    "overallProgress": 32,
    "readiness": 78,
    "learningHours": 42.0,
    "topicsCompleted": 18,
    "streak": 7,
    "currentStreak": 7,
    "skillProgress": [
        {"skillId": "python", "name": "Python", "progress": 90, "status": "completed", "hoursSpent": 20.0},
        {"skillId": "sql", "name": "SQL", "progress": 85, "status": "completed", "hoursSpent": 15.0},
        {"skillId": "git", "name": "Git", "progress": 85, "status": "completed", "hoursSpent": 8.0},
        {"skillId": "numpy", "name": "NumPy", "progress": 85, "status": "completed", "hoursSpent": 10.0},
        {"skillId": "statistics", "name": "Statistics", "progress": 60, "status": "in_progress", "hoursSpent": 12.0},
        {"skillId": "machine-learning", "name": "Machine Learning", "progress": 45, "status": "in_progress", "hoursSpent": 15.0},
        {"skillId": "deep-learning", "name": "Deep Learning", "progress": 10, "status": "locked", "hoursSpent": 0.0},
        {"skillId": "generative-ai", "name": "Generative AI", "progress": 0, "status": "locked", "hoursSpent": 0.0},
    ],
    "weeklyActivity": [
        {"day": "Mon", "hours": 2.0},
        {"day": "Tue", "hours": 1.0},
        {"day": "Wed", "hours": 3.0},
        {"day": "Thu", "hours": 2.0},
        {"day": "Fri", "hours": 4.0},
        {"day": "Sat", "hours": 1.0},
        {"day": "Sun", "hours": 0.0},
    ],
    "milestones": [
        {"id": "ms-python", "title": "Python Fundamentals", "status": "completed", "progress": 100, "completedDate": "2024-06-15"},
        {"id": "ms-numpy", "title": "NumPy Mastery", "status": "completed", "progress": 100, "completedDate": "2024-06-28"},
        {"id": "ms-git", "title": "Git & GitHub", "status": "completed", "progress": 100, "completedDate": "2024-07-05"},
        {"id": "ms-stats", "title": "Statistics Foundations", "status": "in_progress", "progress": 60, "completedDate": None},
        {"id": "ms-ml", "title": "Machine Learning Core", "status": "not_started", "progress": 0, "completedDate": None},
        {"id": "ms-dl", "title": "Deep Learning", "status": "not_started", "progress": 0, "completedDate": None},
    ],
    "nextAction": {
        "title": "Model Evaluation Basics",
        "description": "Learn how to properly evaluate ML model performance using cross-validation and common metrics.",
        "estimatedMinutes": 45,
        "whyImportant": "Completing this unlocks the next Machine Learning milestone and prepares you for the Statistics assessment.",
        "resourceId": "res-ml-full-course",
        "skillId": "machine-learning"
    }
}

async def seed_database():
    """Idempotently seeds the demo learner, roadmap, skills, resources, and progress."""
    logger.info("Starting idempotent database seeding...")
    await connect_to_mongo()
    await create_indexes()

    # 1. Seed Demo Learner (under 'demo-learner' and 'alex-morgan')
    await LearnerRepository.upsert(SEED_LEARNER)
    learner_copy = dict(SEED_LEARNER)
    learner_copy["id"] = "alex-morgan"
    await LearnerRepository.upsert(learner_copy)
    logger.info("Seeded demo learner.")

    # 2. Seed Roadmap
    await RoadmapRepository.upsert(SEED_ROADMAP)
    logger.info("Seeded AI Engineer roadmap.")

    # 3. Seed Skills
    skills_count = await SkillRepository.upsert_many(SEED_SKILLS)
    logger.info(f"Seeded {skills_count} skills.")

    # 4. Seed Resources
    resources_count = await ResourceRepository.upsert_many(SEED_RESOURCES)
    logger.info(f"Seeded {resources_count} resources.")

    # 5. Seed Progress
    await ProgressRepository.upsert(SEED_PROGRESS)
    progress_copy = dict(SEED_PROGRESS)
    progress_copy["learnerId"] = "alex-morgan"
    await ProgressRepository.upsert(progress_copy)
    logger.info("Seeded progress records.")

    logger.info("Database seeding completed successfully.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_database())
