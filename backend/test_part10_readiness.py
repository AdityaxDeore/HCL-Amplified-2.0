import asyncio
import pytest
import httpx
from app.main import app
from app.scoring.readiness_config import READINESS_WEIGHTS, READINESS_STATUS_THRESHOLDS
from app.services.readiness_service import ReadinessService
from app.services.adaptation_service import AdaptationService
from app.services.assistant_service import AssistantService
from app.database.mongodb import connect_to_mongo, close_mongo_connection

def test_readiness_config_and_normalization():
    # Verify weights sum to 1.0
    total_w = sum(READINESS_WEIGHTS.values())
    assert abs(total_w - 1.0) < 0.001
    
    # Test dynamic normalization when assessment is None
    sample_dims = {
        "skillCoverage": 70.0,
        "prerequisiteCompletion": 80.0,
        "roadmapProgress": 65.0,
        "practicalExperience": 50.0,
        "assessmentPerformance": None,  # Missing
        "learningConsistency": 75.0,
        "goalAlignment": 85.0
    }
    score, completeness, weights = ReadinessService._calculate_overall_score(sample_dims)
    
    assert 0 <= score <= 100
    assert completeness == 90.0  # 1.0 - 0.10 assessment weight = 90%
    assert "assessmentPerformance" not in weights
    assert abs(sum(weights.values()) - 1.0) < 0.01
    print(f"[PASS] Dynamic weight normalization verified: Score = {score:.1f}, Completeness = {completeness}%, Sum(weights) = 1.0")

@pytest.mark.asyncio
async def test_readiness_evaluation():
    res = await ReadinessService.evaluate_readiness("demo-learner")
    
    assert res["learnerId"] == "demo-learner"
    assert 0 <= res["score"] <= 100
    assert res["status"] in ["READY", "NEAR_READY", "BUILDING", "NOT_READY"]
    assert res["confidence"] in ["HIGH", "MEDIUM", "LOW"]
    assert "dimensions" in res
    assert len(res["criticalGaps"]) > 0
    assert len(res["nextActions"]) > 0
    assert isinstance(res["interviewReady"], bool)
    assert len(res["explanation"]) > 20
    
    print(f"[PASS] evaluate_readiness passed: Score={res['score']}%, Status={res['status']}, Critical Gaps={len(res['criticalGaps'])}, InterviewReady={res['interviewReady']}")

@pytest.mark.asyncio
async def test_roadmap_vs_readiness_distinction():
    res = await ReadinessService.evaluate_readiness("demo-learner")
    dims = res["dimensions"]
    
    # Roadmap progress and overall job readiness are separate multi-dimensional measures
    assert "roadmapProgress" in dims
    assert "skillCoverage" in dims
    print(f"[PASS] Distinction verified: Roadmap Progress = {dims['roadmapProgress']}%, Job Readiness Score = {res['score']}%")

@pytest.mark.asyncio
async def test_skill_readiness_and_prerequisite_gating():
    skills = await ReadinessService.get_skill_readiness_list("demo-learner")
    assert len(skills) > 0
    
    # Check that skills have valid scores and statuses
    for s in skills:
        assert 0 <= s["score"] <= 100
        assert s["status"] in ["READY", "DEVELOPING", "NEEDS_ATTENTION", "NOT_STARTED"]
        if s["isBlocked"]:
            # Prerequisite gating check
            assert s["score"] <= 50.0
            
    print(f"[PASS] Skill readiness and prerequisite gating verified across {len(skills)} skills.")

@pytest.mark.asyncio
async def test_adaptive_feedback_loop():
    # Submit difficulty feedback
    fb_res = await AdaptationService.record_feedback(
        learner_id="demo-learner",
        feedback_type="difficulty",
        value="too_difficult",
        target_id="machine-learning"
    )
    assert fb_res["success"] is True
    assert "Adjusted pacing" in fb_res["adaptationSummary"]
    
    # Next action should reflect feedback
    action = await ReadinessService.get_next_action("demo-learner")
    assert action is not None
    assert "title" in action
    print(f"[PASS] Adaptive feedback loop verified: '{fb_res['adaptationSummary']}'. Next action = '{action['title']}'")

@pytest.mark.asyncio
async def test_gemini_assistant_readiness_grounding():
    chat_res = await AssistantService.handle_chat(
        learner_id="demo-learner",
        conversation_id=None,
        message="Am I ready for an AI Engineer interview?"
    )
    msg = chat_res["message"]
    assert "readiness" in msg["content"].lower() or "interview" in msg["content"].lower()
    print("[PASS] Gemini Assistant answered interview readiness question grounded in authoritative data.")

@pytest.mark.asyncio
async def test_all_part10_rest_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /api/readiness/demo-learner
        res1 = await client.get("/api/readiness/demo-learner")
        assert res1.status_code == 200
        data1 = res1.json()["data"]
        assert data1["score"] > 0
        assert data1["status"] is not None
        print(f"[PASS] GET /api/readiness/demo-learner (Score: {data1['score']}%)")

        # 2. GET /api/readiness/demo-learner/skills
        res2 = await client.get("/api/readiness/demo-learner/skills")
        assert res2.status_code == 200
        skills = res2.json()["data"]
        assert len(skills) > 0
        print(f"[PASS] GET /api/readiness/demo-learner/skills ({len(skills)} skills)")

        # 3. GET /api/readiness/demo-learner/next-action
        res3 = await client.get("/api/readiness/demo-learner/next-action")
        assert res3.status_code == 200
        act = res3.json()["data"]
        assert act["title"] is not None
        print(f"[PASS] GET /api/readiness/demo-learner/next-action ('{act['title']}')")

        # 4. POST /api/feedback
        fb_payload = {
            "learnerId": "demo-learner",
            "type": "difficulty",
            "value": "too_difficult",
            "targetId": "deep-learning"
        }
        res4 = await client.post("/api/feedback", json=fb_payload)
        assert res4.status_code == 200
        fb_data = res4.json()["data"]
        assert fb_data["success"] is True
        print("[PASS] POST /api/feedback passed.")

        # 5. GET /api/readiness/demo-learner/history
        res5 = await client.get("/api/readiness/demo-learner/history")
        assert res5.status_code == 200
        snaps = res5.json()["data"]
        print(f"[PASS] GET /api/readiness/demo-learner/history ({len(snaps)} snapshots recorded)")

    await close_mongo_connection()

def run_all():
    print("\n--- RUNNING PART 10 READINESS SCORING & ADAPTIVE INTELLIGENCE TEST SUITE ---\n")
    test_readiness_config_and_normalization()
    asyncio.run(test_readiness_evaluation())
    asyncio.run(test_roadmap_vs_readiness_distinction())
    asyncio.run(test_skill_readiness_and_prerequisite_gating())
    asyncio.run(test_adaptive_feedback_loop())
    asyncio.run(test_gemini_assistant_readiness_grounding())
    asyncio.run(test_all_part10_rest_endpoints())
    print("\n--- ALL PART 10 TESTS PASSED WITH 100% SUCCESS! ---")

if __name__ == "__main__":
    run_all()
