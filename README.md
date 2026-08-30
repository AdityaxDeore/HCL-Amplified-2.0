# AI-Powered Personalized Learning Path Recommender

This repository contains the initial full-stack structure for the AI-Powered Personalized Learning Path Recommender.

## Project Structure

- **frontend/**: React + Vite + Tailwind CSS application. Features a modern, responsive dashboard with a rich aesthetic.
- **backend/**: FastAPI + MongoDB (Motor) application. Provides REST APIs to serve the frontend and integrates AI services.

## Prerequisites

- Node.js (v22+)
- Python (3.10+)

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at http://localhost:5173.

## Running the Backend

```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (Unix/MacOS)
source venv/bin/activate

pip install -r requirements.txt # (Dependencies include fastapi, uvicorn, pydantic, motor, python-dotenv)
uvicorn app.main:app --reload
```

The backend will start at http://localhost:8000.
Swagger UI is available at http://localhost:8000/docs.
