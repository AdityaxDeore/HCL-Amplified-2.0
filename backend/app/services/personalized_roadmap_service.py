import logging
from typing import Dict, Any, List, Optional
from app.services.roadmap_service import RoadmapService
from app.services.gap_service import GapService
from app.services.recommendation_service import RecommendationService
from app.services.reality_service import RealityService

logger = logging.getLogger(__name__)

class PersonalizedRoadmapService:
    """
    Personalized Roadmap Transformation Service.
    Transforms canonical baseline roadmaps into personalized learner roadmaps
    by layering proficiency, gap priorities, prerequisite blocking, and reality check insights.
    """

    @classmethod
    async def get_personalized_roadmap(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates fully personalized roadmap view without mutating master baseline files.
        """
        # 1. Run gap analysis
        gap_analysis = await GapService.analyze_gaps(learner_id=learner_id, target_role=target_role)
        gaps_list = gap_analysis.get("gaps", [])
        gap_map = {g["skill_id"]: g for g in gaps_list}
        summary = gap_analysis.get("summary", {})
        effective_role = summary.get("target_role", "AI Engineer")
        role_slug = effective_role.lower().replace(" ", "-")

        # 2. Get baseline roadmap
        baseline = await RoadmapService.get_by_id(role_slug)
        baseline_nodes = baseline.get("nodes", [])

        # 3. Get next recommendations & reality check
        rec_data = await RecommendationService.get_recommendations(learner_id=learner_id, target_role=effective_role, limit=3)
        next_best = rec_data.get("next_best_action")

        reality_data = await RealityService.evaluate_reality(learner_id=learner_id, target_role=effective_role)

        # 4. Build personalized nodes
        personalized_nodes = []
        completed_count = 0
        blocked_count = 0
        actionable_count = 0

        for node in baseline_nodes:
            nid = node.get("id")
            gap_info = gap_map.get(nid, {})

            gap_type = gap_info.get("gap_type", "FULL_GAP")
            is_blocked = gap_info.get("is_blocked", False)
            blocking_skills = gap_info.get("blocking_skills", [])
            priority = gap_info.get("priority", 0.5)
            reason = gap_info.get("reason", "")
            est_hours = gap_info.get("estimated_hours", node.get("estimatedHours", 15.0))
            importance = node.get("importance", "mandatory")

            # Determine personalized node status
            if gap_type == "NO_GAP":
                status = "completed"
                completed_count += 1
            elif is_blocked:
                status = "locked"
                blocked_count += 1
            elif next_best and next_best.get("skill_id") == nid:
                status = "in_progress"
                actionable_count += 1
            else:
                status = "not_started"
                actionable_count += 1

            pers_node = {
                "id": nid,
                "title": node.get("title", nid),
                "category": node.get("category", "Foundations"),
                "type": node.get("type", "skill"),
                "importance": importance,
                "status": status,
                "priority": priority,
                "is_blocked": is_blocked,
                "blocking_skills": blocking_skills,
                "estimated_hours": est_hours,
                "reason": reason,
                "included": True,
                "prerequisites": node.get("prerequisites", []),
                "order": node.get("order", 999),
                "month": node.get("month", 1)
            }
            personalized_nodes.append(pers_node)

        total_nodes = len(personalized_nodes)
        progress_pct = int(round((completed_count / max(1, total_nodes)) * 100))

        return {
            "roadmap_id": role_slug,
            "learner_id": learner_id,
            "target_role": effective_role,
            "title": f"Personalized {effective_role} Roadmap",
            "description": f"Customized learning sequence based on your verified skills, priority gaps, and {reality_data.get('hours_per_week', 10)} hrs/week commitment.",
            "overall_progress": progress_pct,
            "total_nodes": total_nodes,
            "completed_nodes_count": completed_count,
            "blocked_nodes_count": blocked_count,
            "actionable_nodes_count": actionable_count,
            "nodes": personalized_nodes,
            "next_best_action": next_best,
            "reality_summary": {
                "status": reality_data.get("status"),
                "available_hours": reality_data.get("available_hours"),
                "required_hours": reality_data.get("required_hours"),
                "workload_ratio": reality_data.get("workload_ratio"),
                "minimum_weekly_hours": reality_data.get("minimum_weekly_hours")
            }
        }
