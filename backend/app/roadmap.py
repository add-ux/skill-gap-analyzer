"""
Learning-roadmap generator for missing skills.

Two paths:
  1. If OPENAI_API_KEY is set -> call an OpenAI-compatible API
     (OpenAI itself, or DeepSeek if DEEPSEEK_BASE_URL is set).
  2. Otherwise -> use a curated template library (offline, free, always works).

Both paths return the same JSON shape so the frontend doesn't care which ran.
"""
import json
import os
from typing import List, Dict


# -------------------------------------------------------------------
# Skill-specific 4-week templates
# -------------------------------------------------------------------
SKILL_TEMPLATES: Dict[str, List[Dict[str, str]]] = {
    "Linux": [
        {"topic": "Shell basics & file system",
         "description": "Practice ls, cd, grep, find, chmod, pipes. Get comfortable in the terminal."},
        {"topic": "Processes & permissions",
         "description": "Learn ps, top, kill, users/groups, sudo. Understand file ownership and permissions."},
        {"topic": "Networking & packages",
         "description": "Use apt/yum, curl, ssh, scp. Understand ports, DNS, and basic firewalls."},
        {"topic": "Shell scripting mini-project",
         "description": "Write a bash script that automates a repetitive task (e.g., log cleanup or backup)."},
    ],
    "Problem Solving": [
        {"topic": "Arrays, strings & hashing",
         "description": "Solve 15 easy LeetCode problems on arrays, strings, and hash maps."},
        {"topic": "Two pointers & sliding window",
         "description": "Solve 10 medium problems using two-pointer and sliding-window patterns."},
        {"topic": "Trees, graphs & recursion",
         "description": "Practice BFS/DFS on trees and graphs. Solve 10 problems."},
        {"topic": "Dynamic programming intro",
         "description": "Learn memoization and tabulation. Solve 8 classic DP problems."},
    ],
    "Docker": [
        {"topic": "Containers vs VMs",
         "description": "Understand images, containers, and the Docker daemon. Install Docker Desktop."},
        {"topic": "Writing Dockerfiles",
         "description": "Containerize a small Python or Node app. Learn layer caching and multi-stage builds."},
        {"topic": "Volumes & networking",
         "description": "Persist data with volumes. Connect multiple containers on a custom network."},
        {"topic": "Compose & registry",
         "description": "Write a docker-compose.yml for a 2-service app. Push an image to Docker Hub."},
    ],
    "AWS": [
        {"topic": "Core services overview",
         "description": "Learn EC2, S3, IAM, VPC. Create a free-tier account and launch an instance."},
        {"topic": "Storage & databases",
         "description": "Use S3 for object storage, RDS for managed Postgres. Practice backups."},
        {"topic": "Serverless & Lambda",
         "description": "Write a Lambda function triggered by API Gateway. Understand cold starts."},
        {"topic": "Deploy a real app",
         "description": "Deploy a small app on EC2 behind Nginx, or use Elastic Beanstalk."},
    ],
    "TypeScript": [
        {"topic": "Types & interfaces",
         "description": "Learn basic types, interfaces, unions. Convert a small JS file to TS."},
        {"topic": "Generics & utility types",
         "description": "Use generics, Partial, Pick, Omit. Type a small utility library."},
        {"topic": "TS with React",
         "description": "Add TS to a React project. Type props, hooks, and API responses."},
        {"topic": "Advanced patterns",
         "description": "Learn discriminated unions, type guards, and strict mode."},
    ],
    "Node.js": [
        {"topic": "Runtime & modules",
         "description": "Understand the event loop, CommonJS vs ESM, and npm basics."},
        {"topic": "Building HTTP servers",
         "description": "Build a small REST API with raw http module, then with Express."},
        {"topic": "Async patterns",
         "description": "Master callbacks, promises, async/await. Handle errors and streams."},
        {"topic": "Database integration",
         "description": "Connect a Node API to MongoDB or Postgres. Add auth with JWT."},
    ],
    "Express": [
        {"topic": "Routing & middleware",
         "description": "Set up routes, use built-in and custom middleware."},
        {"topic": "Error handling & validation",
         "description": "Add centralized error handling and input validation (Zod/Joi)."},
        {"topic": "Auth & sessions",
         "description": "Implement JWT auth, password hashing with bcrypt, and role guards."},
        {"topic": "Production patterns",
         "description": "Add logging, rate limiting, CORS, and deploy to a free host."},
    ],
    "MongoDB": [
        {"topic": "Documents & collections",
         "description": "Install MongoDB, use mongosh, perform CRUD on documents."},
        {"topic": "Queries & indexes",
         "description": "Learn find, aggregate, and how indexes speed up queries."},
        {"topic": "Schema design",
         "description": "Model one-to-many and many-to-many relationships. Compare with SQL."},
        {"topic": "Node + Mongoose",
         "description": "Integrate MongoDB with a Node API using Mongoose ODM."},
    ],
    "Jest": [
        {"topic": "Unit testing basics",
         "description": "Learn describe, it, expect. Write your first tests for a pure function."},
        {"topic": "Mocking & spies",
         "description": "Mock modules, timers, and API calls with jest.fn and jest.mock."},
        {"topic": "Testing async code",
         "description": "Test promises, async/await, and error paths."},
        {"topic": "Integration & coverage",
         "description": "Write integration tests, generate coverage reports, set thresholds."},
    ],
    "REST": [
        {"topic": "HTTP fundamentals",
         "description": "Learn methods, status codes, headers, and idempotency."},
        {"topic": "Designing resources",
         "description": "Model resources, use nested routes, and version your API."},
        {"topic": "Auth & pagination",
         "description": "Add API keys/JWT, pagination, filtering, and sorting."},
        {"topic": "Build a small API",
         "description": "Build and document a CRUD API for a real use case (blog/todo)."},
    ],
    "REST API": [
        {"topic": "HTTP fundamentals",
         "description": "Learn methods, status codes, headers, and idempotency."},
        {"topic": "Designing resources",
         "description": "Model resources, use nested routes, and version your API."},
        {"topic": "Auth & pagination",
         "description": "Add API keys/JWT, pagination, filtering, and sorting."},
        {"topic": "Build a small API",
         "description": "Build and document a CRUD API for a real use case (blog/todo)."},
    ],
}


def _generic_template(skill: str) -> List[Dict[str, str]]:
    return [
        {"topic": f"{skill} - fundamentals",
         "description": f"Study the basics of {skill}: key concepts, official docs, and one intro tutorial."},
        {"topic": f"{skill} - hands-on practice",
         "description": f"Build a small project that uses {skill}. Focus on breadth over polish."},
        {"topic": f"{skill} - deeper concepts",
         "description": f"Explore advanced features, best practices, and common pitfalls of {skill}."},
        {"topic": f"{skill} - mini capstone",
         "description": f"Build a slightly larger project combining {skill} with something you already know."},
    ]


def _template_roadmap(missing_skills: List[str]) -> Dict:
    """
    Build a 4-week roadmap that evenly distributes the missing skills.
    """
    skills = [s for s in missing_skills if s]

    if not skills:
        return {
            "source": "template",
            "weeks": [
                {"week": 1, "topic": "No missing skills",
                 "description": "Your resume already covers the required skills. Nice work!"},
            ],
        }

    weeks = []

    if len(skills) == 1:
        skill = skills[0]
        template = SKILL_TEMPLATES.get(skill) or _generic_template(skill)
        for i, entry in enumerate(template[:4], start=1):
            weeks.append({
                "week": i,
                "topic": entry["topic"],
                "description": entry["description"],
                "skills": [skill],
            })

    elif len(skills) == 2:
        for idx, skill in enumerate(skills):
            template = SKILL_TEMPLATES.get(skill) or _generic_template(skill)
            for j in range(2):
                weeks.append({
                    "week": idx * 2 + j + 1,
                    "topic": template[j]["topic"] if j < len(template) else template[0]["topic"],
                    "description": template[j]["description"] if j < len(template) else template[0]["description"],
                    "skills": [skill],
                })

    elif len(skills) == 3:
        for i, skill in enumerate(skills, start=1):
            template = SKILL_TEMPLATES.get(skill) or _generic_template(skill)
            weeks.append({
                "week": i,
                "topic": template[0]["topic"],
                "description": template[0]["description"],
                "skills": [skill],
            })
        weeks.append({
            "week": 4,
            "topic": f"Capstone - integrate {', '.join(skills)}",
            "description": (
                f"Build one project that uses all three: {', '.join(skills)}. "
                f"Document it on GitHub and link it in your resume."
            ),
            "skills": skills,
        })

    else:
        shown = skills[:4]
        for i, skill in enumerate(shown, start=1):
            template = SKILL_TEMPLATES.get(skill) or _generic_template(skill)
            weeks.append({
                "week": i,
                "topic": template[0]["topic"],
                "description": template[0]["description"],
                "skills": [skill],
            })
        if len(skills) > 4:
            weeks[3]["description"] += (
                f" Also consider tackling: {', '.join(skills[4:])}."
            )

    return {"source": "template", "weeks": weeks}


SYSTEM_PROMPT = (
    "You are an expert technical mentor for computer-science students. "
    "You create focused, actionable 4-week learning plans. "
    "Always respond with strict JSON only, matching this exact shape: "
    '{"weeks": [{"week": 1, "topic": "...", "description": "..."}, ... 4 items total]}'
)


def _llm_roadmap(missing_skills: List[str]) -> Dict:
    """
    Generate the roadmap via an OpenAI-compatible API.
    Works with OpenAI (default) OR DeepSeek (if DEEPSEEK_BASE_URL is set).
    """
    from openai import OpenAI

    base_url = os.getenv("DEEPSEEK_BASE_URL", "").strip() or None
    model = os.getenv("DEEPSEEK_MODEL", "").strip() or "gpt-4o-mini"

    client = OpenAI(base_url=base_url) if base_url else OpenAI()

    user_prompt = (
        f"A student is missing these skills for a target job: {', '.join(missing_skills)}.\n\n"
        f"Create a 4-week learning plan. Each week should focus on 1-2 of these skills. "
        f"Descriptions must be 1-2 sentences and concrete (name a project or exercise). "
        f"Respond with JSON only."
    )

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )

    parsed = json.loads(response.choices[0].message.content)
    weeks = parsed.get("weeks", [])
    return {"source": "openai", "weeks": weeks[:4]}


def generate_roadmap(missing_skills: List[str]) -> Dict:
    """
    Try the LLM if a key is set; fall back to templates on any failure.
    Never raises - always returns a dict the frontend can render.
    """
    if not missing_skills:
        return _template_roadmap([])

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if api_key:
        try:
            return _llm_roadmap(missing_skills)
        except Exception as exc:
            fallback = _template_roadmap(missing_skills)
            fallback["note"] = f"LLM call failed, used template fallback: {exc}"
            return fallback

    return _template_roadmap(missing_skills)