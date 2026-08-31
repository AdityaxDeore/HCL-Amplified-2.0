import json
from typing import Dict, Any, List, Optional

class PromptBuilder:
    """
    Structured Prompt Architecture for LearnPath AI Assistant.
    Enforces persona, context grounding, citation references, anti-hallucination,
    and non-mutation constraints.
    """

    @classmethod
    def build_system_prompt(cls) -> str:
        return """You are the LearnPath AI Learning Assistant, an expert AI mentor and curriculum advisor for personalized engineering career roadmaps.

Your mission is to help the learner understand and navigate their personalized learning roadmap, master complex technical concepts, understand their skill gaps, evaluate timeline feasibility, and discover high-quality learning resources.

### CORE OPERATING RULES:
1. GROUNDED IN REALITY: Use ONLY the provided learner context, roadmap status, skill gap analysis, reality feasibility audit, and retrieved learning resources. Never contradict the stored roadmap or calculate arbitrary numbers.
2. CITATION & SOURCES: When recommending learning resources (videos, docs, courses), reference the provided SOURCE_ID (e.g. "youtube:qBigTkBLU6g" or "docs:scikit-learn") in the "source_ids" array. NEVER invent YouTube URLs, course links, or fake ratings.
3. NON-MUTATION / ROADMAP EDITS: You are strictly an informational assistant. If a user asks you to "Delete Machine Learning", "Remove Python", "Add Rust", or "Complete my roadmap", clarify that manual roadmap editing is required in the Roadmap UI and provide clear guidance. DO NOT claim that you modified their roadmap or database.
4. HONEST TIMELINE AUDIT: If the learner asks about their deadline or study pace, reference the provided Reality Check audit status (COMFORTABLE, REALISTIC, TIGHT, AT_RISK, UNREALISTIC) and explain concrete adjustments (study hours, duration, optional topic pruning).
5. CLARITY & STRUCTURE: Use clear, encouraging Markdown formatting (bullet points, bold highlights, concise paragraphs).

### OUTPUT FORMAT:
You MUST respond with a valid, clean JSON object matching this exact schema:
{
  "answer": "Your detailed Markdown formatted response here...",
  "source_ids": ["source_id_1", "source_id_2"],
  "related_skills": ["skill_id_1", "skill_id_2"],
  "suggested_actions": [
    {
      "type": "open_roadmap_node" | "open_roadmap" | "open_skill" | "open_resource" | "open_progress" | "open_learning" | "open_profile",
      "targetId": "optional_id",
      "label": "Button Label"
    }
  ],
  "follow_up_questions": [
    "Suggested follow up question 1",
    "Suggested follow up question 2"
  ]
}"""

    @classmethod
    def build_context_bundle(cls, context_data: Dict[str, Any]) -> str:
        learner = context_data.get("learner", {})
        roadmap = context_data.get("roadmap", {})
        progress = context_data.get("progress", {})
        gaps = context_data.get("gaps", {})
        reality = context_data.get("reality", {})
        recommendations = context_data.get("recommendations", [])
        resources = context_data.get("resources", [])

        sections = []

        # 1. Learner Profile Context
        sections.append(f"""=== 1. LEARNER PROFILE ===
- Name: {learner.get('name', 'Alex Morgan')}
- Target Role: {learner.get('targetRole', 'AI Engineer')}
- Goal: {learner.get('goal', 'Master AI Engineering')}
- Experience Level: {learner.get('experienceLevel', 'Intermediate')}
- Study Bandwidth: {learner.get('hoursPerWeek', 10.0)} hours/week
- Target Timeline: {learner.get('targetMonths', 4)} months
- Learning Preference: {learner.get('learningPreference', 'video')}
- Known Skills: {', '.join([f"{s.get('name')} ({s.get('level')})" for s in learner.get('skills', [])])}""")

        # 2. Roadmap & Progress
        completed = [str(n.get('name') or n.get('title') or n.get('id')) for n in roadmap.get('nodes', []) if n.get('status') == 'completed' and (n.get('name') or n.get('title') or n.get('id'))]
        in_progress = [str(n.get('name') or n.get('title') or n.get('id')) for n in roadmap.get('nodes', []) if n.get('status') == 'in_progress' and (n.get('name') or n.get('title') or n.get('id'))]
        blocked = [str(n.get('name') or n.get('title') or n.get('id')) for n in roadmap.get('nodes', []) if n.get('is_blocked') and (n.get('name') or n.get('title') or n.get('id'))]
        
        sections.append(f"""=== 2. ROADMAP & PROGRESS ===
- Overall Progress: {progress.get('overallProgress', 32)}% ({progress.get('learningHours', 24)} hours logged)
- Completed Topics: {', '.join(completed[:4]) if completed else 'None yet'}
- Currently In-Progress: {', '.join(in_progress[:4]) if in_progress else 'Foundations'}
- Blocked Nodes (Waiting on Prereqs): {', '.join(blocked[:4]) if blocked else 'None'}
- Current Learning Focus: {progress.get('currentFocus', 'Statistics Fundamentals')}""")

        # 3. Skill Gap Analysis
        gap_summary = gaps.get("summary", {})
        top_actionable = [f"{g.get('skill_name')} ({g.get('gap_type')})" for g in gaps.get("actionable_gaps", [])[:4]]
        blocked_gaps = [f"{g.get('skill_name')} (Blocked by {', '.join(g.get('blocking_skills', []))})" for g in gaps.get("blocked_gaps", [])[:3]]
        
        sections.append(f"""=== 3. SKILL GAP ANALYSIS ===
- Known Skills Count: {gap_summary.get('known_skills_count', 4)}
- Actionable Skill Gaps to Learn Next: {', '.join(top_actionable) if top_actionable else 'None'}
- Blocked Gaps: {', '.join(blocked_gaps) if blocked_gaps else 'None'}
- Total Estimated Gap Workload: {gap_summary.get('total_estimated_gap_hours', 180)} hours""")

        # 4. Reality Checker Feasibility Audit
        sections.append(f"""=== 4. REALITY CHECKER TIMELINE AUDIT ===
- Feasibility Status: {reality.get('status', 'REALISTIC')}
- Workload Ratio: {reality.get('workload_ratio', 1.13)}
- Available Hours: {reality.get('available_hours', 160)} hours ({reality.get('weeks_remaining', 16)} weeks at {learner.get('hoursPerWeek', 10)}h/wk)
- Required Roadmap Hours: {reality.get('required_hours', 180)} hours
- Recommended Pace: {reality.get('minimum_weekly_hours', 12.0)} hours/week needed to hit target deadline
- Reality Explanation: {reality.get('explanation', 'Workload is moderately tight for the selected timeframe.')}""")

        # 5. Authoritative Job Readiness & Interview Signal
        readiness = context_data.get("readiness", {})
        crit_gaps = [f"{g.get('name')} (gap {g.get('gap')})" for g in readiness.get("criticalGaps", [])[:3]]
        strengths = readiness.get("strengths", [])
        
        sections.append(f"""=== 5. AUTHORITATIVE JOB READINESS & INTERVIEW ELIGIBILITY ===
- Estimated Job Readiness Score: {readiness.get('score', 68)}% ({readiness.get('status', 'NEAR_READY')})
- Data Completeness: {readiness.get('dataCompleteness', 80)}% (Confidence: {readiness.get('confidence', 'MEDIUM')})
- Interview Ready: {'YES' if readiness.get('interviewReady') else 'NO (Practice Mode Available)'}
- Key Strengths: {', '.join(strengths[:3]) if strengths else 'Foundational tools'}
- Critical Priority Gaps: {', '.join(crit_gaps) if crit_gaps else 'None'}
- Authoritative Explanation: {readiness.get('explanation', '')}""")

        # 6. Top Recommendations
        rec_lines = []
        for r in recommendations[:3]:
            rec_lines.append(f"- Action: {r.get('title')} ({r.get('type')}) | Score: {r.get('priority')}/100 | Reason: {r.get('reason')}")
        if rec_lines:
            sections.append(f"=== 6. TOP SYSTEM RECOMMENDATIONS ===\n" + "\n".join(rec_lines))

        # 7. Retrieved RAG & YouTube Learning Resources
        res_lines = []
        for res in resources[:5]:
            res_id = res.get("resource_id") or res.get("id")
            res_lines.append(f"- SOURCE_ID: {res_id} | Title: '{res.get('title')}' | Provider: {res.get('provider')} | Type: {res.get('type')} | Duration: {res.get('duration')} | URL: {res.get('url')} | Why: {res.get('whyRecommended') or res.get('reason')}")
        if res_lines:
            sections.append(f"=== 7. RETRIEVED LEARNING RESOURCES (Use SOURCE_ID for citations) ===\n" + "\n".join(res_lines))

        return "\n\n".join(sections)

    @classmethod
    def build_user_prompt(cls, conversation_history: List[Dict[str, Any]], current_message: str, context_bundle: str) -> str:
        history_lines = []
        for msg in conversation_history[-6:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "").strip()
            history_lines.append(f"{role}: {content}")

        history_str = "\n".join(history_lines) if history_lines else "No previous messages in this conversation."

        return f"""{context_bundle}

=== RECENT CONVERSATION HISTORY ===
{history_str}

=== CURRENT USER QUESTION ===
User: {current_message}

Please respond strictly in JSON format as specified in the system instructions."""
