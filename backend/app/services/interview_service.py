import json
import logging
import uuid
import re
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.database.mongodb import get_database
from app.repositories.learner_repository import LearnerRepository
from app.services.gap_service import GapService
from app.services.readiness_service import ReadinessService
from app.services.gemini_service import GeminiService
from app.services.resource_discovery_service import ResourceDiscoveryService
from app.utils.errors import ValidationError, ResourceNotFoundError

logger = logging.getLogger(__name__)

# Evaluation Weights
EVALUATION_WEIGHTS = {
    "technical": 0.35,
    "conceptual": 0.25,
    "completeness": 0.15,
    "relevance": 0.15,
    "communication": 0.10
}

# Performance Status Bands
PERFORMANCE_THRESHOLDS = {
    "STRONG": 80,
    "GOOD": 65,
    "DEVELOPING": 50,
    "NEEDS_IMPROVEMENT": 0
}

# In-Memory Session Store
_SESSION_STORE: Dict[str, Dict[str, Any]] = {}

# Controlled Fallback Question Bank
FALLBACK_QUESTIONS = [
    {
        "id": "fb_q1",
        "question": "Explain the difference between supervised and unsupervised learning, providing an industry example of each.",
        "skill": "Machine Learning",
        "difficulty": "medium",
        "type": "technical",
        "expectedConcepts": ["labeled data", "unlabeled data", "classification/regression", "clustering/dimensionality reduction"]
    },
    {
        "id": "fb_q2",
        "question": "Your machine learning model achieves 99% accuracy on training data but drops to 62% on test data. What is happening and how would you resolve it?",
        "skill": "Machine Learning",
        "difficulty": "medium",
        "type": "technical",
        "expectedConcepts": ["overfitting", "high variance", "regularization", "cross-validation", "feature pruning"]
    },
    {
        "id": "fb_q3",
        "question": "When would you choose to optimize for Precision over Recall in a binary classification problem?",
        "skill": "Statistics",
        "difficulty": "medium",
        "type": "conceptual",
        "expectedConcepts": ["false positives cost", "spam detection", "false negatives cost", "confusion matrix"]
    },
    {
        "id": "fb_q4",
        "question": "Describe the end-to-end architecture you would design to deploy a real-time ML inference API into production.",
        "skill": "MLOps",
        "difficulty": "hard",
        "type": "project",
        "expectedConcepts": ["containerization/docker", "fastapi/rest endpoint", "model registry", "monitoring/latency", "ci/cd"]
    },
    {
        "id": "fb_q5",
        "question": "How do self-attention mechanisms in Transformer architectures differ from traditional recurrent neural networks (RNNs)?",
        "skill": "Deep Learning",
        "difficulty": "hard",
        "type": "technical",
        "expectedConcepts": ["parallel processing", "contextual embeddings", "vanishing gradients", "quadratic complexity"]
    },
    {
        "id": "fb_q6",
        "question": "Tell me about a technical project where a model failed to perform as expected. How did you diagnose and pivot your approach?",
        "skill": "Problem Solving",
        "difficulty": "medium",
        "type": "behavioral",
        "expectedConcepts": ["root-cause analysis", "data quality check", "baseline comparison", "measurable improvement"]
    }
]

class InterviewService:
    """
    AI Interview Simulator Service.
    Manages state machine, personalized adaptive question generation,
    multi-factor answer evaluation, follow-up flows, and final reporting.
    """

    @classmethod
    async def start_interview(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = "AI Engineer",
        interview_type: str = "mixed",
        difficulty: str = "adaptive",
        question_count: int = 6,
        focus_skills: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        session_id = f"int_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        # 1. Fetch learner and intelligence context
        learner = await LearnerRepository.get_by_id(learner_id) or {
            "id": learner_id,
            "name": "Alex Morgan",
            "targetRole": target_role or "AI Engineer"
        }
        role = target_role or learner.get("targetRole", "AI Engineer")

        # 2. Gather skill gaps and readiness
        try:
            gap_data = await GapService.analyze_gaps(learner_id=learner_id, target_role=role)
            actionable_gaps = [g.get("skill_name") for g in gap_data.get("actionable_gaps", [])[:3]]
        except Exception:
            actionable_gaps = ["Machine Learning", "Statistics"]

        try:
            readiness_data = await ReadinessService.evaluate_readiness(learner_id)
            readiness_score = readiness_data.get("score", 68.0)
        except Exception:
            readiness_score = 68.0

        effective_focus = focus_skills if focus_skills and len(focus_skills) > 0 else (actionable_gaps or ["Machine Learning"])

        # 3. Generate initial question queue
        questions = await cls._generate_question_queue(
            target_role=role,
            interview_type=interview_type,
            difficulty=difficulty,
            question_count=question_count,
            focus_skills=effective_focus,
            readiness_score=readiness_score
        )

        session_doc = {
            "id": session_id,
            "learnerId": learner_id,
            "targetRole": role,
            "interviewType": interview_type,
            "difficulty": difficulty,
            "questionCount": len(questions),
            "focusSkills": effective_focus,
            "status": "WAITING_FOR_ANSWER",
            "currentQuestionIndex": 0,
            "questions": questions,
            "finalReport": None,
            "startedAt": now_iso,
            "completedAt": None
        }

        # 4. Persist session
        await cls._save_session(session_doc)

        return session_doc

    @classmethod
    async def get_session(cls, session_id: str) -> Dict[str, Any]:
        session = await cls._load_session(session_id)
        if not session:
            raise ResourceNotFoundError(f"Interview session '{session_id}' not found.")
        return session

    @classmethod
    async def get_current_question(cls, session_id: str) -> Dict[str, Any]:
        session = await cls.get_session(session_id)
        idx = session.get("currentQuestionIndex", 0)
        questions = session.get("questions", [])

        if idx >= len(questions) or session.get("status") == "COMPLETED":
            return {
                "id": "complete",
                "question": "Interview completed",
                "skill": "All",
                "difficulty": "N/A",
                "type": "N/A",
                "questionNumber": len(questions),
                "totalQuestions": len(questions),
                "isFollowUp": False,
                "isComplete": True
            }

        q = questions[idx]
        is_follow_up = session.get("status") == "FOLLOW_UP" and bool(q.get("followUpQuestion"))

        return {
            "id": q["id"],
            "question": q["followUpQuestion"] if is_follow_up else q["question"],
            "skill": q["skill"],
            "difficulty": q["difficulty"],
            "type": q["type"],
            "questionNumber": idx + 1,
            "totalQuestions": len(questions),
            "isFollowUp": is_follow_up,
            "parentQuestionText": q["question"] if is_follow_up else None
        }

    @classmethod
    async def submit_answer(cls, session_id: str, answer_text: str) -> Dict[str, Any]:
        clean_answer = (answer_text or "").strip()
        if not clean_answer:
            raise ValidationError("Please enter an answer before submitting.")
        if len(clean_answer) > 4000:
            raise ValidationError("Answer exceeds maximum length of 4,000 characters.")

        session = await cls.get_session(session_id)
        if session.get("status") == "COMPLETED":
            raise ValidationError("This interview session has already been completed.")

        idx = session["currentQuestionIndex"]
        questions = session["questions"]
        if idx >= len(questions):
            raise ValidationError("No active question found for this session.")

        current_q = questions[idx]

        # 1. Evaluate answer via Gemini or grounded fallback
        evaluation = await cls._evaluate_answer(
            question=current_q["question"],
            skill=current_q["skill"],
            expected_concepts=current_q.get("expectedConcepts", []),
            answer=clean_answer
        )

        current_q["answer"] = clean_answer
        current_q["evaluation"] = evaluation
        current_q["status"] = "evaluated"

        # 2. Check if a follow-up should be triggered
        has_follow_up = False
        follow_up_text = None
        follow_up_concepts = []

        # Follow-up condition: score between 40 and 75 or missing a key concept
        if 40.0 <= evaluation["overallScore"] <= 78.0 and evaluation.get("missingConcepts"):
            follow_up_data = await cls._generate_follow_up(
                main_question=current_q["question"],
                answer=clean_answer,
                missing_concepts=evaluation["missingConcepts"],
                skill=current_q["skill"]
            )
            if follow_up_data and follow_up_data.get("question"):
                has_follow_up = True
                follow_up_text = follow_up_data["question"]
                follow_up_concepts = follow_up_data.get("expectedConcepts", [])
                current_q["followUpQuestion"] = follow_up_text
                current_q["followUpExpectedConcepts"] = follow_up_concepts
                session["status"] = "FOLLOW_UP"

        if not has_follow_up:
            session["status"] = "FEEDBACK"

        # 3. Determine next step
        if has_follow_up:
            next_step = "follow_up"
        elif idx >= len(questions) - 1:
            next_step = "complete"
        else:
            next_step = "next_question"

        await cls._save_session(session)

        return {
            "questionId": current_q["id"],
            "evaluation": evaluation,
            "hasFollowUp": has_follow_up,
            "followUpQuestion": follow_up_text,
            "nextStep": next_step
        }

    @classmethod
    async def submit_follow_up(cls, session_id: str, follow_up_answer: str) -> Dict[str, Any]:
        clean_ans = (follow_up_answer or "").strip()
        if not clean_ans:
            raise ValidationError("Please provide a response to the follow-up question.")

        session = await cls.get_session(session_id)
        idx = session["currentQuestionIndex"]
        current_q = session["questions"][idx]

        # Evaluate follow-up
        follow_eval = await cls._evaluate_answer(
            question=current_q.get("followUpQuestion", ""),
            skill=current_q["skill"],
            expected_concepts=current_q.get("followUpExpectedConcepts", []),
            answer=clean_ans
        )

        current_q["followUpAnswer"] = clean_ans
        current_q["followUpEvaluation"] = follow_eval

        # Blend scores (Main 70%, Follow-up 30%)
        orig_score = current_q["evaluation"]["overallScore"]
        blended_score = round((orig_score * 0.7) + (follow_eval["overallScore"] * 0.3), 1)
        current_q["evaluation"]["overallScore"] = blended_score

        if follow_eval["strengths"]:
            current_q["evaluation"]["strengths"].extend(follow_eval["strengths"])

        session["status"] = "FEEDBACK"
        next_step = "complete" if idx >= len(session["questions"]) - 1 else "next_question"

        await cls._save_session(session)

        return {
            "questionId": current_q["id"],
            "evaluation": current_q["evaluation"],
            "nextStep": next_step
        }

    @classmethod
    async def next_question(cls, session_id: str) -> Dict[str, Any]:
        session = await cls.get_session(session_id)
        idx = session["currentQuestionIndex"]
        questions = session["questions"]

        if idx + 1 < len(questions):
            session["currentQuestionIndex"] = idx + 1
            session["status"] = "WAITING_FOR_ANSWER"
            await cls._save_session(session)
            return await cls.get_current_question(session_id)
        else:
            return await cls.complete_interview(session_id)

    @classmethod
    async def complete_interview(cls, session_id: str) -> Dict[str, Any]:
        session = await cls.get_session(session_id)
        if session.get("status") == "COMPLETED" and session.get("finalReport"):
            return session["finalReport"]

        questions = session.get("questions", [])
        evaluated_qs = [q for q in questions if q.get("evaluation")]

        # Calculate dimension averages
        if evaluated_qs:
            tech_scores = [q["evaluation"]["technicalScore"] for q in evaluated_qs]
            conc_scores = [q["evaluation"]["conceptualScore"] for q in evaluated_qs]
            comm_scores = [q["evaluation"]["communicationScore"] for q in evaluated_qs]
            overall_scores = [q["evaluation"]["overallScore"] for q in evaluated_qs]

            avg_tech = round(sum(tech_scores) / len(tech_scores), 1)
            avg_conc = round(sum(conc_scores) / len(conc_scores), 1)
            avg_comm = round(sum(comm_scores) / len(comm_scores), 1)
            avg_overall = round(sum(overall_scores) / len(overall_scores), 1)
        else:
            avg_tech, avg_conc, avg_comm, avg_overall = 70.0, 70.0, 75.0, 71.0

        # Performance Status
        if avg_overall >= PERFORMANCE_THRESHOLDS["STRONG"]:
            status = "STRONG"
        elif avg_overall >= PERFORMANCE_THRESHOLDS["GOOD"]:
            status = "GOOD"
        elif avg_overall >= PERFORMANCE_THRESHOLDS["DEVELOPING"]:
            status = "DEVELOPING"
        else:
            status = "NEEDS_IMPROVEMENT"

        # Skill-wise breakdown
        skill_groups: Dict[str, List[float]] = {}
        for q in evaluated_qs:
            sk = q.get("skill", "General")
            skill_groups.setdefault(sk, []).append(q["evaluation"]["overallScore"])

        skill_performance = []
        for sk, sc_list in skill_groups.items():
            sk_avg = round(sum(sc_list) / len(sc_list), 1)
            if sk_avg >= 80:
                sk_status = "STRONG"
            elif sk_avg >= 65:
                sk_status = "GOOD"
            elif sk_avg >= 50:
                sk_status = "DEVELOPING"
            else:
                sk_status = "NEEDS_IMPROVEMENT"
            skill_performance.append({
                "skill": sk,
                "score": sk_avg,
                "status": sk_status
            })

        # Consolidate strengths, weaknesses, and missing concepts
        all_strengths = []
        all_weaknesses = []
        all_missing = []
        for q in evaluated_qs:
            ev = q["evaluation"]
            all_strengths.extend(ev.get("strengths", []))
            all_weaknesses.extend(ev.get("weaknesses", []))
            all_missing.extend(ev.get("missingConcepts", []))

        unique_strengths = list(dict.fromkeys(all_strengths))[:4]
        unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:4]
        unique_missing = list(dict.fromkeys(all_missing))[:4]

        # Recommended Next Steps
        recommended_steps = []
        if unique_missing:
            recommended_steps.append({
                "id": "rec_review_missed",
                "type": "Concept Review",
                "title": f"Review Core Concepts: {', '.join(unique_missing[:2])}",
                "reason": "Directly addresses gaps exposed during technical questions."
            })
        if unique_weaknesses:
            recommended_steps.append({
                "id": "rec_practice_tradeoffs",
                "type": "Interview Practice",
                "title": "Practice Architectural Tradeoffs & System Design",
                "reason": "Strengthen technical justification and communication depth."
            })
        recommended_steps.append({
            "id": "rec_retry",
            "type": "Mock Simulation",
            "title": "Retake Mock Interview in 1 Week",
            "reason": "Validate concept retention and monitor score improvement."
        })

        # Retrieve RAG & YouTube recommendations for missed concepts
        recommended_resources = []
        target_concept = unique_missing[0] if unique_missing else "machine-learning"
        try:
            resources = await ResourceDiscoveryService.discover_resources_for_skill(
                skill_id=target_concept.lower().replace(" ", "-"),
                difficulty="Beginner",
                limit=3
            )
            for res in resources:
                recommended_resources.append({
                    "id": res.get("id"),
                    "title": res.get("title"),
                    "provider": res.get("provider", "YouTube"),
                    "url": res.get("url", "#"),
                    "type": res.get("type", "video"),
                    "duration": res.get("duration", "15m"),
                    "reason": f"Targeted review for missed interview concept: {target_concept}"
                })
        except Exception as e:
            logger.warning(f"Could not retrieve post-interview RAG resources ({e})")

        readiness_summary = f"You demonstrated {status.replace('_', ' ').title()} overall capability with {avg_overall}% demonstrated score. Focusing on {', '.join(unique_missing[:2]) if unique_missing else 'advanced electives'} will bring you to full interview mastery."

        final_report = {
            "sessionId": session_id,
            "overallScore": avg_overall,
            "status": status,
            "technicalScore": avg_tech,
            "conceptualScore": avg_conc,
            "communicationScore": avg_comm,
            "problemSolvingScore": round((avg_tech + avg_conc) / 2, 1),
            "skillPerformance": skill_performance,
            "strengths": unique_strengths or ["Clear structured communication", "Good foundational accuracy"],
            "weaknesses": unique_weaknesses or ["Provide more concrete real-world examples"],
            "missingConcepts": unique_missing,
            "recommendedSteps": recommended_steps,
            "recommendedResources": recommended_resources,
            "interviewReadinessSummary": readiness_summary
        }

        # Complete session doc
        session["status"] = "COMPLETED"
        session["completedAt"] = datetime.utcnow().isoformat()
        session["finalReport"] = final_report
        await cls._save_session(session)

        return final_report

    @classmethod
    async def get_interview_history(cls, learner_id: str = "demo-learner") -> List[Dict[str, Any]]:
        # From MongoDB
        try:
            db = get_database()
            if db is not None:
                cursor = db.interview_sessions.find({"learnerId": learner_id, "status": "COMPLETED"}).sort("completedAt", -1)
                docs = await cursor.to_list(length=20)
                if docs:
                    for d in docs:
                        d["_id"] = str(d.get("_id"))
                    return docs
        except Exception:
            pass

        # In-Memory
        mem_history = [s for s in _SESSION_STORE.values() if s.get("learnerId") == learner_id and s.get("status") == "COMPLETED"]
        mem_history.sort(key=lambda s: s.get("completedAt", ""), reverse=True)
        return mem_history

    @classmethod
    async def _generate_question_queue(
        cls,
        target_role: str,
        interview_type: str,
        difficulty: str,
        question_count: int,
        focus_skills: List[str],
        readiness_score: float
    ) -> List[Dict[str, Any]]:
        # Attempt Gemini Generation
        prompt = f"""Generate {question_count} distinct, role-relevant mock interview questions for a candidate aiming for the '{target_role}' role.
Interview Type: {interview_type}
Focus Skills: {', '.join(focus_skills)}
Candidate Current Readiness: {readiness_score}%

Return ONLY a JSON array with exactly {question_count} objects matching this schema:
[
  {{
    "question": "Question text here",
    "skill": "Specific Skill name (e.g. Machine Learning, Python, Statistics, MLOps, Problem Solving)",
    "difficulty": "easy" | "medium" | "hard",
    "type": "technical" | "conceptual" | "project" | "behavioral",
    "expectedConcepts": ["concept1", "concept2", "concept3"]
  }}
]"""

        try:
            system_inst = "You are an expert technical interviewer at a top technology company. Generate crisp, professional interview questions."
            response = await GeminiService.generate_response(
                system_instruction=system_inst,
                user_prompt=prompt
            )
            # Response might be dictionary or text
            if isinstance(response, dict) and "answer" in response:
                parsed_list = GeminiService._parse_response(response["answer"])
                if isinstance(parsed_list, list) and len(parsed_list) >= question_count:
                    formatted = []
                    for idx, item in enumerate(parsed_list[:question_count]):
                        formatted.append({
                            "id": f"q_{uuid.uuid4().hex[:8]}",
                            "question": item.get("question"),
                            "skill": item.get("skill", focus_skills[0] if focus_skills else "Machine Learning"),
                            "difficulty": item.get("difficulty", "medium"),
                            "type": item.get("type", "technical"),
                            "expectedConcepts": item.get("expectedConcepts", []),
                            "status": "pending"
                        })
                    return formatted
        except Exception as e:
            logger.warning(f"Gemini question generation fallback ({e})")

        # Fallback question bank
        selected_fb = FALLBACK_QUESTIONS[:question_count]
        formatted_fb = []
        for q in selected_fb:
            q_copy = dict(q)
            q_copy["id"] = f"q_{uuid.uuid4().hex[:8]}"
            q_copy["status"] = "pending"
            formatted_fb.append(q_copy)
        return formatted_fb

    @classmethod
    async def _evaluate_answer(
        cls,
        question: str,
        skill: str,
        expected_concepts: List[str],
        answer: str
    ) -> Dict[str, Any]:
        prompt = f"""Evaluate the candidate's interview answer to the following technical question.

Question: "{question}"
Target Skill: {skill}
Expected Hidden Concepts: {', '.join(expected_concepts)}

Candidate Answer:
<candidate_answer>
{answer}
</candidate_answer>

Return strictly a JSON object with scores between 0 and 100 and constructive feedback:
{{
  "technicalScore": 75,
  "conceptualScore": 70,
  "completenessScore": 65,
  "relevanceScore": 85,
  "communicationScore": 80,
  "overallScore": 74,
  "strengths": ["Strengths demonstrated"],
  "weaknesses": ["Specific gaps"],
  "missingConcepts": ["Any expected concepts not mentioned"],
  "feedback": "Honest, constructive paragraph evaluating the response.",
  "idealAnswerPoints": ["Key point 1", "Key point 2"]
}}"""

        try:
            system_inst = "You are a senior engineering hiring manager. Evaluate technical interview responses with rigorous, honest, and constructive assessment."
            gemini_res = await GeminiService.generate_response(
                system_instruction=system_inst,
                user_prompt=prompt
            )
            if isinstance(gemini_res, dict) and "technicalScore" in gemini_res:
                return cls._sanitize_evaluation(gemini_res)
            elif isinstance(gemini_res, dict) and "answer" in gemini_res:
                parsed = GeminiService._parse_response(gemini_res["answer"])
                if isinstance(parsed, dict) and "technicalScore" in parsed:
                    return cls._sanitize_evaluation(parsed)
        except Exception as e:
            logger.warning(f"Gemini evaluation failed ({e}). Using grounded evaluator.")

        # Grounded fallback evaluation based on keyword coverage
        return cls._grounded_fallback_eval(question, expected_concepts, answer)

    @classmethod
    async def _generate_follow_up(
        cls,
        main_question: str,
        answer: str,
        missing_concepts: List[str],
        skill: str
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""The candidate gave a partially complete answer to: "{main_question}".
They missed the following key concepts: {', '.join(missing_concepts)}.

Generate ONE targeted follow-up question to probe their understanding of: {missing_concepts[0] if missing_concepts else skill}.

Return strictly a JSON object:
{{
  "question": "Targeted follow-up question text",
  "expectedConcepts": ["concept1", "concept2"]
}}"""
        try:
            res = await GeminiService.generate_response(
                system_instruction="Generate a concise technical follow-up question.",
                user_prompt=prompt
            )
            if isinstance(res, dict) and "question" in res:
                return res
        except Exception:
            pass

        # Fallback follow-up
        if missing_concepts:
            return {
                "question": f"Can you elaborate specifically on how {missing_concepts[0]} applies in this scenario?",
                "expectedConcepts": [missing_concepts[0]]
            }
        return None

    @classmethod
    def _sanitize_evaluation(cls, ev: Dict[str, Any]) -> Dict[str, Any]:
        tech = max(0.0, min(100.0, float(ev.get("technicalScore", 70))))
        conc = max(0.0, min(100.0, float(ev.get("conceptualScore", 70))))
        comp = max(0.0, min(100.0, float(ev.get("completenessScore", 65))))
        rel = max(0.0, min(100.0, float(ev.get("relevanceScore", 80))))
        comm = max(0.0, min(100.0, float(ev.get("communicationScore", 75))))

        overall = round(
            (tech * EVALUATION_WEIGHTS["technical"]) +
            (conc * EVALUATION_WEIGHTS["conceptual"]) +
            (comp * EVALUATION_WEIGHTS["completeness"]) +
            (rel * EVALUATION_WEIGHTS["relevance"]) +
            (comm * EVALUATION_WEIGHTS["communication"]),
            1
        )

        return {
            "technicalScore": tech,
            "conceptualScore": conc,
            "completenessScore": comp,
            "relevanceScore": rel,
            "communicationScore": comm,
            "overallScore": overall,
            "strengths": ev.get("strengths", ["Identified primary technical mechanism"]),
            "weaknesses": ev.get("weaknesses", ["Could provide deeper mathematical intuition"]),
            "missingConcepts": ev.get("missingConcepts", []),
            "feedback": ev.get("feedback", "Good conceptual foundation with room for greater technical precision."),
            "idealAnswerPoints": ev.get("idealAnswerPoints", ["Clear definition", "Practical tradeoff analysis"])
        }

    @classmethod
    def _grounded_fallback_eval(cls, question: str, expected_concepts: List[str], answer: str) -> Dict[str, Any]:
        ans_lower = answer.lower()
        matched = [c for c in expected_concepts if c.lower() in ans_lower]
        missing = [c for c in expected_concepts if c.lower() not in ans_lower]

        ratio = len(matched) / max(len(expected_concepts), 1)
        base_score = 45.0 + (ratio * 45.0)
        # Bonus for answer depth
        if len(answer.split()) > 40:
            base_score = min(92.0, base_score + 8.0)

        score = round(base_score, 1)

        strengths = [f"Correctly referenced {m}" for m in matched] if matched else ["Communicated response clearly"]
        weaknesses = [f"Omitted explanation of {m}" for m in missing] if missing else ["Solid technical coverage"]

        return {
            "technicalScore": score,
            "conceptualScore": max(40.0, score - 5.0),
            "completenessScore": round(ratio * 100.0, 1),
            "relevanceScore": 85.0,
            "communicationScore": 78.0,
            "overallScore": score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missingConcepts": missing,
            "feedback": f"Your response demonstrates familiarity with the core topic. Incorporating {' and '.join(missing[:2]) if missing else 'edge-case considerations'} will make your explanation industry-ready.",
            "idealAnswerPoints": [f"Clearly explain {c}" for c in expected_concepts[:2]]
        }

    @classmethod
    async def _load_session(cls, session_id: str) -> Optional[Dict[str, Any]]:
        if session_id in _SESSION_STORE:
            return _SESSION_STORE[session_id]

        try:
            db = get_database()
            if db is not None:
                doc = await db.interview_sessions.find_one({"id": session_id})
                if doc:
                    doc["_id"] = str(doc.get("_id"))
                    _SESSION_STORE[session_id] = doc
                    return doc
        except Exception:
            pass
        return None

    @classmethod
    async def _save_session(cls, session: Dict[str, Any]):
        sid = session["id"]
        _SESSION_STORE[sid] = session

        try:
            db = get_database()
            if db is not None:
                await db.interview_sessions.update_one(
                    {"id": sid},
                    {"$set": session},
                    upsert=True
                )
        except Exception as e:
            logger.warning(f"Could not persist interview session to MongoDB ({e}). Preserved in-memory.")
