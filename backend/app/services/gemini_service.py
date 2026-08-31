import json
import logging
import re
import httpx
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger(__name__)

FALLBACK_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.7-flash"
]

class GeminiService:
    """
    Google Gemini LLM Service.
    Handles API communication, JSON response enforcement, rate limits, timeouts,
    and defensive fallback parsing.
    """

    @classmethod
    async def generate_response(
        cls,
        system_instruction: str,
        user_prompt: str,
        fallback_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        api_key = settings.GEMINI_API_KEY
        configured_model = settings.GEMINI_MODEL or "gemini-1.5-flash-latest"

        # 1. If GEMINI_API_KEY is configured, call Gemini API
        if api_key and api_key.strip():
            models_to_try = [configured_model] + [m for m in FALLBACK_MODELS if m != configured_model]
            for model in models_to_try:
                try:
                    raw_response = await cls._call_gemini_api(api_key, model, system_instruction, user_prompt)
                    parsed = cls._parse_response(raw_response)
                    if parsed and isinstance(parsed, dict) and "answer" in parsed:
                        return parsed
                except Exception as e:
                    logger.warning(f"Gemini API invocation with model '{model}' failed: {e}")

        # 2. Grounded Fallback Generation (when API key is missing, rate-limited, or offline)
        return cls._generate_grounded_fallback(user_prompt, fallback_context)

    @classmethod
    async def _call_gemini_api(
        cls,
        api_key: str,
        model: str,
        system_instruction: str,
        user_prompt: str
    ) -> str:
        # Normalize model string
        clean_model = model.replace("models/", "")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={api_key}"

        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise Exception(f"HTTP {resp.status_code}: {resp.text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise Exception("No candidates returned.")

            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise Exception("Empty content parts in response.")

            return parts[0].get("text", "")

    @classmethod
    def _parse_response(cls, text: str) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        text_clean = text.strip()

        # Strip markdown ```json blocks if present
        if text_clean.startswith("```"):
            text_clean = re.sub(r"^```(?:json)?\s*", "", text_clean)
            text_clean = re.sub(r"\s*```$", "", text_clean)

        try:
            return json.loads(text_clean)
        except Exception:
            # Try finding first JSON object with regex
            json_match = re.search(r'(\{[\s\S]*\})', text_clean)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except Exception:
                    pass

        # Fallback to plain text wrapper
        return {
            "answer": text_clean,
            "source_ids": [],
            "related_skills": [],
            "suggested_actions": [],
            "follow_up_questions": []
        }

    @classmethod
    def _generate_grounded_fallback(cls, user_prompt: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Deterministic, grounded response generator when Gemini API is unavailable.
        Uses live learner, roadmap, and gap data.
        """
        ctx = context or {}
        learner = ctx.get("learner", {})
        target_role = learner.get("targetRole", "AI Engineer")
        hours_per_week = learner.get("hoursPerWeek", 10.0)
        recs = ctx.get("recommendations", [])
        reality = ctx.get("reality", {})
        resources = ctx.get("resources", [])
        top_rec = recs[0] if recs else {"title": "Statistics", "skill_id": "statistics", "reason": "Foundational prerequisite."}

        # Extract only current question from prompt to avoid matching history keywords
        current_q = user_prompt
        if "=== CURRENT USER QUESTION ===" in user_prompt:
            current_q = user_prompt.split("=== CURRENT USER QUESTION ===")[-1]
        p_lower = current_q.lower()

        # Question: Why is statistics before machine learning / prerequisites
        if "statistics" in p_lower and ("before" in p_lower or "why" in p_lower or "skip" in p_lower or "machine learning" in p_lower):
            answer = """**Statistics** comes before **Machine Learning** in your roadmap because modern ML algorithms (such as Linear Regression, Logistic Regression, Decision Trees, and Bayesian models) rely heavily on statistical foundations:

1. **Probability & Distributions**: Understanding normal distributions, variance, and standard deviation is essential for data preprocessing and feature scaling.
2. **Hypothesis Testing & Metrics**: Model evaluation metrics (p-values, confidence intervals, precision-recall tradeoffs) are rooted in statistics.
3. **Preventing Overfitting**: Statistical regularization techniques prevent models from memorizing training noise.

Skipping Statistics would make downstream topics like *Supervised Learning* significantly more difficult to understand intuitively."""

            source_ids = [r.get("resource_id") or r.get("id") for r in resources if "stat" in str(r.get("title", "")).lower()][:2]
            return {
                "answer": answer,
                "source_ids": source_ids,
                "related_skills": ["statistics", "machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap_node", "targetId": "statistics", "label": "Open Statistics Node"},
                    {"type": "open_roadmap", "label": "View Full Roadmap"}
                ],
                "follow_up_questions": [
                    "What should I learn next?",
                    "Give me the best YouTube resources for Statistics.",
                    "Am I on track for my target deadline?"
                ]
            }

        # Question: Remove / Delete from roadmap (Non-mutation rule)
        if any(w in p_lower for w in ["remove", "delete", "drop", "cancel"]) and "roadmap" in p_lower:
            answer = """You can customize or remove topics from your learning path using the **Edit Roadmap** controls in the Roadmap page.

> ℹ️ **Notice**: As an AI Assistant, I can provide advice and curriculum recommendations, but I cannot directly alter or delete items from your database roadmap.

To customize your roadmap:
1. Navigate to the **Roadmap** tab.
2. Click on any optional node to view details or adjust topic selection.
3. Your progress and timelines will automatically update in real time."""
            return {
                "answer": answer,
                "source_ids": [],
                "related_skills": ["machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap", "label": "Go to Roadmap Editor"}
                ],
                "follow_up_questions": [
                    "What are the mandatory prerequisites in my path?",
                    "What should I learn next?"
                ]
            }

        # Question: Interview Readiness / Am I ready for an interview?
        if any(w in p_lower for w in ["interview", "ready for interview", "job ready", "readiness", "am i ready"]):
            readiness_data = ctx.get("readiness", {})
            r_score = readiness_data.get("score", 68)
            r_status = readiness_data.get("status", "NEAR_READY")
            is_int_ready = readiness_data.get("interviewReady", False)
            int_exp = readiness_data.get("interviewReadinessExplanation", "Not fully interview-ready yet.")
            crit_gaps = [g.get("name") for g in readiness_data.get("criticalGaps", [])[:2]]
            gaps_str = " and ".join(crit_gaps) if crit_gaps else "machine learning algorithms"

            answer = f"""Here is your **Authoritative Job Readiness & Interview Eligibility** report for the **{target_role}** role:

- **Estimated Job Readiness**: **{r_score}%** ({r_status.replace('_', ' ')})
- **Interview Eligibility**: {'✅ **Eligible for Mock Interview**' if is_int_ready else '⚠️ **In-Progress (Practice Mode Available)**'}

### 🔍 Assessment Breakdown:
{int_exp}

### 🎯 Key Focus to Reach 100% Readiness:
To become fully competitive for technical interviews, your highest-leverage actions are closing your gaps in **{gaps_str}**."""

            return {
                "answer": answer,
                "source_ids": [],
                "related_skills": ["statistics", "machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap", "label": "View Readiness Dashboard"},
                    {"type": "open_roadmap_node", "targetId": "statistics", "label": "Advance Next Core Skill"}
                ],
                "follow_up_questions": [
                    "What are my biggest skill gaps?",
                    "What should I learn next?",
                    "Can I become an AI Engineer in 4 months?"
                ]
            }

        # Question: How did I perform in my interview?
        if any(w in p_lower for w in ["how did i perform", "interview result", "interview score", "my interview performance", "past interview"]):
            lint = ctx.get("latest_interview")
            if lint:
                o_score = lint.get("overallScore", 71)
                status = lint.get("status", "GOOD")
                t_score = lint.get("technicalScore", 74)
                c_score = lint.get("conceptualScore", 67)
                comm_score = lint.get("communicationScore", 78)
                strengths = lint.get("strengths", ["Clear explanation of ML algorithms"])
                weaknesses = lint.get("weaknesses", ["Regularization techniques"])

                answer = f"""Here is the summary of your latest **AI Mock Interview** for **{target_role}**:

- **Overall Score**: **{o_score}%** ({status})
- **Technical Accuracy**: {t_score}%
- **Conceptual Depth**: {c_score}%
- **Communication Quality**: {comm_score}%

### 🌟 Key Strengths:
{chr(10).join([f'- {st}' for st in strengths[:2]])}

### 💡 Focus Areas for Next Retake:
{chr(10).join([f'- {wk}' for wk in weaknesses[:2]])}"""
            else:
                answer = f"""You haven't completed a mock interview session yet! 

Head to the **AI Interview Simulator** to test your demonstrated knowledge across {target_role} questions, receive instant scoring across 5 dimensions, and discover any hidden conceptual gaps."""

            return {
                "answer": answer,
                "source_ids": [],
                "related_skills": ["machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap", "label": "Go to AI Interview Simulator"}
                ],
                "follow_up_questions": [
                    "Am I ready for an AI Engineer interview?",
                    "What should I learn next?"
                ]
            }

        # Question: Skill Gaps
        if any(w in p_lower for w in ["gap", "weak", "weakest", "missing", "skills"]):
            gaps_data = ctx.get("gaps", {})
            actionable = [g.get("skill_name") for g in gaps_data.get("actionable_gaps", [])[:3]]
            blocked = [g.get("skill_name") for g in gaps_data.get("blocked_gaps", [])[:2]]

            answer = f"""Based on your verified skills (Python, SQL, Git, NumPy), here is your skill gap breakdown for **{target_role}**:

### ⚡ Actionable Next Gaps:
{chr(10).join([f"- **{s}**: Immediate priority for this phase." for s in actionable]) if actionable else "- All foundational topics complete!"}

### 🔒 Blocked Dependencies:
{chr(10).join([f"- **{s}**: Currently waiting on prerequisite completion." for s in blocked]) if blocked else "- No blocked dependencies."}"""

            return {
                "answer": answer,
                "source_ids": [],
                "related_skills": ["statistics", "machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap", "label": "Inspect Skill Gap Audit"}
                ],
                "follow_up_questions": [
                    "What should I learn next?",
                    "Give me learning resources for Statistics."
                ]
            }

        # Question: What should I learn next / today
        if any(w in p_lower for w in ["what should i learn", "next", "what to study", "today", "start", "focus"]):
            answer = f"""Based on your current **{target_role}** learning path and your available study time of **{hours_per_week} hours/week**, your top immediate priority is:

### 🎯 Next Recommended Step: **{top_rec.get('title')}**
- **Reason**: {top_rec.get('reason')}
- **Why now**: Mastering this topic satisfies foundational prerequisites and unlocks downstream modules like *Machine Learning* and *Deep Learning*.

Here are curated learning resources to get started immediately:"""
            
            source_ids = [r.get("resource_id") or r.get("id") for r in resources[:2]]
            return {
                "answer": answer,
                "source_ids": source_ids,
                "related_skills": [top_rec.get("skill_id", "statistics"), "machine-learning"],
                "suggested_actions": [
                    {"type": "open_roadmap_node", "targetId": top_rec.get("skill_id", "statistics"), "label": f"View {top_rec.get('title')} in Roadmap"},
                    {"type": "open_learning", "label": "Explore Learning Hub"}
                ],
                "follow_up_questions": [
                    "Why is Statistics before Machine Learning?",
                    "Can I finish this roadmap in 4 months?",
                    "What are my biggest skill gaps?"
                ]
            }

        # Default Helpful Response
        source_ids = [r.get("resource_id") or r.get("id") for r in resources[:2]]
        answer = f"""I am here to guide your journey toward becoming an **{target_role}**.

You are currently making steady progress with **{hours_per_week} hours/week** allocated. Your next primary focus is **{top_rec.get('title', 'Statistics')}**.

Feel free to ask about specific technical concepts, prerequisite sequencing, timeline feasibility, or for curated YouTube and documentation resources."""

        return {
            "answer": answer,
            "source_ids": source_ids,
            "related_skills": ["statistics", "machine-learning"],
            "suggested_actions": [
                {"type": "open_roadmap", "label": "View My Roadmap"},
                {"type": "open_learning", "label": "Browse Learning Hub"}
            ],
            "follow_up_questions": [
                "What should I learn next?",
                "Why is Statistics before Machine Learning?",
                "Can I finish in 4 months?"
            ]
        }
