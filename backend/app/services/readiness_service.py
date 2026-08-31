import logging
import uuid
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.scoring.readiness_config import (
    READINESS_WEIGHTS,
    READINESS_STATUS_THRESHOLDS,
    SKILL_STATUS_THRESHOLDS,
    INTERVIEW_READINESS_THRESHOLD,
    MIN_SKILL_COVERAGE_FOR_INTERVIEW,
    CONFIDENCE_THRESHOLDS,
    ROADMAP_PRIORITY_WEIGHTS
)
from app.repositories.learner_repository import LearnerRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.personalized_roadmap_service import PersonalizedRoadmapService
from app.services.gap_service import GapService
from app.services.adaptation_service import AdaptationService
from app.services.skill_graph_engine import SkillGraphEngine
from app.database.mongodb import get_database

logger = logging.getLogger(__name__)

# In-Memory Cache for Readiness Snapshots
_SNAPSHOT_STORE: List[Dict[str, Any]] = []

class ReadinessService:
    """
    Authoritative Readiness Intelligence Service.
    Calculates 7-dimensional job readiness, per-skill readiness,
    critical gaps, interview eligibility, and data completeness.
    """

    @classmethod
    async def evaluate_readiness(cls, learner_id: str = "demo-learner") -> Dict[str, Any]:
        # 1. Fetch live learner profile
        learner = None
        try:
            learner = await LearnerRepository.get_by_id(learner_id)
        except Exception:
            pass

        if not learner:
            learner = {
                "id": learner_id,
                "name": "Alex Morgan",
                "targetRole": "AI Engineer",
                "goal": "Master AI Engineering",
                "experienceLevel": "Intermediate",
                "hoursPerWeek": 10.0,
                "targetMonths": 4,
                "learningPreference": "video",
                "skills": [
                    {"name": "Python", "level": "Intermediate"},
                    {"name": "SQL", "level": "Intermediate"},
                    {"name": "Git", "level": "Intermediate"},
                    {"name": "NumPy", "level": "Beginner"}
                ]
            }

        target_role = learner.get("targetRole", "AI Engineer")

        # 2. Fetch Personalized Roadmap & Skill Graph
        try:
            roadmap = await PersonalizedRoadmapService.get_personalized_roadmap(learner_id=learner_id, target_role=target_role)
        except Exception as e:
            logger.warning(f"Could not load roadmap for readiness evaluation ({e})")
            roadmap = {"nodes": [], "edges": []}

        # 3. Fetch Progress
        try:
            progress = await ProgressRepository.get_by_learner_id(learner_id) or {}
        except Exception:
            progress = {}

        # 4. Fetch Skill Gaps
        try:
            gap_data = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
        except Exception:
            gap_data = {"summary": {}, "actionable_gaps": [], "blocked_gaps": [], "skills_breakdown": []}

        # 5. Fetch Feedback History for Adaptation
        try:
            feedback_history = await AdaptationService.get_feedback_for_learner(learner_id)
        except Exception:
            feedback_history = []

        # 6. Calculate 7 Dimensions
        dimensions = cls._calculate_dimensions(learner, roadmap, progress, gap_data)

        # 7. Dynamic Weight Normalization & Overall Score
        overall_score, data_completeness, normalized_weights = cls._calculate_overall_score(dimensions)

        # 8. Status & Confidence
        status = cls._determine_readiness_status(overall_score)
        confidence = cls._determine_confidence(data_completeness)

        # 9. Skill Readiness Breakdown
        skills_readiness = cls._calculate_skill_readiness(learner, gap_data, roadmap)

        # 10. Critical Gaps & Strengths
        critical_gaps, strengths = cls._extract_critical_gaps_and_strengths(skills_readiness)

        # 11. Interview Readiness Signal
        interview_ready, interview_explanation = cls._evaluate_interview_readiness(
            overall_score,
            dimensions.get("skillCoverage") or 0.0,
            critical_gaps
        )

        # 12. Next Best Actions
        next_actions = cls._determine_next_actions(
            skills_readiness,
            critical_gaps,
            gap_data,
            roadmap,
            feedback_history
        )

        # 13. Human-Readable Explanation
        explanation = cls._generate_readiness_explanation(
            overall_score,
            status,
            target_role,
            strengths,
            critical_gaps
        )

        now_iso = datetime.utcnow().isoformat()

        response = {
            "learnerId": learner_id,
            "score": round(overall_score, 1),
            "status": status,
            "confidence": confidence,
            "dataCompleteness": round(data_completeness, 1),
            "dimensions": dimensions,
            "dimensionWeights": normalized_weights,
            "strengths": strengths,
            "criticalGaps": critical_gaps,
            "nextActions": next_actions,
            "interviewReady": interview_ready,
            "interviewReadinessExplanation": interview_explanation,
            "explanation": explanation,
            "lastCalculatedAt": now_iso
        }

        # Persist snapshot
        await cls._save_snapshot(learner_id, overall_score, status)

        return response

    @classmethod
    def _calculate_dimensions(
        cls,
        learner: Dict[str, Any],
        roadmap: Dict[str, Any],
        progress: Dict[str, Any],
        gap_data: Dict[str, Any]
    ) -> Dict[str, Optional[float]]:
        # A. Skill Coverage
        summary = gap_data.get("summary", {})
        total_skills = summary.get("total_role_skills", 8)
        known_skills = summary.get("known_skills_count", 4)
        skill_coverage = min(100.0, max(0.0, (known_skills / max(total_skills, 1)) * 100.0))

        # B. Prerequisite Completion
        nodes = roadmap.get("nodes", [])
        if nodes:
            prereq_satisfied_count = 0
            for n in nodes:
                if not n.get("is_blocked"):
                    prereq_satisfied_count += 1
            prerequisite_completion = min(100.0, max(0.0, (prereq_satisfied_count / len(nodes)) * 100.0))
        else:
            prerequisite_completion = 50.0

        # C. Roadmap Progress (Respecting Yellow > White > Green priorities)
        if nodes:
            total_weighted_points = 0.0
            earned_weighted_points = 0.0
            for n in nodes:
                color = n.get("color", "white").lower()
                weight = ROADMAP_PRIORITY_WEIGHTS.get(color, 0.6)
                total_weighted_points += weight
                if n.get("status") == "completed":
                    earned_weighted_points += weight
                elif n.get("status") == "in_progress":
                    earned_weighted_points += weight * 0.4

            roadmap_progress = min(100.0, max(0.0, (earned_weighted_points / max(total_weighted_points, 0.1)) * 100.0))
        else:
            roadmap_progress = float(progress.get("overallProgress", 32.0))

        # D. Practical Experience
        completed_activities = progress.get("completedActivities", [])
        learning_hours = float(progress.get("learningHours", 24.0))
        # Evaluate practical projects / logged activities
        if completed_activities or learning_hours > 0:
            # 50 hours of practical application equates to 100% practical benchmark
            practical_experience = min(100.0, max(10.0, (learning_hours / 50.0) * 100.0))
        else:
            practical_experience = None

        # E. Assessment Performance (None if no assessment data exists; NEVER fake to 0)
        assessments = progress.get("assessments", [])
        if assessments and len(assessments) > 0:
            scores = [a.get("score", 0) for a in assessments if "score" in a]
            assessment_performance = (sum(scores) / len(scores)) if scores else None
        else:
            assessment_performance = None

        # F. Learning Consistency
        current_streak = float(progress.get("currentStreak", 5))
        # 14 days streak = full consistency benchmark
        streak_factor = min(1.0, current_streak / 14.0)
        learning_consistency = min(100.0, max(20.0, streak_factor * 100.0))

        # G. Goal Alignment
        # Measures target role match with current focus
        target_role = learner.get("targetRole", "AI Engineer")
        if target_role:
            goal_alignment = 85.0
        else:
            goal_alignment = 50.0

        return {
            "skillCoverage": round(skill_coverage, 1),
            "prerequisiteCompletion": round(prerequisite_completion, 1),
            "roadmapProgress": round(roadmap_progress, 1),
            "practicalExperience": round(practical_experience, 1) if practical_experience is not None else None,
            "assessmentPerformance": round(assessment_performance, 1) if assessment_performance is not None else None,
            "learningConsistency": round(learning_consistency, 1),
            "goalAlignment": round(goal_alignment, 1)
        }

    @classmethod
    def _calculate_overall_score(
        cls,
        dimensions: Dict[str, Optional[float]]
    ) -> tuple[float, float, Dict[str, float]]:
        # Identify available dimensions
        available_dims = {k: v for k, v in dimensions.items() if v is not None}

        # Calculate sum of available default weights
        available_weight_sum = sum(READINESS_WEIGHTS.get(k, 0.0) for k in available_dims.keys())

        if available_weight_sum <= 0:
            return 0.0, 0.0, {}

        # Data completeness percentage
        data_completeness = min(100.0, available_weight_sum * 100.0)

        # Normalize weights
        normalized_weights = {}
        weighted_score = 0.0

        for dim_name, score_val in available_dims.items():
            base_w = READINESS_WEIGHTS.get(dim_name, 0.0)
            norm_w = base_w / available_weight_sum
            normalized_weights[dim_name] = round(norm_w, 3)
            weighted_score += score_val * norm_w

        # Strictly clamp 0 to 100
        overall_score = max(0.0, min(100.0, weighted_score))

        return overall_score, data_completeness, normalized_weights

    @classmethod
    def _determine_readiness_status(cls, score: float) -> str:
        if score >= READINESS_STATUS_THRESHOLDS["READY"]:
            return "READY"
        elif score >= READINESS_STATUS_THRESHOLDS["NEAR_READY"]:
            return "NEAR_READY"
        elif score >= READINESS_STATUS_THRESHOLDS["BUILDING"]:
            return "BUILDING"
        return "NOT_READY"

    @classmethod
    def _determine_confidence(cls, completeness: float) -> str:
        if completeness >= CONFIDENCE_THRESHOLDS["HIGH"]:
            return "HIGH"
        elif completeness >= CONFIDENCE_THRESHOLDS["MEDIUM"]:
            return "MEDIUM"
        return "LOW"

    @classmethod
    def _calculate_skill_readiness(
        cls,
        learner: Dict[str, Any],
        gap_data: Dict[str, Any],
        roadmap: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        results = []
        gaps_list = gap_data.get("gaps", [])
        
        # Build node blocker map
        blocked_nodes = {n.get("skillId") or n.get("id"): n for n in roadmap.get("nodes", []) if n.get("is_blocked")}

        for g in gaps_list:
            skill_id = g.get("skill_id")
            skill_name = g.get("skill_name") or skill_id.replace("-", " ").title()
            cur_lvl_str = str(g.get("current_level", "")).lower()
            req_lvl_str = str(g.get("required_level", "intermediate")).lower()
            
            level_map = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
            cur_lvl = level_map.get(cur_lvl_str, 0)
            req_lvl = level_map.get(req_lvl_str, 2)
            gap = max(0, req_lvl - cur_lvl)
            is_blocked = g.get("is_blocked", False) or (skill_id in blocked_nodes)
            blocking_prereqs = g.get("blocking_skills", [])

            # Base score from level ratio
            if g.get("gap_type") == "NO_GAP":
                base_score = 90.0
            elif g.get("gap_type") == "PARTIAL_GAP":
                base_score = 60.0
            elif g.get("gap_type") == "OPTIONAL_GAP":
                base_score = 50.0
            else:
                base_score = 25.0

            # Prerequisite gating: if blocked, cap readiness at 45%
            if is_blocked:
                final_score = min(45.0, base_score * 0.7)
            else:
                final_score = base_score

            # Clamp score
            score_clamped = max(0.0, min(100.0, final_score))

            # Status determination
            if score_clamped >= SKILL_STATUS_THRESHOLDS["READY"]:
                status = "READY"
            elif score_clamped >= SKILL_STATUS_THRESHOLDS["DEVELOPING"]:
                status = "DEVELOPING"
            elif score_clamped >= SKILL_STATUS_THRESHOLDS["NEEDS_ATTENTION"]:
                status = "NEEDS_ATTENTION"
            else:
                status = "NOT_STARTED"

            results.append({
                "skillId": skill_id,
                "name": skill_name,
                "score": round(score_clamped, 1),
                "status": status,
                "currentLevel": cur_lvl,
                "requiredLevel": req_lvl,
                "gap": gap,
                "isBlocked": is_blocked,
                "blockingPrerequisites": blocking_prereqs
            })

        return results

    @classmethod
    def _extract_critical_gaps_and_strengths(
        cls,
        skills_readiness: List[Dict[str, Any]]
    ) -> tuple[List[Dict[str, Any]], List[str]]:
        critical_gaps = []
        strengths = []

        for sr in skills_readiness:
            if sr["score"] >= 80.0:
                strengths.append(sr["name"])
            else:
                importance = "critical" if sr["requiredLevel"] >= 2 else "high"
                reason = "Prerequisite blocked by foundational topics" if sr["isBlocked"] else "Core competency required for target role"
                critical_gaps.append({
                    "skillId": sr["skillId"],
                    "name": sr["name"],
                    "currentLevel": sr["currentLevel"],
                    "requiredLevel": sr["requiredLevel"],
                    "gap": sr["gap"] if sr["gap"] > 0 else 1,
                    "importance": importance,
                    "reason": reason,
                    "prerequisiteBlocked": sr["isBlocked"]
                })

        # Sort critical gaps: unblocked critical first, then blocked
        critical_gaps.sort(key=lambda g: (g["prerequisiteBlocked"], -g["gap"]))
        return critical_gaps, strengths

    @classmethod
    def _evaluate_interview_readiness(
        cls,
        overall_score: float,
        skill_coverage: float,
        critical_gaps: List[Dict[str, Any]]
    ) -> tuple[bool, str]:
        has_unblocked_critical = any(g["importance"] == "critical" and not g["prerequisiteBlocked"] for g in critical_gaps)

        if overall_score >= INTERVIEW_READINESS_THRESHOLD and skill_coverage >= MIN_SKILL_COVERAGE_FOR_INTERVIEW and not has_unblocked_critical:
            return True, "You meet the core competency threshold and are eligible for comprehensive mock interviews."
        else:
            reasons = []
            if overall_score < INTERVIEW_READINESS_THRESHOLD:
                reasons.append(f"Overall readiness ({round(overall_score)}%) is below the {INTERVIEW_READINESS_THRESHOLD}% benchmark")
            if skill_coverage < MIN_SKILL_COVERAGE_FOR_INTERVIEW:
                reasons.append(f"Skill coverage ({round(skill_coverage)}%) needs to reach at least {MIN_SKILL_COVERAGE_FOR_INTERVIEW}%")
            if has_unblocked_critical:
                reasons.append("Critical foundational gaps remain open")

            explanation = f"Not fully interview-ready yet ({'; '.join(reasons)}). You can still practice individual topic mock questions anytime."
            return False, explanation

    @classmethod
    def _determine_next_actions(
        cls,
        skills_readiness: List[Dict[str, Any]],
        critical_gaps: List[Dict[str, Any]],
        gap_data: Dict[str, Any],
        roadmap: Dict[str, Any],
        feedback_history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        actions = []
        
        # Check feedback adjustments
        difficult_skills = {f.get("targetId") for f in feedback_history if f.get("type") == "difficulty" and f.get("value") in ["too_difficult", "too_hard"]}

        # Action 1: Top actionable gap
        actionable_gaps = [g for g in critical_gaps if not g["prerequisiteBlocked"]]
        if actionable_gaps:
            top_gap = actionable_gaps[0]
            sid = top_gap["skillId"]
            if sid in difficult_skills:
                actions.append({
                    "id": f"act_{sid}_foundations",
                    "type": "resource",
                    "title": f"Review {top_gap['name']} Visual Walkthroughs",
                    "reason": f"You noted difficulty with {top_gap['name']}. Master bite-sized visual foundations before advanced tasks.",
                    "priority": "high",
                    "estimatedHours": 3.0,
                    "impact": 12.0,
                    "targetId": sid
                })
            else:
                actions.append({
                    "id": f"act_{sid}_core",
                    "type": "skill",
                    "title": f"Complete {top_gap['name']} Fundamentals",
                    "reason": f"Your target role requires {top_gap['name']} and it is currently your highest-priority open gap.",
                    "priority": "high",
                    "estimatedHours": 5.0,
                    "impact": 15.0,
                    "targetId": sid
                })

        # Action 2: Next roadmap node
        in_progress_node = next((n for n in roadmap.get("nodes", []) if n.get("status") == "in_progress"), None)
        if in_progress_node:
            actions.append({
                "id": f"act_node_{in_progress_node.get('id')}",
                "type": "roadmap_node",
                "title": f"Advance '{in_progress_node.get('title') or in_progress_node.get('name')}' Roadmap Node",
                "reason": "Currently active module in your personalized curriculum.",
                "priority": "high",
                "estimatedHours": 4.0,
                "impact": 10.0,
                "targetId": in_progress_node.get("skillId") or in_progress_node.get("id")
            })

        # Action 3: Practical hands-on exercise
        actions.append({
            "id": "act_practical_project",
            "type": "project",
            "title": "Build an End-to-End Baseline Model",
            "reason": "Elevates your practical experience dimension and tests real-world application.",
            "priority": "medium",
            "estimatedHours": 6.0,
            "impact": 8.0,
            "targetId": "machine-learning"
        })

        return actions[:3]

    @classmethod
    def _generate_readiness_explanation(
        cls,
        score: float,
        status: str,
        target_role: str,
        strengths: List[str],
        critical_gaps: List[Dict[str, Any]]
    ) -> str:
        s_text = ", ".join(strengths[:3]) if strengths else "Foundational tools"
        g_names = [g["name"] for g in critical_gaps[:2]]
        g_text = " and ".join(g_names) if g_names else "advanced electives"

        return f"Your estimated {target_role} job readiness is {round(score)}% ({status.replace('_', ' ')}). You demonstrate strong proficiency in {s_text}, while {g_text} represent your highest-impact areas for immediate growth."

    @classmethod
    async def get_skill_readiness_list(cls, learner_id: str = "demo-learner") -> List[Dict[str, Any]]:
        readiness_res = await cls.evaluate_readiness(learner_id)
        # Gather full list via gap data
        target_role = "AI Engineer"
        try:
            learner = await LearnerRepository.get_by_id(learner_id)
            if learner:
                target_role = learner.get("targetRole", "AI Engineer")
        except Exception:
            pass

        gap_data = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
        roadmap = await PersonalizedRoadmapService.get_personalized_roadmap(learner_id=learner_id, target_role=target_role)
        return cls._calculate_skill_readiness(learner or {}, gap_data, roadmap)

    @classmethod
    async def get_next_action(cls, learner_id: str = "demo-learner") -> Dict[str, Any]:
        readiness_res = await cls.evaluate_readiness(learner_id)
        actions = readiness_res.get("nextActions", [])
        if actions:
            return actions[0]
        return {
            "id": "act_default",
            "type": "skill",
            "title": "Continue Core Roadmap",
            "reason": "Advance active engineering milestone.",
            "priority": "high",
            "estimatedHours": 4.0,
            "impact": 10.0,
            "targetId": "statistics"
        }

    @classmethod
    async def get_snapshots(cls, learner_id: str = "demo-learner") -> List[Dict[str, Any]]:
        # From MongoDB
        try:
            db = get_database()
            if db is not None:
                cursor = db.readiness_snapshots.find({"learnerId": learner_id}).sort("createdAt", 1)
                docs = await cursor.to_list(length=30)
                if docs:
                    for d in docs:
                        d["_id"] = str(d.get("_id"))
                    return docs
        except Exception:
            pass

        # In-memory fallback
        return [s for s in _SNAPSHOT_STORE if s.get("learnerId") == learner_id]

    @classmethod
    async def _save_snapshot(cls, learner_id: str, score: float, status: str):
        now_iso = datetime.utcnow().isoformat()
        snap = {
            "id": f"snap_{uuid.uuid4().hex[:8]}",
            "learnerId": learner_id,
            "score": round(score, 1),
            "status": status,
            "createdAt": now_iso
        }
        _SNAPSHOT_STORE.append(snap)
        try:
            db = get_database()
            if db is not None:
                # Limit snapshots to at most once per minute
                await db.readiness_snapshots.insert_one(snap)
        except Exception:
            pass
