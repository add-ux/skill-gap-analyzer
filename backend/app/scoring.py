"""
Scoring: loads the trained CatBoost model and predicts resume scores.
Falls back to a rule-based formula if the model file is missing.
"""
import os
import re
import joblib

# ---------- Load the ML model at import time ----------
_MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models", "resume_score_model_catboost.joblib"
)
try:
    _ml_model = joblib.load(_MODEL_PATH)
    print(f"[scoring] loaded CatBoost model from {_MODEL_PATH}")
except FileNotFoundError:
    _ml_model = None
    print("[scoring] no trained model found — using rule-based fallback")


# Expected feature order — MUST match train_model.py
FEATURE_ORDER = [
    "skill_string_match_score",
    "fuzzy_match_score",
    "resume_skill_count",
    "job_skill_count",
    "ai_matched_count",
    "coverage_ratio",
    "match_density",
    "skill_count_gap",
    "resume_text_length",
    "job_text_length",
]


# ---------- Helpers ----------
def count_projects(resume_text: str) -> int:
    """Count projects by looking for the PROJECTS section heading."""
    if not resume_text:
        return 0

    lines = [l.rstrip() for l in resume_text.splitlines()]
    start = None
    for i, line in enumerate(lines):
        if line.strip().upper() in (
            "PROJECTS", "PROJECT", "PERSONAL PROJECTS",
            "ACADEMIC PROJECTS", "KEY PROJECTS",
        ):
            start = i
            break

    if start is None:
        return len(re.findall(r"\bprojects?\b", resume_text, re.IGNORECASE))

    count = 0
    for line in lines[start + 1:]:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.isupper() and len(stripped) > 3 and "|" not in stripped:
            break
        if stripped.startswith(("-", "•", "*", "·", "▪")):
            continue
        if (
            3 < len(stripped) < 120
            and not stripped.endswith(".")
            and len(stripped.split()) >= 2
        ):
            count += 1
    return count if count > 0 else 1


def build_feature_vector(
    resume_skills: list,
    job_skills: list,
    matched_count: int,
    resume_text: str,
    job_text: str,
    skill_string_match_score: float,
    fuzzy_match_score: float,
) -> dict:
    """Compute the exact feature vector the CatBoost model was trained on."""
    resume_count = len(resume_skills)
    job_count = len(job_skills)

    coverage_ratio = (matched_count / job_count) if job_count else 0.0
    match_density = (matched_count / resume_count) if resume_count else 0.0
    skill_count_gap = abs(resume_count - job_count)

    return {
        "skill_string_match_score": float(skill_string_match_score),
        "fuzzy_match_score": float(fuzzy_match_score),
        "resume_skill_count": resume_count,
        "job_skill_count": job_count,
        "ai_matched_count": matched_count,
        "coverage_ratio": coverage_ratio,
        "match_density": match_density,
        "skill_count_gap": skill_count_gap,
        "resume_text_length": len(resume_text or ""),
        "job_text_length": len(job_text or ""),
    }


# ---------- Scoring ----------
def score_resume(features: dict) -> int:
    """Predict resume score with the trained CatBoost model."""
    if _ml_model is not None:
        X = [[features.get(f, 0.0) for f in FEATURE_ORDER]]
        pred = _ml_model.predict(X)[0]
        return max(0, min(100, int(round(float(pred)))))

    # Rule-based fallback (used only if the model file is missing)
    coverage = min(features["coverage_ratio"] * 100, 100) / 100.0
    breadth = min(features["resume_skill_count"] / 25.0, 1.0)
    raw = 0.70 * coverage + 0.30 * breadth
    return int(round(raw * 100))


def estimate_interview_probability(features: dict, resume_score: int) -> int:
    """0-100% heuristic for interview probability."""
    coverage = features.get("coverage_ratio", 0.0) * 100
    base = 0.6 * resume_score + 0.4 * coverage
    if features.get("ai_matched_count", 0) >= 5:
        base += 3
    return max(0, min(100, int(round(base))))


def analyze_with_rules(
    match_percentage: float,
    matched_count: int,
    resume_skill_count: int,
    resume_text: str,
    resume_skills: list = None,
    job_skills: list = None,
    job_text: str = "",
    skill_string_match_score: float = 0.0,
    fuzzy_match_score: float = 0.0,
) -> dict:
    """
    Main entry point. Returns resume_score, interview_probability, and features.
    """
    features = build_feature_vector(
        resume_skills=resume_skills or [],
        job_skills=job_skills or [],
        matched_count=matched_count,
        resume_text=resume_text,
        job_text=job_text,
        skill_string_match_score=skill_string_match_score,
        fuzzy_match_score=fuzzy_match_score,
    )
    # Extra fields for the UI (not used by the model)
    features["project_count"] = count_projects(resume_text)
    features["match_percentage"] = match_percentage

    resume_score = score_resume(features)
    interview_probability = estimate_interview_probability(features, resume_score)

    return {
        "features": features,
        "resume_score": resume_score,
        "interview_probability": interview_probability,
        "model_used": "catboost" if _ml_model is not None else "rule-based",
    }