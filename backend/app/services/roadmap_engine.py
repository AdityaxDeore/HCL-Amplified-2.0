import logging
from typing import Dict, Any, List, Optional, Set, Tuple
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

VALID_EDGE_TYPES = {"prerequisite", "recommended_before", "related", "alternative", "part_of"}
VALID_IMPORTANCE_LEVELS = {"mandatory", "recommended", "optional"}
VALID_STATUSES = {"locked", "not_started", "in_progress", "completed", "skipped"}

class GraphValidationError(Exception):
    def __init__(self, message: str, code: str = "GRAPH_VALIDATION_ERROR"):
        super().__init__(message)
        self.code = code
        self.message = message

class DependencyCycleError(GraphValidationError):
    def __init__(self, message: str):
        super().__init__(message, code="DEPENDENCY_CYCLE_DETECTED")

class RoadmapEngine:
    """
    Core Roadmap Intelligence Engine.
    Handles graph validation, cycle detection, topological sorting,
    node availability calculation, and next actionable learning node selection.
    Deterministic with zero AI/LLM dependencies.
    """

    @classmethod
    def validate_graph(cls, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates roadmap graph integrity:
        - Unique node IDs
        - Non-empty node IDs
        - Valid edge endpoints
        - No self-loops
        - Valid edge types
        - No circular dependencies
        """
        if not nodes:
            raise GraphValidationError("Roadmap cannot be empty: no nodes provided.")

        node_ids = set()
        for idx, node in enumerate(nodes):
            nid = node.get("id")
            if not nid or not str(nid).strip():
                raise GraphValidationError(f"Node at index {idx} is missing an 'id'.")
            if nid in node_ids:
                raise GraphValidationError(f"Duplicate node ID detected: '{nid}'")
            node_ids.add(nid)

            # Validate importance and status if present
            importance = node.get("importance", "mandatory")
            if importance not in VALID_IMPORTANCE_LEVELS:
                raise GraphValidationError(f"Node '{nid}' has invalid importance: '{importance}'.")

            status = node.get("status", "not_started")
            if status not in VALID_STATUSES:
                raise GraphValidationError(f"Node '{nid}' has invalid status: '{status}'.")

        # Validate edges
        adj_list = defaultdict(list)
        for idx, edge in enumerate(edges):
            src = edge.get("source")
            tgt = edge.get("target")
            etype = edge.get("type", "prerequisite")

            if not src or src not in node_ids:
                raise GraphValidationError(f"Edge points from nonexistent source node: '{src}'")
            if not tgt or tgt not in node_ids:
                raise GraphValidationError(f"Edge points to nonexistent target node: '{tgt}'")
            if src == tgt:
                raise GraphValidationError(f"Self-referencing edge detected on node: '{src}'")
            if etype not in VALID_EDGE_TYPES:
                raise GraphValidationError(f"Invalid edge type '{etype}' between '{src}' and '{tgt}'")

            if etype in ("prerequisite", "recommended_before"):
                adj_list[src].append(tgt)

        # Detect cycles via DFS
        cycle = cls.find_cycle(node_ids, adj_list)
        if cycle:
            cycle_str = " -> ".join(cycle)
            raise DependencyCycleError(f"Invalid roadmap dependency cycle detected: {cycle_str}")

        return {
            "valid": True,
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }

    @classmethod
    def find_cycle(cls, node_ids: Set[str], adj_list: Dict[str, List[str]]) -> Optional[List[str]]:
        """
        DFS cycle detection returning the exact cycle path if found.
        """
        visited: Dict[str, int] = {nid: 0 for nid in node_ids}  # 0=unvisited, 1=visiting, 2=visited
        parent: Dict[str, Optional[str]] = {}

        def dfs(node: str, path: List[str]) -> Optional[List[str]]:
            visited[node] = 1  # visiting (grey)
            path.append(node)

            for neighbor in adj_list.get(node, []):
                if visited.get(neighbor, 0) == 1:
                    # Cycle found: extract cycle loop
                    cycle_start_idx = path.index(neighbor)
                    return path[cycle_start_idx:] + [neighbor]
                if visited.get(neighbor, 0) == 0:
                    parent[neighbor] = node
                    res = dfs(neighbor, path)
                    if res:
                        return res

            path.pop()
            visited[node] = 2  # visited (black)
            return None

        for nid in sorted(node_ids):
            if visited[nid] == 0:
                cycle_path = dfs(nid, [])
                if cycle_path:
                    return cycle_path
        return None

    @classmethod
    def topological_sort(cls, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[str]:
        """
        Calculates a deterministic topological learning sequence using Kahn's algorithm.
        Breaks ties using the node's natural roadmap 'order'.
        """
        node_map = {n["id"]: n for n in nodes}
        node_ids = set(node_map.keys())
        in_degree = {nid: 0 for nid in node_ids}
        adj_list = defaultdict(list)

        for edge in edges:
            src = edge.get("source")
            tgt = edge.get("target")
            etype = edge.get("type", "prerequisite")
            if etype in ("prerequisite", "recommended_before") and src in node_ids and tgt in node_ids:
                adj_list[src].append(tgt)
                in_degree[tgt] += 1

        # Queue nodes with in-degree 0, ordered by natural roadmap order
        queue = deque(sorted([nid for nid, deg in in_degree.items() if deg == 0],
                             key=lambda nid: node_map[nid].get("order", 999)))
        result = []

        while queue:
            curr = queue.popleft()
            result.append(curr)

            # Sort neighbors by order for deterministic sequence
            neighbors = sorted(adj_list.get(curr, []), key=lambda nid: node_map[nid].get("order", 999))
            for nxt in neighbors:
                in_degree[nxt] -= 1
                if in_degree[nxt] == 0:
                    queue.append(nxt)

        if len(result) != len(node_ids):
            cycle = cls.find_cycle(node_ids, adj_list)
            cycle_str = " -> ".join(cycle) if cycle else "unknown loop"
            raise DependencyCycleError(f"Dependency cycle detected in roadmap graph: {cycle_str}")

        return result

    @classmethod
    def calculate_node_availability(cls, nodes: List[Dict[str, Any]], completed_ids: Set[str]) -> List[Dict[str, Any]]:
        """
        Decorates nodes with is_available and is_blocked flags based on completed prerequisites.
        """
        decorated = []
        for node in nodes:
            node_copy = dict(node)
            prereqs = node.get("prerequisites", [])
            status = node.get("status", "not_started")

            if status == "completed":
                node_copy["is_available"] = True
                node_copy["is_blocked"] = False
            else:
                unmet_prereqs = [p for p in prereqs if p not in completed_ids]
                node_copy["is_available"] = len(unmet_prereqs) == 0
                node_copy["is_blocked"] = len(unmet_prereqs) > 0
                if node_copy["is_blocked"] and status != "locked":
                    node_copy["status"] = "locked"
                elif node_copy["is_available"] and status == "locked":
                    node_copy["status"] = "not_started"

            decorated.append(node_copy)
        return decorated

    @classmethod
    def get_next_learning_nodes(
        cls,
        nodes: List[Dict[str, Any]],
        completed_ids: Optional[Set[str]] = None,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Determines the next best learning nodes deterministically:
        1. Identifies non-completed nodes.
        2. Filters for nodes whose prerequisites are 100% completed.
        3. Ranks by:
           - In progress (highest priority to resume)
           - Importance (mandatory > recommended > optional)
           - Roadmap sequence order
        """
        if completed_ids is None:
            completed_ids = {n["id"] for n in nodes if n.get("status") == "completed"}

        available_candidates = []
        for node in nodes:
            nid = node.get("id")
            status = node.get("status", "not_started")
            if status == "completed" or nid in completed_ids:
                continue

            prereqs = node.get("prerequisites", [])
            unmet = [p for p in prereqs if p not in completed_ids]

            if not unmet:
                # Rank scoring:
                # in_progress: 3, not_started: 2, locked: 1
                status_score = 3 if status == "in_progress" else 2
                # mandatory: 3, recommended: 2, optional: 1
                imp = node.get("importance", "mandatory")
                imp_score = 3 if imp == "mandatory" else 2 if imp == "recommended" else 1
                order = node.get("order", 999)

                available_candidates.append((status_score, imp_score, -order, node))

        # Sort descending by status score, importance, and ascending by order
        available_candidates.sort(key=lambda x: (x[0], x[1], x[2]), reverse=True)
        return [item[3] for item in available_candidates[:limit]]

    @classmethod
    def evaluate_milestones(cls, milestones: List[Dict[str, Any]], nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluates milestone completion rules based on current node statuses.
        """
        node_status_map = {n["id"]: n.get("status", "not_started") for n in nodes}
        node_imp_map = {n["id"]: n.get("importance", "mandatory") for n in nodes}
        updated_milestones = []

        for ms in milestones:
            ms_copy = dict(ms)
            node_ids = ms.get("nodeIds", [])
            if not node_ids:
                ms_copy["progress"] = 0
                ms_copy["status"] = "not_started"
                updated_milestones.append(ms_copy)
                continue

            total = len(node_ids)
            completed = sum(1 for nid in node_ids if node_status_map.get(nid) == "completed")
            in_prog = sum(1 for nid in node_ids if node_status_map.get(nid) == "in_progress")
            progress = int(round((completed / total) * 100))

            rule = ms.get("completion_rule", "all_mandatory_completed")
            if rule == "all_mandatory_completed":
                mandatory_ids = [nid for nid in node_ids if node_imp_map.get(nid) == "mandatory"]
                target_ids = mandatory_ids if mandatory_ids else node_ids
                all_done = all(node_status_map.get(nid) == "completed" for nid in target_ids)
            else:
                all_done = completed == total

            if all_done:
                status = "completed"
            elif in_prog > 0 or completed > 0:
                status = "in_progress"
            else:
                status = "not_started"

            ms_copy["progress"] = progress
            ms_copy["status"] = status
            updated_milestones.append(ms_copy)

        return updated_milestones
