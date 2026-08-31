import asyncio
import httpx
from app.main import app
from app.database.mongodb import connect_to_mongo, close_mongo_connection

async def test_api_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        print("[PASS] Health API passed:", data)

        # 2. Learner GET
        res = await client.get("/api/learner")
        assert res.status_code == 200
        learner_data = res.json()["data"]
        assert learner_data["name"] == "Alex Morgan"
        assert learner_data["targetRole"] == "AI Engineer"
        print("[PASS] Learner GET passed:", learner_data["name"])

        # 3. Profile GET
        res = await client.get("/api/learner/profile")
        assert res.status_code == 200
        assert res.json()["data"]["id"] in ("demo-learner", "alex-morgan")
        print("[PASS] Profile GET passed")

        # 4. Profile PUT (Update validation & persistence)
        update_payload = {"hoursPerWeek": 15, "availableHoursPerWeek": 15}
        res = await client.put("/api/learner/profile", json=update_payload)
        assert res.status_code == 200
        assert res.json()["data"]["hoursPerWeek"] == 15
        print("[PASS] Profile PUT passed, hoursPerWeek updated to 15")

        # 5. Roadmap GET
        res = await client.get("/api/roadmap")
        assert res.status_code == 200
        roadmap_data = res.json()["data"]
        assert roadmap_data["id"] == "ai-engineer"
        assert len(roadmap_data["nodes"]) > 0
        print(f"[PASS] Roadmap GET passed, total nodes: {len(roadmap_data['nodes'])}")

        # 6. Roadmap Node PATCH
        res = await client.patch("/api/roadmap/ai-engineer/nodes/machine-learning", json={"status": "in_progress"})
        assert res.status_code == 200
        patched_node = next((n for n in res.json()["data"]["nodes"] if n["id"] == "machine-learning"), None)
        assert patched_node is not None
        assert patched_node["status"] == "in_progress"
        print("[PASS] Roadmap Node PATCH passed")

        # 7. Roadmap Invalid Node (404 test)
        res = await client.patch("/api/roadmap/ai-engineer/nodes/non-existent-node-123", json={"status": "completed"})
        assert res.status_code == 404
        assert res.json()["error"]["code"] == "RESOURCE_NOT_FOUND"
        print("[PASS] Roadmap 404 Error handling passed")

        # 8. Skills GET & Search
        res = await client.get("/api/skills")
        assert res.status_code == 200
        skills = res.json()["data"]
        assert len(skills) >= 10
        print(f"[PASS] Skills GET passed ({len(skills)} skills)")

        res = await client.get("/api/skills/search?q=machine")
        assert res.status_code == 200
        search_skills = res.json()["data"]
        assert any(s["id"] == "machine-learning" for s in search_skills)
        print("[PASS] Skills Search passed")

        # 9. Resources GET
        res = await client.get("/api/resources?type=video")
        assert res.status_code == 200
        resources = res.json()["data"]
        assert len(resources) > 0
        assert all(r["type"] == "video" for r in resources)
        print(f"[PASS] Resources GET filtered by video passed ({len(resources)} items)")

        # 10. Progress GET
        res = await client.get("/api/progress")
        assert res.status_code == 200
        progress = res.json()["data"]
        assert "overall" in progress
        assert "skillProgress" in progress
        print("[PASS] Progress GET passed")

        # 11. Dashboard GET
        res = await client.get("/api/dashboard")
        assert res.status_code == 200
        dashboard = res.json()
        assert "learner" in dashboard["data"]
        assert "roadmap" in dashboard["data"]
        assert "progress" in dashboard["data"]
        assert "nextAction" in dashboard["data"]
        print("[PASS] Dashboard GET passed")

        print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 100%")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_api_endpoints())
