import logging
import re
from typing import Dict, Any, List, Optional, Set, Tuple
from collections import defaultdict, deque
from app.repositories.skill_repository import SkillRepository
from app.utils.errors import ResourceNotFoundError

logger = logging.getLogger(__name__)

# Canonical Aliases
SKILL_ALIASES: Dict[str, str] = {
    "ml": "machine-learning",
    "machine learning fundamentals": "machine-learning",
    "machine-learning-basics": "machine-learning",
    "dl": "deep-learning",
    "deep learning specialization": "deep-learning",
    "genai": "generative-ai",
    "generative ai": "generative-ai",
    "llm": "generative-ai",
    "large language models": "generative-ai",
    "py": "python",
    "python3": "python",
    "python programming": "python",
    "numpy library": "numpy",
    "stats": "statistics",
    "probability and statistics": "statistics",
    "computer vision": "computer-vision",
    "cv": "computer-vision",
    "natural language processing": "nlp",
    "ml ops": "mlops",
    "machine learning operations": "mlops",
    "relational databases": "sql",
    "sql queries": "sql",
}

# Baseline Skill Graph Ontology
BASELINE_SKILL_NODES = [
    {
        "id": "python",
        "name": "Python",
        "category": "Foundations",
        "difficulty": "Beginner",
        "level": "Beginner",
        "description": "Core programming language for AI, data science, and web development.",
        "prerequisites": [],
        "relatedSkills": ["numpy", "sql", "git"],
        "roadmap_nodes": ["python", "python-basics"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Data Scientist", "Software Engineer"],
        "aliases": ["py", "python3", "python programming"],
        "inRoadmap": True
    },
    {
        "id": "numpy",
        "name": "NumPy",
        "category": "Foundations",
        "difficulty": "Beginner",
        "level": "Beginner",
        "description": "Fundamental package for scientific computing with multi-dimensional array operations.",
        "prerequisites": ["python"],
        "relatedSkills": ["python", "statistics", "machine-learning"],
        "roadmap_nodes": ["numpy"],
        "careerPaths": ["AI Engineer", "Data Scientist", "ML Engineer"],
        "aliases": ["numpy library"],
        "inRoadmap": True
    },
    {
        "id": "statistics",
        "name": "Statistics",
        "category": "Foundations",
        "difficulty": "Intermediate",
        "level": "Intermediate",
        "description": "Probability distributions, hypothesis testing, Bayesian inference, and statistical learning.",
        "prerequisites": ["python", "numpy"],
        "relatedSkills": ["python", "machine-learning"],
        "roadmap_nodes": ["statistics"],
        "careerPaths": ["Data Scientist", "AI Engineer", "Quantitative Analyst"],
        "aliases": ["stats", "probability and statistics"],
        "inRoadmap": True
    },
    {
        "id": "machine-learning",
        "name": "Machine Learning",
        "category": "Core AI",
        "difficulty": "Intermediate",
        "level": "Intermediate",
        "description": "Supervised, unsupervised, reinforcement learning, feature engineering, and model evaluation.",
        "prerequisites": ["python", "numpy", "statistics"],
        "relatedSkills": ["deep-learning", "mlops", "nlp", "computer-vision"],
        "roadmap_nodes": ["machine-learning"],
        "careerPaths": ["AI Engineer", "ML Engineer", "Data Scientist"],
        "aliases": ["ml", "machine learning fundamentals", "machine-learning-basics"],
        "inRoadmap": True
    },
    {
        "id": "deep-learning",
        "name": "Deep Learning",
        "category": "Core AI",
        "difficulty": "Advanced",
        "level": "Advanced",
        "description": "Deep neural networks, backpropagation, CNNs, RNNs, and transformer architectures.",
        "prerequisites": ["machine-learning"],
        "relatedSkills": ["generative-ai", "computer-vision", "nlp"],
        "roadmap_nodes": ["deep-learning"],
        "careerPaths": ["AI Engineer", "Research Scientist", "Deep Learning Engineer"],
        "aliases": ["dl", "deep learning specialization"],
        "inRoadmap": True
    },
    {
        "id": "generative-ai",
        "name": "Generative AI",
        "category": "Advanced AI",
        "difficulty": "Advanced",
        "level": "Advanced",
        "description": "Large language models (LLMs), prompt engineering, retrieval-augmented generation (RAG), and fine-tuning.",
        "prerequisites": ["deep-learning"],
        "relatedSkills": ["nlp", "mlops"],
        "roadmap_nodes": ["generative-ai", "llms"],
        "careerPaths": ["AI Engineer", "LLM Engineer", "AI Product Builder"],
        "aliases": ["genai", "generative ai", "llm", "large language models"],
        "inRoadmap": True
    },
    {
        "id": "mlops",
        "name": "MLOps",
        "category": "Production",
        "difficulty": "Intermediate",
        "level": "Intermediate",
        "description": "CI/CD for machine learning, model registry, automated pipelines, monitoring, and scalable serving.",
        "prerequisites": ["machine-learning"],
        "relatedSkills": ["docker", "fastapi", "generative-ai"],
        "roadmap_nodes": ["mlops"],
        "careerPaths": ["MLOps Engineer", "AI Engineer", "DevOps Engineer"],
        "aliases": ["ml ops", "machine learning operations"],
        "inRoadmap": True
    },
    {
        "id": "nlp",
        "name": "Natural Language Processing",
        "category": "Advanced AI",
        "difficulty": "Advanced",
        "level": "Advanced",
        "description": "Text tokenization, embeddings, sentiment analysis, attention mechanisms, and language modeling.",
        "prerequisites": ["machine-learning", "deep-learning"],
        "relatedSkills": ["generative-ai", "deep-learning"],
        "roadmap_nodes": ["nlp"],
        "careerPaths": ["NLP Engineer", "AI Engineer", "Computational Linguist"],
        "aliases": ["natural language processing"],
        "inRoadmap": False
    },
    {
        "id": "computer-vision",
        "name": "Computer Vision",
        "category": "Advanced AI",
        "difficulty": "Advanced",
        "level": "Advanced",
        "description": "Image classification, object detection, segmentation, and vision-language models.",
        "prerequisites": ["deep-learning"],
        "relatedSkills": ["deep-learning"],
        "roadmap_nodes": ["computer-vision"],
        "careerPaths": ["Computer Vision Engineer", "Robotics Engineer", "AI Engineer"],
        "aliases": ["cv", "computer vision"],
        "inRoadmap": False
    },
    {
        "id": "sql",
        "name": "SQL",
        "category": "Foundations",
        "difficulty": "Beginner",
        "level": "Beginner",
        "description": "Relational data querying, schema design, window functions, and analytics.",
        "prerequisites": [],
        "relatedSkills": ["python", "statistics"],
        "roadmap_nodes": ["sql"],
        "careerPaths": ["Data Analyst", "Data Engineer", "AI Engineer"],
        "aliases": ["relational databases", "sql queries"],
        "inRoadmap": False
    }
]

class SkillGraphEngine:
    """
    Skill Graph Engine providing ontology management,
    transitive upstream/downstream traversals, and shortest learning path queries.
    Deterministic with zero AI/LLM dependencies.
    """
    _skill_map: Dict[str, Dict[str, Any]] = {s["id"]: s for s in BASELINE_SKILL_NODES}

    @classmethod
    def normalize_skill_id(cls, raw_id: str) -> str:
        """
        Maps skill synonyms, raw names, and aliases to canonical skill IDs.
        """
        if not raw_id:
            return ""
        cleaned = re.sub(r'[^a-zA-Z0-9_\s-]', '', str(raw_id)).lower().strip()
        cleaned_slug = re.sub(r'[\s_]+', '-', cleaned)
        
        # Exact alias match
        if cleaned in SKILL_ALIASES:
            return SKILL_ALIASES[cleaned]
        if cleaned_slug in SKILL_ALIASES:
            return SKILL_ALIASES[cleaned_slug]
        if cleaned_slug in cls._skill_map:
            return cleaned_slug

        # Partial matching against known aliases
        for alias, canonical in SKILL_ALIASES.items():
            if alias in cleaned:
                return canonical

        return cleaned_slug

    @classmethod
    async def get_all_skills(cls, category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        # Prefer repository if populated, fallback to baseline ontology
        try:
            skills = await SkillRepository.get_all(category=category, difficulty=difficulty)
            if skills:
                return skills
        except Exception:
            pass

        results = list(cls._skill_map.values())
        if category and category.lower() != "all":
            results = [s for s in results if s.get("category", "").lower() == category.lower()]
        if difficulty and difficulty.lower() != "all":
            results = [s for s in results if s.get("difficulty", "").lower() == difficulty.lower()]
        return results

    @classmethod
    async def get_skill(cls, skill_id: str) -> Dict[str, Any]:
        canonical_id = cls.normalize_skill_id(skill_id)
        skill = await SkillRepository.get_by_id(canonical_id)
        if not skill:
            skill = cls._skill_map.get(canonical_id)
        if not skill:
            raise ResourceNotFoundError(f"Skill '{skill_id}' not found in skill graph.")
        return skill

    @classmethod
    def get_skill_edges(cls) -> List[Dict[str, Any]]:
        edges = []
        edge_set = set()

        for s in cls._skill_map.values():
            sid = s["id"]
            # Prerequisite edges
            for prereq in s.get("prerequisites", []):
                canon_prereq = cls.normalize_skill_id(prereq)
                if canon_prereq in cls._skill_map:
                    edge_key = (canon_prereq, sid, "prerequisite")
                    if edge_key not in edge_set:
                        edge_set.add(edge_key)
                        edges.append({
                            "source": canon_prereq,
                            "target": sid,
                            "type": "prerequisite"
                        })

            # Related edges
            for related in s.get("relatedSkills", []):
                canon_rel = cls.normalize_skill_id(related)
                if canon_rel in cls._skill_map and canon_rel != sid:
                    edge_key = (min(sid, canon_rel), max(sid, canon_rel), "related")
                    if edge_key not in edge_set:
                        edge_set.add(edge_key)
                        edges.append({
                            "source": sid,
                            "target": canon_rel,
                            "type": "related"
                        })
        return edges

    @classmethod
    async def get_skill_prerequisites(cls, skill_id: str) -> List[Dict[str, Any]]:
        """
        Direct prerequisites required by this skill.
        """
        skill = await cls.get_skill(skill_id)
        prereq_ids = [cls.normalize_skill_id(p) for p in skill.get("prerequisites", [])]
        results = []
        for pid in prereq_ids:
            try:
                p_skill = await cls.get_skill(pid)
                results.append(p_skill)
            except ResourceNotFoundError:
                pass
        return results

    @classmethod
    async def get_skill_dependents(cls, skill_id: str) -> List[Dict[str, Any]]:
        """
        Direct dependent skills that require this skill as a prerequisite.
        """
        canonical_id = cls.normalize_skill_id(skill_id)
        all_skills = await cls.get_all_skills()
        dependents = []
        for s in all_skills:
            prereqs = [cls.normalize_skill_id(p) for p in s.get("prerequisites", [])]
            if canonical_id in prereqs:
                dependents.append(s)
        return dependents

    @classmethod
    async def get_related_skills(cls, skill_id: str) -> List[Dict[str, Any]]:
        """
        Related and complementary skills.
        """
        skill = await cls.get_skill(skill_id)
        rel_ids = [cls.normalize_skill_id(r) for r in skill.get("relatedSkills", [])]
        results = []
        for rid in rel_ids:
            try:
                r_skill = await cls.get_skill(rid)
                results.append(r_skill)
            except ResourceNotFoundError:
                pass
        return results

    @classmethod
    async def get_upstream_skills(cls, skill_id: str) -> List[Dict[str, Any]]:
        """
        Transitive upstream prerequisites ("What leads to this skill?").
        Traverses prerequisite graph backwards using BFS.
        Returns skills in foundational order (deepest prerequisite first).
        """
        canonical_id = cls.normalize_skill_id(skill_id)
        all_skills = {s["id"]: s for s in await cls.get_all_skills()}

        if canonical_id not in all_skills:
            raise ResourceNotFoundError(f"Skill '{skill_id}' not found.")

        visited: Set[str] = set()
        queue = deque([canonical_id])
        upstream_list = []

        while queue:
            curr = queue.popleft()
            curr_skill = all_skills.get(curr)
            if not curr_skill:
                continue

            for p in curr_skill.get("prerequisites", []):
                canon_p = cls.normalize_skill_id(p)
                if canon_p in all_skills and canon_p not in visited and canon_p != canonical_id:
                    visited.add(canon_p)
                    upstream_list.append(all_skills[canon_p])
                    queue.append(canon_p)

        # Reverse so deepest prerequisites come first
        upstream_list.reverse()
        return upstream_list

    @classmethod
    async def get_downstream_skills(cls, skill_id: str) -> List[Dict[str, Any]]:
        """
        Transitive downstream unlockable skills ("What skills can I reach next?").
        Traverses forward dependent edges using BFS.
        """
        canonical_id = cls.normalize_skill_id(skill_id)
        all_skills = {s["id"]: s for s in await cls.get_all_skills()}

        if canonical_id not in all_skills:
            raise ResourceNotFoundError(f"Skill '{skill_id}' not found.")

        # Build forward adjacency
        forward_adj = defaultdict(list)
        for s in all_skills.values():
            for p in s.get("prerequisites", []):
                canon_p = cls.normalize_skill_id(p)
                forward_adj[canon_p].append(s["id"])

        visited: Set[str] = set()
        queue = deque([canonical_id])
        downstream_list = []

        while queue:
            curr = queue.popleft()
            for child in forward_adj.get(curr, []):
                if child in all_skills and child not in visited and child != canonical_id:
                    visited.add(child)
                    downstream_list.append(all_skills[child])
                    queue.append(child)

        return downstream_list

    @classmethod
    async def find_skill_path(cls, source_id: str, target_id: str) -> Dict[str, Any]:
        """
        Calculates the shortest prerequisite learning path from source to target skill via BFS.
        Returns path sequence, step count, and reachable boolean.
        """
        source_canon = cls.normalize_skill_id(source_id)
        target_canon = cls.normalize_skill_id(target_id)
        all_skills = {s["id"]: s for s in await cls.get_all_skills()}

        if source_canon not in all_skills:
            raise ResourceNotFoundError(f"Source skill '{source_id}' not found.")
        if target_canon not in all_skills:
            raise ResourceNotFoundError(f"Target skill '{target_id}' not found.")

        if source_canon == target_canon:
            return {
                "source": source_canon,
                "target": target_canon,
                "reachable": True,
                "path": [source_canon],
                "steps": 0,
                "nodes": [all_skills[source_canon]]
            }

        # Build forward adjacency (prerequisite -> target)
        forward_adj = defaultdict(list)
        for s in all_skills.values():
            for p in s.get("prerequisites", []):
                canon_p = cls.normalize_skill_id(p)
                forward_adj[canon_p].append(s["id"])

        # BFS shortest path search
        queue = deque([[source_canon]])
        visited = {source_canon}
        shortest_path = None

        while queue:
            path = queue.popleft()
            curr = path[-1]

            if curr == target_canon:
                shortest_path = path
                break

            for neighbor in forward_adj.get(curr, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(path + [neighbor])

        if shortest_path:
            return {
                "source": source_canon,
                "target": target_canon,
                "reachable": True,
                "path": shortest_path,
                "steps": len(shortest_path) - 1,
                "nodes": [all_skills[sid] for sid in shortest_path if sid in all_skills]
            }

        return {
            "source": source_canon,
            "target": target_canon,
            "reachable": False,
            "path": [],
            "steps": 0,
            "nodes": []
        }

    @classmethod
    async def get_skill_graph(cls) -> Dict[str, Any]:
        """
        Full graph nodes and edges for visualization.
        """
        nodes = await cls.get_all_skills()
        edges = cls.get_skill_edges()
        categories = list(dict.fromkeys(s.get("category", "General") for s in nodes))
        return {
            "nodes": nodes,
            "edges": edges,
            "categories": categories
        }
