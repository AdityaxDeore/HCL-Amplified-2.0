# LearnPath — AI-Powered Personalized Learning Path Recommender
**HCLTech Amplified 2.0 Hackathon**

LearnPath is an intelligent learning companion that guides learners toward their career goals with structured roadmaps, curated resources, and progress tracking.

---

## 🏗 Architecture Overview

```
Frontend (React + Vite + Tailwind CSS)
   │
   ▼
API Client Layer (frontend/src/api/)
   │
   ▼
FastAPI Route Layer (backend/app/routes/)
   │
   ▼
Service Layer (backend/app/services/)
   │
   ▼
Repository Layer (backend/app/repositories/)
   │
   ▼
MongoDB (learnpath database)
```

- **Routes**: Thin endpoints responsible solely for request/response serialization and HTTP status codes.
- **Services**: Pure business logic, deterministic calculations, and multi-repository orchestration.
- **Repositories**: Direct MongoDB data access via async `motor` driver with indexing and safe ObjectId serialization.
- **Roadmap Loader**: Reusable loader parsing 96+ roadmap.sh JSON datasets from `roadmaps/` dynamically.

---

## 📋 Technology Stack

- **Backend**: Python 3.12, FastAPI, Pydantic v2, Motor (Async MongoDB), Uvicorn
- **Database**: MongoDB (`learnpath` database)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Workspace Model**: Single demo learner workspace (`demo-learner` / `alex-morgan`) with no authentication requirements.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (3.10+)
- **MongoDB** running on `mongodb://localhost:27017`

---

### 2. Backend Setup & Running

```powershell
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Seed the database (idempotent upsert)
python -m app.database.seed

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend server will run at `http://localhost:8000`.

- **Swagger API Documentation**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`
- **Health Check**: `http://localhost:8000/api/health`

---

### 3. Frontend Setup & Running

```powershell
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Configure environment
cp .env.example .env

# Start the Vite development server
npm run dev
```

The frontend application will open at `http://localhost:5173`.

---

## 🔌 API Endpoints Summary

All API responses strictly adhere to standard envelopes:
- **Object**: `{ "data": { ... } }`
- **List**: `{ "data": [ ... ], "count": N }`
- **Error**: `{ "error": { "code": "...", "message": "..." } }`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health and database connectivity status |
| `GET` | `/api/learner` | Get current demo learner |
| `GET` | `/api/learner/profile` | Get learner profile |
| `PUT` | `/api/learner/profile` | Update editable profile attributes |
| `GET` | `/api/roadmap` | Get learner's active roadmap |
| `GET` | `/api/roadmap/{id}` | Get specific roadmap by ID |
| `PUT` | `/api/roadmap/{id}` | Update roadmap metadata |
| `PATCH` | `/api/roadmap/{id}/nodes/{nodeId}` | Mutate node status, importance, or order |
| `DELETE` | `/api/roadmap/{id}/nodes/{nodeId}` | Remove node from personalized roadmap |
| `GET` | `/api/skills` | List skills (optional `category`, `difficulty` filters) |
| `GET` | `/api/skills/search?q=` | Search skills by keyword |
| `GET` | `/api/skills/{id}` | Get skill details |
| `GET` | `/api/resources` | List resources (filters: `skill_id`, `type`, `provider`, etc.) |
| `GET` | `/api/resources/{id}` | Get resource details |
| `GET` | `/api/progress` | Get learner progress metrics and weekly activity |
| `PATCH` | `/api/progress` | Update progress metrics |
| `GET` | `/api/dashboard` | Aggregated payload of learner, roadmap, progress, nextAction |

---

## 🧪 Testing Backend Integration

Run the integration test suite:

```powershell
cd backend
python test_api.py
```
