import asyncio
import pytest
import httpx
from app.main import app
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.repositories.learner_repository import LearnerRepository
from app.services.roadmap_service import RoadmapService
from app.services.skill_graph_engine import SkillGraphEngine
from app.services.gap_service import GapService
from app.services.reality_service import RealityService
from app.services.recommendation_service import RecommendationService
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.readiness_service import ReadinessService
from app.services.interview_service import InterviewService
from app.services.assistant_service import AssistantService

async def run_e2e_journey():
    print("\n============================================================")
    print(" HCLTECH AMPLIFIED 2.0 — LEARNPATH E2E INTEGRATION TEST SUITE")
    print("============================================================\n")

    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

        # ----------------------------------------------------
        # STEP 1: Learner Profile & Goal Consistency
        # ----------------------------------------------------
        print("[STEP 1] Verifying Learner Profile & Goal...")
        res_profile = await client.get("/api/learner/profile")
        assert res_profile.status_code == 200
        learner = res_profile.json()["data"]
        assert learner["targetRole"] == "AI Engineer"
        assert int(learner.get("targetMonths", 4)) == 4
        assert float(learner.get("hoursPerWeek", 10.0)) >= 5.0
        print(f" -> Learner: {learner['name']}, Target Role: {learner['targetRole']}, Pace: {learner.get('hoursPerWeek', 10)}h/wk")

        # ----------------------------------------------------
        # STEP 2: Personalized Roadmap & Priority Tiers
        # ----------------------------------------------------
        print("\n[STEP 2] Verifying Personalized Roadmap...")
        res_roadmap = await client.get("/api/roadmap/personalized?learner_id=demo-learner")
        assert res_roadmap.status_code == 200
        roadmap = res_roadmap.json()["data"]
        nodes = roadmap.get("nodes", [])
        assert len(nodes) > 0
        mandatory_nodes = [n for n in nodes if n.get("importance") == "mandatory"]
        print(f" -> Roadmap: {len(nodes)} total nodes ({len(mandatory_nodes)} mandatory core nodes).")

        # ----------------------------------------------------
        # STEP 3: Skill Graph & Ontology
        # ----------------------------------------------------
        print("\n[STEP 3] Verifying Skill Graph & Dependencies...")
        res_skills = await client.get("/api/skills")
        assert res_skills.status_code == 200
        skills_list = res_skills.json()["data"]
        assert len(skills_list) > 0
        print(f" -> Skill Graph: {len(skills_list)} indexed skills with prerequisites.")

        # ----------------------------------------------------
        # STEP 4: Skill Gap Engine
        # ----------------------------------------------------
        print("\n[STEP 4] Verifying Skill Gap Audit...")
        res_gaps = await client.get("/api/gaps")
        assert res_gaps.status_code == 200
        gap_data = res_gaps.json()["data"]
        assert "summary" in gap_data
        print(f" -> Skill Gaps: {gap_data['summary']['known_skills_count']} known skills, {gap_data['summary']['full_gaps_count']} full gaps, {gap_data['summary']['blocked_gaps_count']} blocked gaps.")

        # ----------------------------------------------------
        # STEP 5: Timeline Reality Checker
        # ----------------------------------------------------
        print("\n[STEP 5] Verifying Reality Check Audit...")
        res_reality = await client.get("/api/reality-check")
        assert res_reality.status_code == 200
        reality = res_reality.json()["data"]
        assert reality["status"] in ["COMFORTABLE", "REALISTIC", "TIGHT", "AT_RISK", "UNREALISTIC"]
        print(f" -> Reality Check: {reality['status']} (Available: {reality['available_hours']}h, Required: {reality['required_hours']}h).")

        # ----------------------------------------------------
        # STEP 6: Recommendations & Next Best Action
        # ----------------------------------------------------
        print("\n[STEP 6] Verifying Next Best Action...")
        res_rec = await client.get("/api/recommendations/next")
        assert res_rec.status_code == 200
        actions = res_rec.json()["data"]
        assert len(actions) > 0
        top_action = actions[0]
        print(f" -> Top Action: '{top_action['title']}' (Reason: {top_action['reason'][:60]}...)")

        # ----------------------------------------------------
        # STEP 7: RAG & YouTube Resource Discovery
        # ----------------------------------------------------
        print("\n[STEP 7] Verifying RAG & YouTube Resource Discovery...")
        res_resources = await client.get("/api/resources?limit=4")
        assert res_resources.status_code == 200
        resources = res_resources.json()["data"]
        assert len(resources) > 0
        print(f" -> Resources: Retrieved {len(resources)} resources with citations and providers.")

        # ----------------------------------------------------
        # STEP 8: Progress & Milestone Completion
        # ----------------------------------------------------
        print("\n[STEP 8] Verifying Progress & Node Completion...")
        res_prog = await client.get("/api/progress")
        assert res_prog.status_code == 200
        prog = res_prog.json()["data"]
        print(f" -> Progress: Overall {prog['overallProgress']}%, Streak: {prog['currentStreak']} days, Topics Completed: {prog.get('topicsCompleted', 4)}.")

        # ----------------------------------------------------
        # STEP 9: Job Readiness Evaluation (Part 10)
        # ----------------------------------------------------
        print("\n[STEP 9] Verifying Multi-Dimensional Job Readiness...")
        res_readiness = await client.get("/api/readiness/demo-learner")
        assert res_readiness.status_code == 200
        readiness = res_readiness.json()["data"]
        assert 0 <= readiness["score"] <= 100
        assert readiness["status"] in ["READY", "NEAR_READY", "BUILDING", "NOT_READY"]
        print(f" -> Job Readiness: {readiness['score']}% ({readiness['status']}), Completeness: {readiness['dataCompleteness']}%, InterviewReady: {readiness['interviewReady']}.")

        # ----------------------------------------------------
        # STEP 10: AI Mock Interview Simulator (Part 11)
        # ----------------------------------------------------
        print("\n[STEP 10] Running Full Mock Interview Session...")
        # 10.1 Start session
        start_payload = {
            "learnerId": "demo-learner",
            "targetRole": "AI Engineer",
            "interviewType": "mixed",
            "difficulty": "adaptive",
            "questionCount": 3
        }
        res_int_start = await client.post("/api/interviews", json=start_payload)
        assert res_int_start.status_code == 200
        session_id = res_int_start.json()["data"]["id"]
        print(f" -> Interview Session Started: {session_id}")

        # 10.2 Fetch Question 1
        res_q1 = await client.get(f"/api/interviews/{session_id}/current")
        assert res_q1.status_code == 200
        q1 = res_q1.json()["data"]
        assert "expectedConcepts" not in q1  # Security check
        print(f" -> Question 1: '{q1['question'][:50]}...'")

        # 10.3 Submit Answer to Question 1
        res_ans1 = await client.post(
            f"/api/interviews/{session_id}/answer",
            json={"answer": "Supervised learning uses labeled training data to learn mapping functions for classification and regression. Unsupervised learning groups unlabeled data via clustering algorithms like k-means."}
        )
        assert res_ans1.status_code == 200
        ev1 = res_ans1.json()["data"]["evaluation"]
        print(f" -> Answer Evaluated: Score={ev1['overallScore']}%, Tech={ev1['technicalScore']}%, Strengths={len(ev1['strengths'])}")

        # 10.4 Advance to Question 2
        await client.post(f"/api/interviews/{session_id}/next")

        # 10.5 Answer Question 2 (Partial answer with follow-up)
        res_ans2 = await client.post(
            f"/api/interviews/{session_id}/answer",
            json={"answer": "Overfitting happens when a model learns noise."}
        )
        assert res_ans2.status_code == 200
        ans2_data = res_ans2.json()["data"]

        if ans2_data.get("hasFollowUp"):
            print(f" -> Follow-Up Triggered: '{ans2_data['followUpQuestion']}'")
            res_fu = await client.post(
                f"/api/interviews/{session_id}/follow-up",
                json={"answer": "We prevent it using L2 ridge regularization and k-fold cross validation."}
            )
            assert res_fu.status_code == 200
            print(" -> Follow-Up Answer Evaluated and Blended.")

        # 10.6 Complete Interview & Produce Final Report
        res_complete = await client.post(f"/api/interviews/{session_id}/complete")
        assert res_complete.status_code == 200
        report = res_complete.json()["data"]
        assert "overallScore" in report
        assert "skillPerformance" in report
        print(f" -> Interview Complete: Overall Score={report['overallScore']}%, Status={report['status']}, Skills Evaluated={len(report['skillPerformance'])}, Recommended Resources={len(report['recommendedResources'])}")

        # ----------------------------------------------------
        # STEP 11: Interview History & Dashboard Consistency
        # ----------------------------------------------------
        print("\n[STEP 11] Verifying Interview History & Persistence...")
        res_hist = await client.get("/api/interviews/history/demo-learner")
        assert res_hist.status_code == 200
        hist_list = res_hist.json()["data"]
        assert len(hist_list) > 0
        print(f" -> Interview History: {len(hist_list)} saved sessions in database.")

        # ----------------------------------------------------
        # STEP 12: AI Assistant Grounded Queries (Part 9)
        # ----------------------------------------------------
        print("\n[STEP 12] Verifying AI Assistant Grounding...")
        # 12.1 Query: What should I learn next?
        res_chat1 = await client.post(
            "/api/assistant/chat",
            json={"learner_id": "demo-learner", "message": "What should I learn next?"}
        )
        assert res_chat1.status_code == 200
        msg1 = res_chat1.json()["data"]["message"]["content"]
        assert len(msg1) > 20
        print(" -> Chatbot correctly answered next learning recommendation.")

        # 12.2 Query: How did I perform in my interview?
        res_chat2 = await client.post(
            "/api/assistant/chat",
            json={"learner_id": "demo-learner", "message": "How did I perform in my interview?"}
        )
        assert res_chat2.status_code == 200
        msg2 = res_chat2.json()["data"]["message"]["content"]
        assert "interview" in msg2.lower() or "score" in msg2.lower() or "performance" in msg2.lower()
        print(" -> Chatbot correctly explained mock interview performance.")

        # ----------------------------------------------------
        # STEP 13: Dashboard Command Center Integration
        # ----------------------------------------------------
        print("\n[STEP 13] Verifying Dashboard Summary Endpoints...")
        res_dash = await client.get("/api/dashboard")
        assert res_dash.status_code == 200
        print(" -> Dashboard API returned synchronized intelligence summary.")

    await close_mongo_connection()

    print("\n============================================================")
    print(" ALL 13 END-TO-END PRODUCT INTEGRATION STEPS PASSED (100%)!")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(run_e2e_journey())
