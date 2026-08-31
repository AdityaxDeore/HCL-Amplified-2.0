import logging
from typing import Dict, Any, List, Optional, Set
from app.repositories.learner_repository import LearnerRepository
from app.services.roadmap_service import RoadmapService
from app.services.skill_graph_engine import SkillGraphEngine
from app.scoring.gap_scoring import GapScoring
from app.utils.errors import ResourceNotFoundError

logger = logging.getLogger(__name__)

class GapService:
    """
    Skill Gap Engine Service.
    Determines learner proficiency gaps against master roadmaps and skill graph ontologies.
    Calculates blocking dependencies, gap categories, and deterministic priority scores.
    """

    @classmethod
    async def analyze_gaps(
        cls,
        learner_id: str = "demo-learner",
        target_role: Optional[str] = None,
        custom_known_skills: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive skill gap analysis for a learner.
        """
        learner = await LearnerRepository.get_by_id(learner_id)
        if not learner:
            # Fallback mock demo learner
            learner = {
                "id": learner_id,
                "name": "Alex Morgan",
                "targetRole": target_role or "AI Engineer",
                "knownSkills": [
                    {"name": "Python", "level": "intermediate"},
                    {"name": "SQL", "level": "intermediate"},
                    {"name": "Git", "level": "intermediate"},
                    {"name": "NumPy", "level": "beginner"}
                ],
                "hoursPerWeek": 10,
                "targetMonths": 4
            }

        effective_role = target_role or learner.get("targetRole", "AI Engineer")
        role_slug = effective_role.lower().replace(" ", "-")

        # Load canonical roadmap
        try:
            roadmap = await RoadmapService.get_by_id(role_slug)
        except Exception:
            raise ResourceNotFoundError(f"TARGET_ROLE_NOT_SUPPORTED: No canonical roadmap found for role '{effective_role}'")

        if not roadmap or not roadmap.get("nodes"):
            raise ResourceNotFoundError(f"TARGET_ROLE_NOT_SUPPORTED: Roadmap for '{effective_role}' has no valid nodes.")

        # Map learner known skills to canonical skill IDs and proficiency levels
        known_skills_raw = custom_known_skills if custom_known_skills is not None else learner.get("knownSkills", [])
        learner_skills_map: Dict[str, str] = {}  # canonical_id -> level_str
        for item in known_skills_raw:
            raw_name = item.get("name") or item.get("id") or item.get("skillId")
            level = item.get("level") or item.get("proficiency") or "intermediate"
            if raw_name:
                canon_id = SkillGraphEngine.normalize_skill_id(str(raw_name))
                learner_skills_map[canon_id] = str(level).lower()

        # Extract roadmap nodes
        nodes = roadmap.get("nodes", [])
        edges = roadmap.get("edges", [])
        
        # Build downstream count map from edges
        downstream_map = {}
        for edge in edges:
            src = edge.get("source")
            if src:
                downstream_map[src] = downstream_map.get(src, 0) + 1

        # Completed nodes set (from roadmap status or learner known skills with >= intermediate)
        completed_or_adequate: Set[str] = set()
        for nid, lvl in learner_skills_map.items():
            if GapScoring.parse_proficiency(lvl) >= 0.50:  # Intermediate or above
                completed_or_adequate.add(nid)
        for n in nodes:
            if n.get("status") == "completed":
                completed_or_adequate.add(n["id"])

        gap_items: List[Dict[str, Any]] = []
        total_gap_hours = 0.0

        for node in nodes:
            nid = node.get("id")
            title = node.get("title", nid)
            canon_id = SkillGraphEngine.normalize_skill_id(nid)
            importance = node.get("importance", "mandatory")
            difficulty = node.get("difficulty", "Intermediate")
            node_type = node.get("type", "skill")

            # Determine required level
            if difficulty.lower() == "beginner":
                required_level = "beginner"
            elif difficulty.lower() == "advanced":
                required_level = "advanced"
            else:
                required_level = "intermediate"

            # Check learner proficiency
            current_level = learner_skills_map.get(canon_id, "none")
            if current_level == "none" and node.get("status") == "completed":
                current_level = required_level

            # Check prerequisites & blocking status
            prereqs = node.get("prerequisites", [])
            blocking_skills = []
            for p in prereqs:
                canon_p = SkillGraphEngine.normalize_skill_id(p)
                # If prerequisite is not known at adequate level and not completed
                if canon_p not in completed_or_adequate and p not in completed_or_adequate:
                    # Find display title
                    prereq_node = next((x for x in nodes if x["id"] == p or SkillGraphEngine.normalize_skill_id(x["id"]) == canon_p), None)
                    p_title = prereq_node.get("title", p) if prereq_node else p.replace("-", " ").title()
                    blocking_skills.append(p_title)

            is_blocked = len(blocking_skills) > 0 and node.get("status") != "completed"

            # Determine gap type
            gap_type = GapScoring.determine_gap_type(
                current_level_str=current_level,
                required_level_str=required_level,
                is_blocked=is_blocked,
                importance=importance
            )

            # Downstream count
            downstream_count = downstream_map.get(nid, 0) + downstream_map.get(canon_id, 0)

            # Priority score
            priority, decision_factors = GapScoring.calculate_gap_priority(
                importance=importance,
                downstream_count=downstream_count,
                current_level_str=current_level,
                required_level_str=required_level,
                is_in_roadmap=True,
                is_blocked=is_blocked
            )

            # Estimated hours
            est_hours = float(node.get("estimatedHours", 15.0))
            if gap_type == "PARTIAL_GAP":
                est_hours = round(est_hours * 0.5, 1)  # Only review needed
            elif gap_type == "NO_GAP":
                est_hours = 0.0

            if gap_type != "NO_GAP" and importance != "optional":
                total_gap_hours += est_hours

            # Reason
            reason = GapScoring.generate_gap_reason(
                skill_name=title,
                gap_type=gap_type,
                current_level_str=current_level,
                required_level_str=required_level,
                blocking_skills=blocking_skills,
                target_role=effective_role
            )

            gap_item = {
                "skill_id": nid,
                "skill_name": title,
                "required_level": required_level,
                "current_level": current_level,
                "gap_type": gap_type,
                "importance": importance,
                "priority": priority,
                "prerequisites": prereqs,
                "blocking_skills": blocking_skills,
                "is_blocked": is_blocked,
                "estimated_hours": est_hours,
                "reason": reason,
                "decision_factors": decision_factors,
                "category": node.get("category", "General"),
                "order": node.get("order", 999)
            }
            gap_items.append(gap_item)

        # Sort gaps descending by priority, ascending by order
        gap_items.sort(key=lambda g: (g["priority"], -g["order"]), reverse=True)

        actionable_gaps = [g for g in gap_items if not g["is_blocked"] and g["gap_type"] != "NO_GAP"]
        blocked_gaps = [g for g in gap_items if g["is_blocked"]]

        summary = {
            "target_role": effective_role,
            "total_required_skills": len(gap_items),
            "known_skills_count": len([g for g in gap_items if g["gap_type"] == "NO_GAP"]),
            "full_gaps_count": len([g for g in gap_items if g["gap_type"] == "FULL_GAP"]),
            "partial_gaps_count": len([g for g in gap_items if g["gap_type"] == "PARTIAL_GAP"]),
            "blocked_gaps_count": len(blocked_gaps),
            "optional_gaps_count": len([g for g in gap_items if g["gap_type"] == "OPTIONAL_GAP"]),
            "total_estimated_gap_hours": round(total_gap_hours, 1)
        }

        # Known skills list for presentation
        known_skills_display = [
            {"skill_id": k, "name": k.replace("-", " ").title(), "level": v}
            for k, v in learner_skills_map.items()
        ]

        return {
            "summary": summary,
            "gaps": gap_items,
            "known_skills": known_skills_display,
            "actionable_gaps": actionable_gaps,
            "blocked_gaps": blocked_gaps
        }

    @classmethod
    async def get_single_gap(cls, learner_id: str, skill_id: str) -> Optional[Dict[str, Any]]:
        analysis = await cls.analyze_gaps(learner_id)
        gaps = analysis.get("gaps", [])
        canon_target = SkillGraphEngine.normalize_skill_id(skill_id)
        for g in gaps:
            if g["skill_id"] == skill_id or SkillGraphEngine.normalize_skill_id(g["skill_id"]) == canon_target:
                return g
        raise ResourceNotFoundError(f"Skill gap for '{skill_id}' not found.")
