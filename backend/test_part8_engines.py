import asyncio
import pytest
import httpx
from app.main import app
from app.ranking.resource_scoring import ResourceScoring
from app.ingestion.youtube_ingestor import YouTubeIngestor
from app.ingestion.web_ingestor import WebIngestor
from app.ingestion.course_ingestor import CourseIngestor
from app.services.citation_service import CitationService
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.services.resource_feedback_service import ResourceFeedbackService
from app.services.rag_context_service import RAGContextService
from app.services.resource_service import ResourceService
from app.database.mongodb import connect_to_mongo, close_mongo_connection

def test_youtube_duration_parsing():
    secs, dur_str, cat = YouTubeIngestor.parse_iso_duration("PT1H25M30S")
    assert secs == 5130
    assert "1h 25m" in dur_str
    assert cat == "LONG"

    secs_short, dur_short, cat_short = YouTubeIngestor.parse_iso_duration("PT12M00S")
    assert secs_short == 720
    assert cat_short == "SHORT"
    print("[PASS] YouTube ISO 8601 duration parser verified.")

def test_resource_ranking_scoring():
    # 1. Relevance
    high_rel = ResourceScoring.calculate_relevance_score(
        resource_title="Statistics for Machine Learning Fundamentals",
        resource_desc="Learn probability and statistics for data science.",
        resource_topics=["statistics", "machine-learning"],
        target_skill_id="statistics",
        target_skill_name="Statistics"
    )
    assert high_rel >= 85.0

    # 2. Difficulty Match
    diff_match = ResourceScoring.calculate_difficulty_match("Beginner", "Beginner")
    assert diff_match == 100.0

    # 3. Final Composite Score
    final_score, factors = ResourceScoring.calculate_final_resource_score(
        resource_title="Statistics for Beginners",
        resource_desc="Core probability and statistical distributions.",
        resource_topics=["statistics"],
        target_skill_id="statistics",
        target_skill_name="Statistics",
        resource_difficulty="Beginner",
        learner_level="Beginner",
        views=500000,
        likes=25000,
        channel_name="StatQuest",
        duration_seconds=1800,
        published_at="2023-05-10"
    )
    assert 0.0 <= final_score <= 100.0
    assert final_score >= 80.0
    assert "relevance" in factors
    assert "quality" in factors
    print(f"[PASS] Resource ranking multi-factor score: {final_score}/100 (factors: {factors})")

def test_citation_service():
    assert CitationService.validate_url("https://www.youtube.com/watch?v=123") is True
    assert CitationService.validate_url("javascript:alert(1)") is False
    assert CitationService.validate_url("file:///etc/passwd") is False

    citation = CitationService.create_citation(
        resource_id="youtube:test1234",
        source="YouTube",
        title="Python Full Course",
        url="https://youtube.com/watch?v=test1234",
        channel_name="freeCodeCamp"
    )
    assert citation["resource_id"] == "youtube:test1234"
    assert citation["source"] == "Youtube"
    assert "retrieved_at" in citation
    print("[PASS] Citation creation and URL validation verified.")

@pytest.mark.asyncio
async def test_resource_discovery_service():
    resources = await ResourceDiscoveryService.discover_resources_for_skill(
        skill_id="statistics",
        skill_name="Statistics",
        difficulty="Beginner",
        limit=5
    )
    assert len(resources) > 0
    first = resources[0]
    assert "id" in first
    assert "title" in first
    assert "final_score" in first
    assert "citation" in first
    assert first["citation"]["url"].startswith("http")
    print(f"[PASS] Resource discovery retrieved {len(resources)} ranked candidates for 'statistics'. Top: '{first['title']}' ({first['final_score']}/100)")

@pytest.mark.asyncio
async def test_resource_feedback():
    fb = await ResourceFeedbackService.record_feedback(
        learner_id="demo-learner",
        resource_id="youtube:test_video",
        skill_id="statistics",
        feedback="HELPFUL",
        comment="Great visual explanations."
    )
    assert fb["success"] is True
    assert "feedback_id" in fb
    print(f"[PASS] Feedback submission recorded: {fb['feedback_id']}")

@pytest.mark.asyncio
async def test_rag_context_service():
    context = await RAGContextService.retrieve_context_for_skill(
        learner_id="demo-learner",
        skill_id="statistics",
        query="How to master probability distributions?"
    )
    assert context["skill_id"] == "statistics"
    assert context["resources_count"] > 0
    assert len(context["context_text"]) > 30
    assert len(context["citations"]) > 0
    print(f"[PASS] RAG context structured with {context['resources_count']} grounded resources and citations.")

@pytest.mark.asyncio
async def test_all_part8_rest_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /api/resources/search
        res = await client.get("/api/resources/search?q=statistics")
        assert res.status_code == 200
        search_res = res.json()["data"]
        assert "resources" in search_res
        print(f"[PASS] GET /api/resources/search passed ({search_res['total_results']} results)")

        # 2. GET /api/resources/skill/statistics
        res = await client.get("/api/resources/skill/statistics?limit=3")
        assert res.status_code == 200
        skill_res = res.json()["data"]
        assert len(skill_res) > 0
        print(f"[PASS] GET /api/resources/skill/statistics passed ({len(skill_res)} items)")

        # 3. GET /api/resources/next-action
        res = await client.get("/api/resources/next-action?learner_id=demo-learner")
        assert res.status_code == 200
        next_res = res.json()["data"]
        assert "top_resource" in next_res
        print(f"[PASS] GET /api/resources/next-action passed (Action: '{next_res['skill_title']}')")

        # 4. GET /api/resources/rag/context
        res = await client.get("/api/resources/rag/context?skill_id=statistics")
        assert res.status_code == 200
        rag_res = res.json()["data"]
        assert "context_text" in rag_res
        assert len(rag_res["citations"]) > 0
        print(f"[PASS] GET /api/resources/rag/context passed ({len(rag_res['citations'])} citations)")

        # 5. POST /api/resources/{id}/feedback
        res = await client.post("/api/resources/youtube:statquest/feedback", json={
            "learner_id": "demo-learner",
            "feedback": "HELPFUL",
            "comment": "Loved the step by step breakdown"
        })
        assert res.status_code == 200
        fb_res = res.json()["data"]
        assert fb_res["success"] is True
        print("[PASS] POST /api/resources/{id}/feedback passed")

    await close_mongo_connection()

def run_all():
    print("\n--- RUNNING PART 8 RESOURCE DISCOVERY & CITATIONS TEST SUITE ---\n")
    test_youtube_duration_parsing()
    test_resource_ranking_scoring()
    test_citation_service()
    asyncio.run(test_resource_discovery_service())
    asyncio.run(test_resource_feedback())
    asyncio.run(test_rag_context_service())
    asyncio.run(test_all_part8_rest_endpoints())
    print("\n--- ALL PART 8 TESTS PASSED WITH 100% SUCCESS! ---")

if __name__ == "__main__":
    run_all()
