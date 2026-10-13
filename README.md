# AI Skill Gap Analyzer

AI-powered resume analyzer that compares a resume against a job description, identifies missing skills, and generates a personalized learning roadmap.

## Features

- **Resume parsing** — PDF and DOCX text extraction
- **Skill extraction** — spaCy NLP pipeline with a 150+ skill dictionary
- **Semantic matching** — sentence embeddings (`all-MiniLM-L6-v2`) with cosine similarity
- **ML scoring** — CatBoost regressor trained on 2,385 labeled resume-JD pairs
- **Learning roadmap** — 4-week personalized plan (LLM or template-based)
- **User auth** — signup/login with PBKDF2-hashed passwords
- **History** — SQLite persistence with browse, view, and delete

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | FastAPI (Python 3.11) |
| ML | CatBoost, scikit-learn, PyTorch |
| NLP | spaCy, sentence-transformers |
| Database | SQLite via SQLAlchemy |
| Auth | PBKDF2-HMAC-SHA256 |

## Model Performance

| Metric | Value |
|--------|-------|
| Dataset | 2,385 labeled resume-JD pairs |
| Model | CatBoostRegressor |
| R² | 0.986 |
| MAE | 2.11 points |

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000