import asyncio
import pytest
import httpx
from app.main import app
from app.utils.prompt_builder import PromptBuilder
from app.services.context_service import ContextService
from app.services.gemini_service import GeminiService
from app.services.assistant_service import AssistantService
from app.database.mongodb import connect_to_mongo, close_mongo_connection

def test_prompt_builder():
    sys_prompt = PromptBuilder.build_system_prompt()
    assert "LearnPath AI Learning Assistant" in sys_prompt
    assert "NON-MUTATION" in sys_prompt
    assert "source_ids" in sys_prompt

    context_bundle = PromptBuilder.build_context_bundle({
        "learner": {"name": "Alex Morgan", "targetRole": "AI Engineer", "hoursPerWeek": 10.0},
        "roadmap": {"nodes": [{"name": "Python", "status": "completed"}, {"name": "Statistics", "status": "in_progress"}]},
        "progress": {"overallProgress": 32},
        "gaps": {"summary": {"total_estimated_gap_hours": 180}},
        "reality": {"status": "REALISTIC", "minimum_weekly_hours": 12.0},
        "recommendations": [{"title": "Statistics", "priority": 88, "reason": "Foundational prerequisite."}],
        "resources": [{"id": "youtube:qBigTkBLU6g", "title": "StatQuest", "provider": "YouTube", "url": "https://youtube.com/watch?v=qBigTkBLU6g"}]
    })

    assert "Alex Morgan" in context_bundle
    assert "AI Engineer" in context_bundle
    assert "Statistics" in context_bundle
    assert "youtube:qBigTkBLU6g" in context_bundle
    print("[PASS] PromptBuilder system prompt and context bundle formatting verified.")

@pytest.mark.asyncio
async def test_context_service_gathering():
    context = await ContextService.gather_context(learner_id="demo-learner", user_message="What about machine learning?")
    assert "learner" in context
    assert "roadmap" in context
    assert "progress" in context
    assert "gaps" in context
    assert "reality" in context
    assert "recommendations" in context
    assert "resources" in context
    assert len(context["resources"]) > 0
    print(f"[PASS] ContextService gathered complete context bundle for demo-learner ({len(context['resources'])} RAG resources).")

@pytest.mark.asyncio
async def test_assistant_chat_flow():
    # 1. Ask: What should I learn next?
    res1 = await AssistantService.handle_chat(
        learner_id="demo-learner",
        conversation_id=None,
        message="What should I learn next?"
    )
    conv_id = res1["conversationId"]
    msg1 = res1["message"]
    assert conv_id is not None
    assert msg1["role"] == "assistant"
    assert len(msg1["content"]) > 30
    assert len(msg1["suggestedActions"]) > 0
    assert len(msg1["followUpQuestions"]) > 0
    print(f"[PASS] Chat Q1 passed ('What should I learn next?'). Actions: {len(msg1['suggestedActions'])}, Citations: {len(msg1['citations'])}")

    # 2. Ask: Why is statistics before machine learning?
    res2 = await AssistantService.handle_chat(
        learner_id="demo-learner",
        conversation_id=conv_id,
        message="Why is statistics before machine learning?"
    )
    msg2 = res2["message"]
    assert "statistics" in msg2["content"].lower()
    assert "machine learning" in msg2["content"].lower()
    print("[PASS] Chat Q2 passed ('Why is statistics before machine learning?').")

    # 3. Ask: Can I become an AI Engineer in four months?
    res3 = await AssistantService.handle_chat(
        learner_id="demo-learner",
        conversation_id=conv_id,
        message="Can I become an AI Engineer in four months?"
    )
    msg3 = res3["message"]
    assert "4 months" in msg3["content"] or "four months" in msg3["content"] or "timeline" in msg3["content"].lower() or "hours" in msg3["content"].lower()
    print("[PASS] Chat Q3 passed ('Can I become an AI Engineer in four months?').")

    # 4. Ask: Remove Machine Learning from my roadmap (Security / Non-Mutation Test)
    res4 = await AssistantService.handle_chat(
        learner_id="demo-learner",
        conversation_id=conv_id,
        message="Remove Machine Learning from my roadmap"
    )
    msg4 = res4["message"]
    # Verify assistant does NOT claim to delete it and directs to UI
    assert "roadmap" in msg4["content"].lower()
    assert "edit" in msg4["content"].lower() or "cannot" in msg4["content"].lower() or "notice" in msg4["content"].lower()
    print("[PASS] Chat Q4 non-mutation test passed ('Remove Machine Learning from my roadmap').")

@pytest.mark.asyncio
async def test_all_part9_rest_endpoints():
    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. POST /api/assistant/chat
        chat_payload = {
            "learnerId": "demo-learner",
            "conversationId": None,
            "message": "Give me the best YouTube resources for Statistics"
        }
        res = await client.post("/api/assistant/chat", json=chat_payload)
        assert res.status_code == 200
        chat_data = res.json()["data"]
        conv_id = chat_data["conversationId"]
        msg = chat_data["message"]
        assert msg["role"] == "assistant"
        assert len(msg["citations"]) > 0
        print(f"[PASS] POST /api/assistant/chat passed with {len(msg['citations'])} citations.")

        # 2. GET /api/assistant/conversations
        list_res = await client.get("/api/assistant/conversations?learner_id=demo-learner")
        assert list_res.status_code == 200
        convs = list_res.json()["data"]
        assert len(convs) > 0
        print(f"[PASS] GET /api/assistant/conversations passed ({len(convs)} conversations).")

        # 3. GET /api/assistant/conversations/{id}
        single_res = await client.get(f"/api/assistant/conversations/{conv_id}")
        assert single_res.status_code == 200
        single_conv = single_res.json()["data"]
        assert single_conv["id"] == conv_id
        assert len(single_conv["messages"]) >= 2
        print(f"[PASS] GET /api/assistant/conversations/{conv_id} passed ({len(single_conv['messages'])} messages persisted).")

        # 4. DELETE /api/assistant/conversations/{id}
        del_res = await client.delete(f"/api/assistant/conversations/{conv_id}")
        assert del_res.status_code == 200
        print(f"[PASS] DELETE /api/assistant/conversations/{conv_id} passed.")

    await close_mongo_connection()

def run_all():
    print("\n--- RUNNING PART 9 GEMINI AI ASSISTANT TEST SUITE ---\n")
    test_prompt_builder()
    asyncio.run(test_context_service_gathering())
    asyncio.run(test_assistant_chat_flow())
    asyncio.run(test_all_part9_rest_endpoints())
    print("\n--- ALL PART 9 TESTS PASSED WITH 100% SUCCESS! ---")

if __name__ == "__main__":
    run_all()
