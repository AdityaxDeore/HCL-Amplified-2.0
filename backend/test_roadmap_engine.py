import asyncio
import pytest
import httpx
from app.main import app
from app.utils.roadmap_loader import RoadmapLoader
from app.services.roadmap_engine import RoadmapEngine, GraphValidationError, DependencyCycleError
from app.services.skill_graph_engine import SkillGraphEngine
from app.database.mongodb import connect_to_mongo, close_mongo_connection

def test_roadmap_loader_discovery():
    roadmaps = RoadmapLoader.list_available_roadmaps()
    assert len(roadmaps) >= 90, f"Expected at least 90 roadmaps, found {len(roadmaps)}"
    slugs = [r["id"] for r in roadmaps]
    assert "ai-engineer" in slugs
    assert "frontend" in slugs
    assert "backend" in slugs
    print(f"[PASS] Roadmap loader discovered {len(roadmaps)} canonical roadmaps.")

def test_roadmap_normalization():
    roadmap = RoadmapLoader.normalize_roadmap("ai-engineer")
    assert roadmap is not None
    assert roadmap["id"] == "ai-engineer"
    assert len(roadmap["nodes"]) > 0
    assert len(roadmap["edges"]) > 0
    assert len(roadmap["categories"]) > 0
    assert len(roadmap["milestones"]) > 0
    
    # Check node fields
    first_node = roadmap["nodes"][0]
    assert "id" in first_node
    assert "title" in first_node
    assert "importance" in first_node
    assert first_node["importance"] in ("mandatory", "recommended", "optional")
    assert "status" in first_node
    assert "order" in first_node
    print(f"[PASS] AI Engineer roadmap normalized: {len(roadmap['nodes'])} nodes, {len(roadmap['edges'])} edges.")

def test_roadmap_validation_duplicate_nodes():
    synthetic_nodes = [
        {"id": "python", "title": "Python", "importance": "mandatory", "status": "completed"},
        {"id": "python", "title": "Python Duplicate", "importance": "mandatory", "status": "not_started"}
    ]
    synthetic_edges = []
    with pytest.raises(GraphValidationError) as excinfo:
        RoadmapEngine.validate_graph(synthetic_nodes, synthetic_edges)
    assert "Duplicate node ID" in str(excinfo.value)
    print("[PASS] Validation caught duplicate node ID correctly.")

def test_roadmap_validation_nonexistent_edge_target():
    synthetic_nodes = [
        {"id": "python", "title": "Python", "importance": "mandatory", "status": "completed"},
        {"id": "numpy", "title": "NumPy", "importance": "mandatory", "status": "not_started"}
    ]
    synthetic_edges = [
        {"id": "e1", "source": "python", "target": "nonexistent-node", "type": "prerequisite"}
    ]
    with pytest.raises(GraphValidationError) as excinfo:
        RoadmapEngine.validate_graph(synthetic_nodes, synthetic_edges)
    assert "nonexistent target node" in str(excinfo.value)
    print("[PASS] Validation caught nonexistent edge target correctly.")

def test_cycle_detection():
    # Synthetic cyclic graph: A -> B -> C -> A
    nodes = [
        {"id": "node-a", "title": "A", "importance": "mandatory", "status": "completed"},
        {"id": "node-b", "title": "B", "importance": "mandatory", "status": "in_progress"},
        {"id": "node-c", "title": "C", "importance": "mandatory", "status": "not_started"},
    ]
    edges = [
        {"id": "e1", "source": "node-a", "target": "node-b", "type": "prerequisite"},
        {"id": "e2", "source": "node-b", "target": "node-c", "type": "prerequisite"},
        {"id": "e3", "source": "node-c", "target": "node-a", "type": "prerequisite"}
    ]
    with pytest.raises(DependencyCycleError) as excinfo:
        RoadmapEngine.validate_graph(nodes, edges)
    assert "cycle detected" in str(excinfo.value).lower()
    print(f"[PASS] Cycle detection caught dependency loop: {excinfo.value}")

def test_topological_sort():
    # Synthetic acyclic graph: Python -> Statistics -> Machine Learning -> Deep Learning
    nodes = [
        {"id": "python", "title": "Python", "order": 1, "importance": "mandatory", "status": "completed"},
        {"id": "statistics", "title": "Statistics", "order": 2, "importance": "mandatory", "status": "in_progress"},
        {"id": "ml", "title": "Machine Learning", "order": 3, "importance": "mandatory", "status": "not_started"},
        {"id": "dl", "title": "Deep Learning", "order": 4, "importance": "mandatory", "status": "locked"},
    ]
    edges = [
        {"id": "e1", "source": "python", "target": "statistics", "type": "prerequisite"},
        {"id": "e2", "source": "statistics", "target": "ml", "type": "prerequisite"},
        {"id": "e3", "source": "ml", "target": "dl", "type": "prerequisite"}
    ]
    order = RoadmapEngine.topological_sort(nodes, edges)
    assert order == ["python", "statistics", "ml", "dl"]
    print(f"[PASS] Topological sort produced expected deterministic sequence: {order}")

def test_get_next_learning_nodes():
    nodes = [
        {"id": "python", "title": "Python", "order": 1, "importance": "mandatory", "status": "completed", "prerequisites": []},
        {"id": "statistics", "title": "Statistics", "order": 2, "importance": "mandatory", "status": "in_progress", "prerequisites": ["python"]},
        {"id": "numpy", "title": "NumPy", "order": 3, "importance": "mandatory", "status": "not_started", "prerequisites": ["python"]},
        {"id": "ml", "title": "Machine Learning", "order": 4, "importance": "mandatory", "status": "locked", "prerequisites": ["python", "statistics", "numpy"]},
    ]
    next_nodes = RoadmapEngine.get_next_learning_nodes(nodes, completed_ids={"python"}, limit=2)
    next_ids = [n["id"] for n in next_nodes]
    # Statistics (in_progress) and NumPy (not_started, prerequisites satisfied) should be returned
    assert "statistics" in next_ids
    assert "numpy" in next_ids
    assert "ml" not in next_ids  # ML is blocked by unmet prerequisites
    print(f"[PASS] Next learning nodes calculation returned unblocked actionable nodes: {next_ids}")

@pytest.mark.asyncio
async def test_skill_ontology_and_traversals():
    # Alias normalization
    assert SkillGraphEngine.normalize_skill_id("ML") == "machine-learning"
    assert SkillGraphEngine.normalize_skill_id("genai") == "generative-ai"
    assert SkillGraphEngine.normalize_skill_id("python 3") == "python"
    print("[PASS] Skill alias normalization verified.")

    # Upstream prerequisites of deep-learning
    upstream = await SkillGraphEngine.get_upstream_skills("deep-learning")
    upstream_ids = [s["id"] for s in upstream]
    assert "machine-learning" in upstream_ids
    assert "python" in upstream_ids or "statistics" in upstream_ids
    print(f"[PASS] Upstream prerequisites of 'deep-learning': {upstream_ids}")

    # Downstream unlocked skills from statistics
    downstream = await SkillGraphEngine.get_downstream_skills("statistics")
    downstream_ids = [s["id"] for s in downstream]
    assert "machine-learning" in downstream_ids
    print(f"[PASS] Downstream unlocked skills from 'statistics': {downstream_ids}")

    # Shortest learning path: python -> generative-ai
    path_result = await SkillGraphEngine.find_skill_path("python", "generative-ai")
    assert path_result["reachable"] is True
    assert path_result["path"][0] == "python"
    assert path_result["path"][-1] == "generative-ai"
    assert path_result["steps"] >= 2
    print(f"[PASS] Shortest skill path (Python -> Generative AI): {' -> '.join(path_result['path'])} ({path_result['steps']} steps)")

@pytest.mark.asyncio
async def test_all_rest_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Roadmaps list
        res = await client.get("/api/roadmaps/list")
        assert res.status_code == 200
        roadmaps = res.json()["data"]
        assert len(roadmaps) >= 90
        print(f"[PASS] GET /api/roadmaps/list passed ({len(roadmaps)} roadmaps)")

        # 2. Roadmap Graph
        res = await client.get("/api/roadmaps/ai-engineer/graph")
        assert res.status_code == 200
        graph_data = res.json()["data"]
        assert "nodes" in graph_data
        assert "edges" in graph_data
        assert "topological_order" in graph_data
        assert "next_nodes" in graph_data
        print(f"[PASS] GET /api/roadmaps/ai-engineer/graph passed (topological sequence: {len(graph_data['topological_order'])} nodes)")

        # 3. Roadmap Milestones
        res = await client.get("/api/roadmaps/ai-engineer/milestones")
        assert res.status_code == 200
        milestones = res.json()["data"]
        assert len(milestones) >= 4
        print(f"[PASS] GET /api/roadmaps/ai-engineer/milestones passed ({len(milestones)} milestones)")

        # 4. Roadmap Next Actionable Nodes
        res = await client.get("/api/roadmaps/ai-engineer/next?limit=3")
        assert res.status_code == 200
        next_nodes = res.json()["data"]
        assert len(next_nodes) > 0
        print(f"[PASS] GET /api/roadmaps/ai-engineer/next passed ({len(next_nodes)} candidates)")

        # 5. Skill Graph
        res = await client.get("/api/skills/graph")
        assert res.status_code == 200
        skill_graph = res.json()["data"]
        assert len(skill_graph["nodes"]) >= 10
        assert len(skill_graph["edges"]) > 0
        print(f"[PASS] GET /api/skills/graph passed ({len(skill_graph['nodes'])} nodes, {len(skill_graph['edges'])} edges)")

        # 6. Skill Path Query
        res = await client.get("/api/skills/path?source=python&target=generative-ai")
        assert res.status_code == 200
        path_res = res.json()["data"]
        assert path_res["reachable"] is True
        print(f"[PASS] GET /api/skills/path passed ({' -> '.join(path_res['path'])})")

        # 7. Upstream & Downstream Endpoints
        res = await client.get("/api/skills/machine-learning/upstream")
        assert res.status_code == 200
        res = await client.get("/api/skills/machine-learning/downstream")
        assert res.status_code == 200
        print("[PASS] GET /api/skills/machine-learning/upstream & downstream passed")

    await close_mongo_connection()

def run_all():
    print("\n--- RUNNING PART 6 ROADMAP & SKILL GRAPH TEST SUITE ---\n")
    test_roadmap_loader_discovery()
    test_roadmap_normalization()
    test_roadmap_validation_duplicate_nodes()
    test_roadmap_validation_nonexistent_edge_target()
    test_cycle_detection()
    test_topological_sort()
    test_get_next_learning_nodes()
    asyncio.run(test_skill_ontology_and_traversals())
    asyncio.run(test_all_rest_endpoints())
    print("\n--- ALL PART 6 TESTS PASSED WITH 100% SUCCESS! ---")

if __name__ == "__main__":
    run_all()
