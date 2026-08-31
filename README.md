# LearnPath — AI-Powered Personalized Learning Path Recommender
**HCLTech Amplified 2.0 — Hackathon Submission**

LearnPath is an end-to-end intelligent career companion that answers:
- **WHAT** you need to learn,
- **WHY** you need it,
- **IN WHAT ORDER** (with prerequisite graph validation),
- **WHICH resources are best** (via RAG and YouTube ranking),
- **WHETHER your timeline is realistic** (via timeline reality checking),
- **HOW ready you actually are** (via 7-dimension learning readiness scoring), and
- **WHETHER you can demonstrate that knowledge** (via AI Mock Interview Simulator).

---

## 🏗 Complete Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      Frontend Application (React 18)    │
                                  │  Vite + Tailwind CSS + Lucide Icons     │
                                  └────────────────────┬────────────────────┘
                                                       │
                                            Axios / API Client Layer
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │       FastAPI Backend Application       │
                                  │  (Python 3.12 + Async Motor Driver)     │
                                  └────────────────────┬────────────────────┘
                                                       │
        ┌───────────────────┬──────────────────────────┼─────────────────────────┬───────────────────┐
        ▼                   ▼                          ▼                         ▼                   ▼
┌───────────────┐   ┌───────────────┐          ┌───────────────┐         ┌───────────────┐   ┌───────────────┐
│ Roadmap Engine│   │  Skill Graph  │          │   Readiness   │         │ AI Interview  │   │  Gemini / AI  │
│ & Pruning     │   │  & Gap Engine │          │    Engine     │         │   Simulator   │   │   Assistant   │
└───────┬───────┘   └───────┬───────┘          └───────┬───────┘         └───────┬───────┘   └───────┬───────┘
        │                   │                          │                         │                   │
        └───────────────────┴──────────────────────────┼─────────────────────────┴───────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
              ┌─────────────────────────┐                             ┌─────────────────────────┐
              │    MongoDB Database     │                             │  External Intelligence  │
              │   (`learnpath` database)│                             │  - Google Gemini API    │
              │   - `learners`          │                             │  - YouTube Data API v3  │
              │   - `roadmaps`          │                             │  - Vector / RAG Ingest  │
              │   - `skills`            │                             │  - Groq Llama-3         │
              │   - `progress`          │                             └─────────────────────────┘
              │   - `resources`         │
              │   - `interview_sessions`│
              └─────────────────────────┘
```

---

## 🔄 The Complete LearnPath Loop

$$\text{GOAL} \to \text{PROFILE} \to \text{SKILL GRAPH} \to \text{SKILL GAP} \to \text{REALITY CHECK} \to \text{ROADMAP} \to \text{RESOURCES} \to \text{LEARNING} \to \text{PROGRESS} \to \text{READINESS} \to \text{INTERVIEW} \to \text{EVALUATION} \to \text{NEXT ACTIONS} \to \text{LEARNING}$$

1. **Goal & Profile**: Learner sets target role (e.g. `AI Engineer`), weekly study hours ($10-15\text{ h/wk}$), and timeline ($4\text{ months}$).
2. **Skill Graph & Gap Analysis**: Distinguishes verified known skills from required role competencies, classifying actionable vs blocked gaps.
3. **Timeline Reality Check**: Audits total workload hours ($180\text{ h}$) against available hours ($160\text{ h}$) to verify feasibility (`REALISTIC`).
4. **Personalized Roadmap**: Prunes mastered topics, gates blocked prerequisites, and highlights mandatory vs optional nodes.
5. **RAG & YouTube Resource Hub**: Fetches grounded learning tutorials with verifiable YouTube video IDs, durations, channels, and citation links.
6. **Progress & Learning**: Learner completes nodes, advancing progress metrics across the entire application without full-page reloads.
7. **Job Readiness Scoring**: Calculates a 7-dimension weighted readiness score ($0-100\%$) with dynamic missing-weight normalization.
8. **AI Mock Interview Simulator**: Conducts personalized 6-question adaptive technical interviews, evaluating answers across 5 weighted dimensions and generating targeted follow-ups.
9. **Feedback Loop & Recommendations**: Interview weaknesses recommend targeted review topics and video resources.
10. **Conversational Assistant**: Gemini assistant accesses real learner state to explain roadmaps, readiness, and interview performance.

---

## 🌐 Frontend Routes

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/dashboard` | `Dashboard.tsx` | Central command center (Goal, Progress, Readiness, Interview, Gaps, Next Action) |
| `/roadmap` | `Roadmap.tsx` | Visual interactive roadmap with importance tags, status toggles, and pruning |
| `/roadmap/:roadmapId` | `RoadmapDetail.tsx` | Detailed topic node view with resources, prerequisites, and completion toggle |
| `/readiness` | `Readiness.tsx` | 7-dimension readiness scorecard, gating signals, and explanation cards |
| `/interview` | `Interview.tsx` | AI Mock Interview hub with readiness gauge and past interview history |
| `/interview/setup` | `InterviewSetup.tsx` | Customizable interview configuration (format, adaptive difficulty, weak topics) |
| `/interview/session/:id` | `InterviewSession.tsx` | Live conversational interview simulator with timer, evaluation, and follow-ups |
| `/interview/results/:id` | `InterviewResults.tsx` | Final performance report, sub-scores, strengths, and RAG resource citations |
| `/explore` | `ExploreSkills.tsx` | Interactive skill graph ontology, dependency paths, and gap analyzer |
| `/learning` | `Learning.tsx` | Curated RAG and YouTube resource directory with ratings and citation links |
| `/progress` | `Progress.tsx` | Visual streak tracker, completed topics, weekly velocity, and achievements |
| `/assistant` | `Assistant.tsx` | Grounded Gemini AI learning assistant with chat conversations |
| `/profile` | `Profile.tsx` | Learner identity, target career goal, and weekly study bandwidth |

---

## ⚡ Backend REST Endpoints

### 1. Learner Profile
- `GET /api/learner/profile` — Retrieves demo learner profile.
- `PATCH /api/learner/profile` — Updates learner goals, target role, and study hours.

### 2. Roadmap Engine
- `GET /api/roadmap` — Returns active roadmap for current learner.
- `GET /api/roadmap/personalized` — Returns personalized roadmap with blocked states and importance levels.
- `PATCH /api/roadmap/{id}/nodes/{nodeId}` — Updates node status (`not_started`, `in_progress`, `completed`, `skipped`).
- `DELETE /api/roadmap/{id}/nodes/{nodeId}` — Prunes/removes node from personalized roadmap.

### 3. Skill Graph & Ontologies
- `GET /api/skills` — Returns all indexed skills with categories and prerequisites.
- `GET /api/skills/graph` — Returns graph nodes and directed dependency edges.
- `GET /api/skills/paths/shortest` — Finds topological learning path between two skills.

### 4. Skill Gap & Reality Check
- `GET /api/gaps` — Audits target role requirements against learner skills (known, actionable, blocked).
- `GET /api/reality-check` — Computes workload feasibility ratio and adjustment options.

### 5. Recommendations
- `GET /api/recommendations` — Returns prioritized next recommendations with explainability rationale.
- `GET /api/recommendations/next` — Returns top unblocked Next Best Actions.

### 6. Resources & YouTube
- `GET /api/resources` — Queries curated learning resources with RAG citations.
- `GET /api/resources/youtube/search` — Fetches ranked YouTube tutorials using YouTube Data API v3.
- `POST /api/resources/feedback` — Ingests learner feedback for adaptive ranking.

### 7. Job Readiness Scoring
- `GET /api/readiness/{learnerId}` — Evaluates 7-dimension weighted readiness score and gating status.

### 8. AI Mock Interview Simulator
- `POST /api/interviews` — Initializes personalized mock interview session with question queue.
- `GET /api/interviews/{sessionId}` — Retrieves session state and current question.
- `GET /api/interviews/{sessionId}/current` — Returns active question (hiding secret expected concepts).
- `POST /api/interviews/{sessionId}/answer` — Evaluates candidate answer across 5 weighted dimensions.
- `POST /api/interviews/{sessionId}/follow-up` — Evaluates targeted follow-up response.
- `POST /api/interviews/{sessionId}/next` — Advances to next question.
- `POST /api/interviews/{sessionId}/complete` — Produces final performance report with RAG citations.
- `GET /api/interviews/history/{learnerId}` — Lists past interview sessions.

### 9. AI Conversational Assistant
- `POST /api/assistant/chat` — Conversational Q&A grounded in live learner profile, roadmap, and interview results.

---

## 🛠 Local Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0+
- **Python**: v3.10+
- **MongoDB**: Running locally at `mongodb://localhost:27017`

### 2. Backend Setup
```powershell
cd E:\HCL-Amplified-2.0-main\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (if needed)
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```powershell
cd E:\HCL-Amplified-2.0-main\frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```
- Open `http://localhost:5173` or `http://localhost:5174` in your browser.

---

## 🧪 Automated Testing

To run the complete end-to-end integration and regression suite:
```powershell
cd E:\HCL-Amplified-2.0-main\backend

# Run Part 12 E2E Product Journey Test
.\venv\Scripts\python.exe -u test_part12_e2e_integration.py

# Run Part 11 AI Interview Simulator Test
.\venv\Scripts\python.exe -u test_part11_interviews.py

# Run Part 10 Readiness Scoring Test
.\venv\Scripts\python.exe -u test_part10_readiness.py
```

---

## 🔒 Security & Data Integrity
- **No Hardcoded Secrets**: All API keys reside exclusively in `backend/.env`.
- **Untrusted Answer Delimitation**: Candidate answers in mock interviews are evaluated in isolated delimiters (`<candidate_answer>`) to defend against prompt injection.
- **Expected Concepts Concealment**: Hidden evaluation rubrics (`expectedConcepts`) are strictly stripped from client question payloads.
- **Non-Destructive Feedback**: Interview weaknesses recommend targeted review topics; they never delete or mutate canonical roadmap structures without learner consent.

---

## 🚀 Demo Flow (14 Steps)
1. **Dashboard**: Observe `AI Engineer` goal, timeline feasibility (`REALISTIC`), and Next Best Action.
2. **Roadmap**: View mandatory vs optional priority tiers. Mark a topic complete and watch progress update live.
3. **Skill Graph**: Explore skill dependencies, prerequisites, and career paths.
4. **Skill Gap Audit**: View actionable gaps vs blocked gaps requiring prerequisites.
5. **Recommendations**: View personalized Next Best Actions with explainability rationale.
6. **Learning Resources**: Browse RAG-retrieved materials and YouTube tutorials with real video durations and citations.
7. **Readiness Score**: Inspect the 7-dimension readiness scorecard and interview eligibility signal.
8. **Interview Simulator**: Start a mock interview session.
9. **Interactive Answering**: Answer technical questions, view multi-factor sub-scores, strengths, and weaknesses.
10. **Targeted Follow-Up**: Receive an adaptive follow-up probing question on missing concepts.
11. **Final Interview Report**: Review overall score, skill-wise performance, and RAG/YouTube recommendations for missed concepts.
12. **Return to Dashboard**: Verify that the latest interview score and performance appear on the dashboard.
13. **AI Assistant**: Ask *"How did I perform in my interview?"* or *"What should I learn next?"* to see grounded responses.
14. **Persistence**: Refresh browser or restart backend — all learner milestones, roadmap states, and interview records persist in MongoDB.
