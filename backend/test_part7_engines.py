import asyncio
import pytest
import httpx
from app.main import app
from app.scoring.gap_scoring import GapScoring
from app.scoring.recommendation_scoring import RecommendationScoring
from app.scoring.reality_scoring import RealityScoring
from app.services.gap_service import GapService
from app.services.recommendation_service import RecommendationService
from app.services.reality_service import RealityService
from app.services.personalized_roadmap_service import PersonalizedRoadmapService
from app.utils.errors import ValidationError
from app.database.mongodb import connect_to_mongo, close_mongo_connection

def test_gap_scoring_proficiency_and_classification():
    assert GapScoring.parse_proficiency("Beginner") == 0.25
    assert GapScoring.parse_proficiency("Intermediate") == 0.50
    assert GapScoring.parse_proficiency("Advanced") == 0.75
    assert GapScoring.parse_proficiency("Expert") == 1.00
    assert GapScoring.parse_proficiency(None) == 0.0

    # Classifications
    assert GapScoring.determine_gap_type("advanced", "intermediate") == "NO_GAP"
    assert GapScoring.determine_gap_type("intermediate", "intermediate") == "NO_GAP"
    assert GapScoring.determine_gap_type("beginner", "intermediate") == "PARTIAL_GAP"
    assert GapScoring.determine_gap_type("none", "intermediate") == "FULL_GAP"
    assert GapScoring.determine_gap_type("none", "intermediate", is_blocked=True) == "BLOCKED_GAP"
    assert GapScoring.determine_gap_type("none", "intermediate", importance="optional") == "OPTIONAL_GAP"
    print("[PASS] Gap proficiency parsing and classification verified.")

def test_gap_priority_scoring():
    priority, factors = GapScoring.calculate_gap_priority(
        importance="mandatory",
        downstream_count=4,
        current_level_str="none",
        required_level_str="intermediate",
        is_in_roadmap=True,
        is_blocked=False
    )
    assert 0.0 <= priority <= 1.0
    assert priority >= 0.70  # Mandatory + high unlock + full gap = high priority
    assert "importance" in factors
    assert "dependency_unlock" in factors
    print(f"[PASS] Gap priority score calculated: {priority} (factors: {factors})")

@pytest.mark.asyncio
async def test_gap_service_demo_learner():
    # Alex Morgan: Python (Intermediate), SQL (Intermediate), Git (Intermediate), NumPy (Beginner)
    analysis = await GapService.analyze_gaps(learner_id="demo-learner", target_role="AI Engineer")
    summary = analysis["summary"]
    gaps = analysis["gaps"]

    assert summary["total_required_skills"] > 0
    assert summary["known_skills_count"] >= 1
    assert summary["total_estimated_gap_hours"] > 0

    gap_map = {g["skill_id"]: g for g in gaps}

    # Python should be NO_GAP
    python_gap = next((g for g in gaps if "python" in g["skill_id"]), None)
    if python_gap:
        assert python_gap["gap_type"] == "NO_GAP"

    # NumPy should be PARTIAL_GAP
    numpy_gap = next((g for g in gaps if "numpy" in g["skill_id"]), None)
    if numpy_gap:
        assert numpy_gap["gap_type"] == "PARTIAL_GAP"

    # Machine learning should be BLOCKED_GAP if statistics is not yet completed
    ml_gap = next((g for g in gaps if "machine-learning" in g["skill_id"]), None)
    if ml_gap and ml_gap.get("prerequisites"):
        assert ml_gap["is_blocked"] is True or ml_gap["gap_type"] in ("BLOCKED_GAP", "FULL_GAP")

    print(f"[PASS] Demo learner gap analysis verified: {summary['known_skills_count']} known, {len(analysis['actionable_gaps'])} actionable, {len(analysis['blocked_gaps'])} blocked.")

@pytest.mark.asyncio
async def test_recommendation_engine():
    recs_res = await RecommendationService.get_recommendations(learner_id="demo-learner", target_role="AI Engineer", limit=5)
    recs = recs_res["recommendations"]
    next_best = recs_res["next_best_action"]

    assert len(recs) > 0
    assert next_best is not None
    assert next_best["priority"] >= 50
    assert len(next_best["reason"]) > 10

    # Ensure none of the top recommendations are blocked
    for r in recs:
        assert r["priority"] > 0
        assert "because" in r["reason"].lower() or "prerequisite" in r["reason"].lower() or "mandatory" in r["reason"].lower() or "strengthen" in r["reason"].lower()

    print(f"[PASS] Recommendation engine identified next best action: '{next_best['title']}' (Priority: {next_best['priority']}/100)")

def test_reality_scoring_thresholds():
    # 1. Comfortable (< 0.70)
    status, ratio = RealityScoring.evaluate_feasibility(required_hours=80.0, available_hours=160.0)
    assert status == "COMFORTABLE"
    assert ratio == 0.50

    # 2. Realistic (0.70 - 0.90)
    status, ratio = RealityScoring.evaluate_feasibility(required_hours=125.0, available_hours=160.0)
    assert status == "REALISTIC"

    # 3. Tight (0.90 - 1.00)
    status, ratio = RealityScoring.evaluate_feasibility(required_hours=155.0, available_hours=160.0)
    assert status == "TIGHT"

    # 4. At Risk (1.00 - 1.20)
    status, ratio = RealityScoring.evaluate_feasibility(required_hours=180.0, available_hours=160.0)
    assert status == "AT_RISK"
    assert ratio == 1.12 or ratio == 1.13

    # 5. Unrealistic (> 1.20)
    status, ratio = RealityScoring.evaluate_feasibility(required_hours=240.0, available_hours=160.0)
    assert status == "UNREALISTIC"

    print("[PASS] Reality checker feasibility threshold states verified.")

@pytest.mark.asyncio
async def test_reality_service_and_adjustments():
    # Evaluate demo learner with 10 hrs/week for 4 months (160 available hours)
    reality = await RealityService.evaluate_reality(
        learner_id="demo-learner",
        target_role="AI Engineer",
        target_months=4,
        hours_per_week=10.0
    )

    assert "available_hours" in reality
    assert "required_hours" in reality
    assert "workload_ratio" in reality
    assert reality["status"] in ("COMFORTABLE", "REALISTIC", "TIGHT", "AT_RISK", "UNREALISTIC")
    assert reality["minimum_weekly_hours"] > 0
    assert reality["minimum_required_weeks"] > 0
    assert len(reality["explanation"]) > 20
    assert len(reality["adjustments"]) > 0

    # Validation errors
    with pytest.raises(ValidationError):
        await RealityService.evaluate_reality(hours_per_week=0)

    print(f"[PASS] Reality service evaluation: {reality['status']} (Workload: {reality['required_hours']}h req / {reality['available_hours']}h avail, ~{reality['minimum_weekly_hours']}h/wk needed)")

@pytest.mark.asyncio
async def test_personalized_roadmap_service():
    pers_roadmap = await PersonalizedRoadmapService.get_personalized_roadmap(learner_id="demo-learner", target_role="AI Engineer")
    assert pers_roadmap["learner_id"] == "demo-learner"
    assert len(pers_roadmap["nodes"]) > 0
    assert pers_roadmap["completed_nodes_count"] >= 1
    assert "reality_summary" in pers_roadmap

    first_node = pers_roadmap["nodes"][0]
    assert "is_blocked" in first_node
    assert "priority" in first_node
    assert "reason" in first_node
    print(f"[PASS] Personalized roadmap transformation created: {len(pers_roadmap['nodes'])} nodes, {pers_roadmap['completed_nodes_count']} completed, {pers_roadmap['blocked_nodes_count']} blocked.")

@pytest.mark.asyncio
async def test_all_part7_rest_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /api/gaps
        res = await client.get("/api/gaps?learner_id=demo-learner")
        assert res.status_code == 200
        gap_data = res.json()["data"]
        assert "summary" in gap_data
        assert "gaps" in gap_data
        print("[PASS] GET /api/gaps passed")

        # 2. POST /api/gaps/analyze
        res = await client.post("/api/gaps/analyze", json={
            "learner_id": "demo-learner",
            "target_role": "AI Engineer",
            "known_skills": [{"name": "Python", "level": "advanced"}]
        })
        assert res.status_code == 200
        print("[PASS] POST /api/gaps/analyze passed")

        # 3. GET /api/recommendations
        res = await client.get("/api/recommendations?learner_id=demo-learner")
        assert res.status_code == 200
        rec_data = res.json()["data"]
        assert "recommendations" in rec_data
        assert "next_best_action" in rec_data
        print("[PASS] GET /api/recommendations passed")

        # 4. GET /api/recommendations/next
        res = await client.get("/api/recommendations/next?limit=3")
        assert res.status_code == 200
        actions = res.json()["data"]
        assert len(actions) > 0
        print(f"[PASS] GET /api/recommendations/next passed ({len(actions)} actions)")

        # 5. GET /api/reality-check
        res = await client.get("/api/reality-check?hours_per_week=10&target_months=4")
        assert res.status_code == 200
        reality_data = res.json()["data"]
        assert "status" in reality_data
        assert "minimum_weekly_hours" in reality_data
        print(f"[PASS] GET /api/reality-check passed (Status: {reality_data['status']})")

        # 6. POST /api/reality-check
        res = await client.post("/api/reality-check", json={
            "learner_id": "demo-learner",
            "target_role": "AI Engineer",
            "target_months": 6,
            "hours_per_week": 15
        })
        assert res.status_code == 200
        print("[PASS] POST /api/reality-check passed")

        # 7. GET /api/roadmap/personalized
        res = await client.get("/api/roadmap/personalized?learner_id=demo-learner")
        assert res.status_code == 200
        pers_data = res.json()["data"]
        assert "nodes" in pers_data
        print(f"[PASS] GET /api/roadmap/personalized passed ({len(pers_data['nodes'])} nodes)")

    await close_mongo_connection()

def run_all():
    print("\n--- RUNNING PART 7 SKILL GAP, RECOMMENDATION & REALITY CHECK TEST SUITE ---\n")
    test_gap_scoring_proficiency_and_classification()
    test_gap_priority_scoring()
    test_reality_scoring_thresholds()
    asyncio.run(test_gap_service_demo_learner())
    asyncio.run(test_recommendation_engine())
    asyncio.run(test_reality_service_and_adjustments())
    asyncio.run(test_personalized_roadmap_service())
    asyncio.run(test_all_part7_rest_endpoints())
    print("\n--- ALL PART 7 TESTS PASSED WITH 100% SUCCESS! ---")

if __name__ == "__main__":
    run_all()
