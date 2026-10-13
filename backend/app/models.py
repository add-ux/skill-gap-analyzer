"""
Database models.

Two tables:
  - `analyses` — one row per successful /analyze call
  - `users`    — one row per registered user (for auth)
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from .database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    resume_filename = Column(String, nullable=False)
    job_description = Column(Text)

    match_percentage = Column(Float, nullable=False)
    resume_score = Column(Integer)
    interview_probability = Column(Integer)
    project_count = Column(Integer)

    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    extra_resume_skills = Column(JSON)
    roadmap = Column(JSON)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "resume_filename": self.resume_filename,
            "job_description": self.job_description,
            "match_percentage": self.match_percentage,
            "resume_score": self.resume_score,
            "interview_probability": self.interview_probability,
            "project_count": self.project_count,
            "matched_skills": self.matched_skills or [],
            "missing_skills": self.missing_skills or [],
            "extra_resume_skills": self.extra_resume_skills or [],
            "roadmap": self.roadmap or {},
        }


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }