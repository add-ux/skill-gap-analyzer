"""
train_model.py — Trains a CatBoostRegressor to predict resume-job fit scores.

Dataset: Kaggle "Job-Resume Fit Dataset" (2385 rows)
Features: 10 engineered features (skill overlap, text lengths, coverage ratios)
Target:   ai_match_score (0-100)

Also trains a Random Forest baseline for comparison.

Usage:
    python train_model.py
"""
import ast
import os

import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

from catboost import CatBoostRegressor


# ---------- Config ----------
REAL_CSV    = "data/job_resume_fit.csv"
MODEL_PATH  = "models/resume_score_model_catboost.joblib"
META_PATH   = "models/ensemble_metadata.joblib"
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


def _safe_list_len(value) -> int:
    """Parse "['a', 'b']" strings into a length."""
    if pd.isna(value) or value == "":
        return 0
    try:
        parsed = ast.literal_eval(value)
        return len(parsed) if isinstance(parsed, list) else 0
    except (ValueError, SyntaxError):
        return 0


def build_real_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer the 10 features the model is trained on."""
    feats = pd.DataFrame(index=df.index)

    feats["skill_string_match_score"] = df["skill_string_match_score"].fillna(0)
    feats["fuzzy_match_score"]        = df["fuzzy_match_score"].fillna(0)

    feats["resume_skill_count"] = df["resume_skill_list"].apply(_safe_list_len)
    feats["job_skill_count"]    = df["job_required_skills"].apply(_safe_list_len)
    feats["ai_matched_count"]   = df["ai_matched_skills"].apply(_safe_list_len)

    feats["coverage_ratio"] = (
        feats["ai_matched_count"] / feats["job_skill_count"].replace(0, np.nan)
    ).fillna(0)

    feats["match_density"] = (
        feats["ai_matched_count"] / feats["resume_skill_count"].replace(0, np.nan)
    ).fillna(0)

    feats["skill_count_gap"] = (
        feats["resume_skill_count"] - feats["job_skill_count"]
    ).abs()

    feats["resume_text_length"] = df["resume_text"].fillna("").str.len()
    feats["job_text_length"]    = df["job_text"].fillna("").str.len()

    return feats


def main():
    print("=" * 60)
    print("  AI Skill Gap Analyzer — CatBoost Training")
    print("=" * 60)

    # --- Load ---
    print(f"\n[1/4] Loading {REAL_CSV}")
    if not os.path.exists(REAL_CSV):
        raise SystemExit(f"ERROR: Dataset not found at {REAL_CSV}")

    df = pd.read_csv(REAL_CSV)
    print(f"      {len(df)} rows, {len(df.columns)} columns")

    # --- Features ---
    print("\n[2/4] Engineering features")
    X = build_real_features(df)
    y = df["ai_match_score"].fillna(0)
    print(f"      {X.shape[1]} features: {list(X.columns)}")

    # --- Split ---
    print("\n[3/4] Splitting & training models")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # --- Baseline: Random Forest ---
    print("      Training RandomForest baseline...")
    rf = RandomForestRegressor(
        n_estimators=200, max_depth=16, random_state=42, n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_r2  = r2_score(y_test, rf_preds)

    # --- Primary: CatBoost ---
    print("      Training CatBoostRegressor...")
    model = CatBoostRegressor(
        iterations=500,
        learning_rate=0.05,
        depth=6,
        loss_function="RMSE",
        random_seed=42,
        verbose=False,
    )
    model.fit(X_train, y_train)

    # --- Evaluate ---
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2  = r2_score(y_test, preds)

    print(f"\n[4/4] Evaluation")
    print(f"      RandomForest:  MAE={rf_mae:.2f}   R²={rf_r2:.3f}")
    print(f"      CatBoost:      MAE={mae:.2f}   R²={r2:.3f}")

    print("\n      CatBoost feature importances:")
    importances = model.get_feature_importance()
    for name, imp in sorted(
        zip(X.columns, importances), key=lambda x: -x[1]
    ):
        bar = "#" * int(imp * 40 / 100)
        print(f"        {name:28s} {imp:.1f}  {bar}")

    # --- Save ---
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    meta = {
        "model_type": "CatBoostRegressor",
        "features": list(X.columns),
        "catboost_mae": round(mae, 2),
        "catboost_r2": round(r2, 3),
        "rf_mae": round(rf_mae, 2),
        "rf_r2": round(rf_r2, 3),
    }
    joblib.dump(meta, META_PATH)

    print(f"\n      Model saved → {MODEL_PATH}")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)
    print(f"  CatBoost R²:   {r2:.3f}   (baseline RF: {rf_r2:.3f})")
    print(f"  CatBoost MAE:  {mae:.2f}  (baseline RF: {rf_mae:.2f})")
    print("=" * 60)


if __name__ == "__main__":
    main()