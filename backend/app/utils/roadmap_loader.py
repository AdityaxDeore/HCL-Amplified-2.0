import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

# Find roadmaps directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ROADMAPS_DIR = BASE_DIR / "roadmaps"

class RoadmapLoader:
    """
    Finds, parses, and normalizes roadmap.sh JSON files into clean canonical roadmap structures.
    Preserves raw JSON files without mutating them.
    Includes in-memory caching for performance.
    """
    _cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def get_roadmaps_directory() -> Path:
        if ROADMAPS_DIR.exists():
            return ROADMAPS_DIR
        alt_path = Path.cwd() / "roadmaps"
        if alt_path.exists():
            return alt_path
        alt_parent = Path.cwd().parent / "roadmaps"
        if alt_parent.exists():
            return alt_parent
        return ROADMAPS_DIR

    @classmethod
    def list_available_roadmaps(cls) -> List[Dict[str, Any]]:
        directory = cls.get_roadmaps_directory()
        if not directory.exists():
            return []
        
        results = []
        for file_path in directory.glob("*.json"):
            slug = file_path.stem
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    title = data.get("title", {})
                    if isinstance(title, dict):
                        title_str = title.get("page") or title.get("card") or slug.replace("-", " ").title()
                    else:
                        title_str = str(title) if title else slug.replace("-", " ").title()
                    
                    description = data.get("description") or f"Comprehensive learning roadmap for {title_str}"
                    nodes_count = len(data.get("nodes", []))
                    
                    results.append({
                        "id": slug,
                        "title": title_str,
                        "description": description,
                        "node_count": nodes_count,
                        "source": "roadmap.sh"
                    })
            except Exception as e:
                logger.warning(f"Skipping roadmap file {file_path.name}: {e}")
                results.append({
                    "id": slug,
                    "title": slug.replace("-", " ").title(),
                    "description": f"Roadmap for {slug}",
                    "node_count": 0,
                    "source": "roadmap.sh"
                })
        
        return sorted(results, key=lambda x: x["title"])

    @classmethod
    def load_raw_roadmap(cls, slug: str) -> Optional[Dict[str, Any]]:
        directory = cls.get_roadmaps_directory()
        file_path = directory / f"{slug}.json"
        if not file_path.exists():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read roadmap file {file_path}: {e}")
            return None

    @classmethod
    def normalize_roadmap(cls, slug: str, raw_data: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """
        Transforms raw roadmap.sh JSON data into canonical normalized roadmap representation.
        """
        if slug in cls._cache:
            return cls._cache[slug]

        raw = raw_data or cls.load_raw_roadmap(slug)
        if not raw:
            return None

        # Title
        raw_title = raw.get("title", {})
        if isinstance(raw_title, dict):
            title = raw_title.get("page") or raw_title.get("card") or slug.replace("-", " ").title()
        else:
            title = str(raw_title) if raw_title else slug.replace("-", " ").title()

        description = raw.get("description") or f"Step by step guide to becoming an {title} in 2026"
        version = str(raw.get("version", "1.0"))
        source = "roadmap.sh"

        raw_nodes = raw.get("nodes", [])
        raw_edges = raw.get("edges", [])

        # Filter out UI-only / decorative / promo nodes
        filtered_raw_nodes = []
        node_id_map = {}  # maps raw ID to clean slug ID

        for raw_node in raw_nodes:
            n_type = raw_node.get("type", "")
            if n_type in ("title", "horizontal", "vertical", "linksgroup", "button", "label"):
                continue
            
            data = raw_node.get("data", {})
            label = str(data.get("label", "")).strip()
            
            # Skip promotional or empty
            if not label or len(label) < 2:
                continue
            if any(promo in label.lower() for promo in ("off on their", "roadmap.sh", "check them out", "pre-requisites (one of these)")):
                continue

            clean_id = re.sub(r'[^a-zA-Z0-9_-]', '-', label.lower()).strip('-')
            clean_id = re.sub(r'-+', '-', clean_id)
            if not clean_id:
                clean_id = raw_node.get("id", "node")

            node_id_map[raw_node.get("id")] = clean_id
            filtered_raw_nodes.append((raw_node, clean_id, label, n_type))

        # Build normalized nodes
        normalized_nodes = []
        seen_ids = set()
        order = 1

        for raw_node, clean_id, label, n_type in filtered_raw_nodes:
            if clean_id in seen_ids:
                clean_id = f"{clean_id}-{order}"
            seen_ids.add(clean_id)

            # Node Classification
            lower_label = label.lower()
            if any(tech in lower_label for tech in ("fastapi", "docker", "kubernetes", "git", "linux", "sql", "mongodb", "postgresql", "redis")):
                node_type = "technology"
            elif any(tool in lower_label for tech in ("vscode", "studio", "ollama", "postman") for tool in (tech,)):
                node_type = "tool"
            elif any(proj in lower_label for proj in ("project", "capstone", "build", "pipeline")):
                node_type = "project"
            elif any(conc in lower_label for conc in ("what is", "introduction", "basics", "fundamentals", "how it works", "overview", "lifecycle")):
                node_type = "concept"
            else:
                node_type = "skill"

            # Deterministic Category
            if any(w in lower_label for w in ("python", "variable", "syntax", "oop", "control flow", "basics", "foundation", "math", "statistics", "calculus")):
                category = "Foundations"
            elif any(w in lower_label for w in ("machine learning", "supervised", "unsupervised", "regression", "classification", "clustering", "scikit")):
                category = "Machine Learning"
            elif any(w in lower_label for w in ("deep learning", "neural", "cnn", "rnn", "transformer", "backprop", "pytorch", "tensorflow")):
                category = "Deep Learning"
            elif any(w in lower_label for w in ("llm", "generative", "rag", "prompt", "fine-tuning", "vector db", "embeddings", "agents")):
                category = "Generative AI"
            elif any(w in lower_label for w in ("mlops", "deploy", "monitoring", "serving", "ci/cd", "production")):
                category = "Production"
            else:
                category = "Core AI" if "ai" in slug else "Specialized"

            # Importance (Deterministic Baseline)
            if order <= 4 or category == "Foundations" or node_type == "concept":
                importance = "mandatory"
            elif order <= 8 or category in ("Machine Learning", "Deep Learning", "Generative AI"):
                importance = "recommended"
            else:
                importance = "optional"

            # Status (Default baseline)
            if order == 1:
                status = "completed"
            elif order == 2:
                status = "in_progress"
            elif order <= 4:
                status = "not_started"
            else:
                status = "locked"

            month = min(4, max(1, (order + 1) // 3))

            normalized_nodes.append({
                "id": clean_id,
                "skillId": clean_id,
                "title": label,
                "description": f"Core concepts, practical application, and best practices for {label}.",
                "category": category,
                "type": node_type,
                "importance": importance,
                "status": status,
                "estimatedHours": 10.0 + (order % 3) * 5.0,
                "estimatedWeeks": 1 if order % 2 == 0 else 2,
                "difficulty": "Beginner" if order <= 3 else "Intermediate" if order <= 7 else "Advanced",
                "prerequisites": [],
                "children": [],
                "related_skills": [],
                "order": order,
                "month": month,
                "whyItMatters": f"{label} is a core competency required for the {title} roadmap.",
                "is_available": status in ("completed", "in_progress", "not_started"),
                "is_blocked": status == "locked",
                "source": source
            })
            order += 1

        # Normalized Edges & Prerequisite mapping
        valid_node_ids = {n["id"] for n in normalized_nodes}
        normalized_edges = []
        edge_id_set = set()

        for raw_edge in raw_edges:
            src_raw = raw_edge.get("source")
            tgt_raw = raw_edge.get("target")
            
            src_clean = node_id_map.get(src_raw)
            tgt_clean = node_id_map.get(tgt_raw)

            if src_clean and tgt_clean and src_clean in valid_node_ids and tgt_clean in valid_node_ids and src_clean != tgt_clean:
                edge_id = f"{src_clean}->{tgt_clean}"
                if edge_id not in edge_id_set:
                    edge_id_set.add(edge_id)
                    normalized_edges.append({
                        "id": edge_id,
                        "source": src_clean,
                        "target": tgt_clean,
                        "type": "prerequisite"
                    })
                    # Add prerequisite
                    for n in normalized_nodes:
                        if n["id"] == tgt_clean and src_clean not in n["prerequisites"]:
                            n["prerequisites"].append(src_clean)

        # Fallback sequential prerequisites if no raw edges were mapped
        if not normalized_edges and len(normalized_nodes) > 1:
            for i in range(1, len(normalized_nodes)):
                src = normalized_nodes[i - 1]["id"]
                tgt = normalized_nodes[i]["id"]
                normalized_nodes[i]["prerequisites"].append(src)
                normalized_edges.append({
                    "id": f"{src}->{tgt}",
                    "source": src,
                    "target": tgt,
                    "type": "prerequisite"
                })

        # Distinct Categories
        categories = list(dict.fromkeys(n["category"] for n in normalized_nodes))

        # Dynamic Milestones
        milestones = [
            {
                "id": "m1",
                "title": "Foundations",
                "description": "Essential foundational concepts and tooling",
                "month": 1,
                "nodeIds": [n["id"] for n in normalized_nodes if n["month"] == 1],
                "status": "in_progress",
                "progress": 50,
                "completion_rule": "all_mandatory_completed"
            },
            {
                "id": "m2",
                "title": "Core Specialization",
                "description": "Core algorithms, architectures, and modeling",
                "month": 2,
                "nodeIds": [n["id"] for n in normalized_nodes if n["month"] == 2],
                "status": "not_started",
                "progress": 0,
                "completion_rule": "all_mandatory_completed"
            },
            {
                "id": "m3",
                "title": "Advanced Applications",
                "description": "Advanced workflows, LLMs, and systems",
                "month": 3,
                "nodeIds": [n["id"] for n in normalized_nodes if n["month"] == 3],
                "status": "not_started",
                "progress": 0,
                "completion_rule": "all_mandatory_completed"
            },
            {
                "id": "m4",
                "title": "Production & Capstone",
                "description": "Deployment, MLOps, and production projects",
                "month": 4,
                "nodeIds": [n["id"] for n in normalized_nodes if n["month"] == 4],
                "status": "not_started",
                "progress": 0,
                "completion_rule": "all_mandatory_completed"
            }
        ]

        normalized_roadmap = {
            "id": slug,
            "roadmap_id": slug,
            "learnerId": "demo-learner",
            "title": title,
            "goal": f"Master {title}",
            "targetRole": title,
            "description": description,
            "version": version,
            "source": source,
            "status": "active",
            "timeline": "4 months",
            "hoursPerWeek": 10,
            "overallProgress": 32 if slug == "ai-engineer" else 0,
            "currentPhase": categories[1] if len(categories) > 1 else categories[0] if categories else "Foundations",
            "categories": categories,
            "nodes": normalized_nodes,
            "edges": normalized_edges,
            "milestones": milestones,
            "metadata": {
                "total_nodes": len(normalized_nodes),
                "total_edges": len(normalized_edges),
                "source_file": f"{slug}.json"
            }
        }

        # Cache normalized roadmap
        cls._cache[slug] = normalized_roadmap
        return normalized_roadmap

    @classmethod
    def parse_to_internal_nodes(cls, slug: str) -> List[Dict[str, Any]]:
        roadmap = cls.normalize_roadmap(slug)
        return roadmap["nodes"] if roadmap else []
