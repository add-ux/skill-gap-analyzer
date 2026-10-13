import { useEffect, useState } from 'react'
import SkillBadge from './SkillBadge'
import RoadmapPanel from './RoadmapPanel'

function MatchRing({ percentage }) {
  const [animatedPct, setAnimatedPct] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(percentage), 150)
    return () => clearTimeout(timer)
  }, [percentage])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPct / 100) * circumference

  let color = '#ef4444'
  if (percentage >= 70) color = '#22c55e'
  else if (percentage >= 40) color = '#f59e0b'

  return (
    <div className="ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle
          className="ring-track"
          cx="65" cy="65" r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth="11"
        />
        <circle
          cx="65" cy="65" r={radius}
          fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <text
          className="ring-text"
          x="65" y="65"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="28"
          fontWeight="700"
          fill="#111827"
        >
          {Math.round(animatedPct)}%
        </text>
      </svg>
      <p className="ring-label">Skill Match</p>
    </div>
  )
}

function scoreVariant(value, goodThreshold = 75, okThreshold = 50) {
  if (value == null) return 'neutral'
  if (value >= goodThreshold) return 'good'
  if (value >= okThreshold) return 'ok'
  return 'bad'
}

export default function ResultsPanel({ result }) {
  const {
    match_percentage = 0,
    matched_skills = [],
    missing_skills = [],
    extra_resume_skills = [],
    resume_skills = [],
    job_skills = [],
    resume_score = null,
    interview_probability = null,
    project_count = null,
    features = {},
  } = result

  const resumeSkillCount = resume_skills.length
  const jobSkillCount = job_skills.length
  const projectCount = features?.project_count ?? project_count ?? null

  const scoreClass = scoreVariant(resume_score)
  const probClass = scoreVariant(interview_probability, 75, 50)

  let summary = ''
  if (match_percentage >= 70) summary = 'Strong match — your resume covers most of the key requirements.'
  else if (match_percentage >= 40) summary = 'Partial match — you have the foundation, but a few gaps remain.'
  else summary = 'Significant gaps — focus on the missing skills below to improve your fit.'

  return (
    <div className="card results-card">
      <div className="results-header">
        <MatchRing percentage={match_percentage} />

        <div className="results-summary">
          <h2>{summary}</h2>
          <p className="muted">
            <strong>{matched_skills.length}</strong> of <strong>{jobSkillCount}</strong> job skills matched
            {' · '}
            <strong>{resumeSkillCount}</strong> skills found in your resume
          </p>

          <div className="stat-row">
            <div className={`stat-card stat-score stat-${scoreClass}`}>
              <span className="stat-label">Resume Score</span>
              <span className="stat-value">
                {resume_score ?? '—'}<span className="stat-unit">/100</span>
              </span>
            </div>

            <div className={`stat-card stat-prob stat-${probClass}`}>
              <span className="stat-label">Interview Probability</span>
              <span className="stat-value">
                {interview_probability ?? '—'}<span className="stat-unit">%</span>
              </span>
            </div>

            <div className="stat-card stat-projects">
              <span className="stat-label">Projects Detected</span>
              <span className="stat-value">{projectCount ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="results-section">
        <h3 className="section-title matched-title">
          ✅ Matched Skills <span className="count">({matched_skills.length})</span>
        </h3>
        {matched_skills.length === 0 ? (
          <p className="muted">No matching skills found.</p>
        ) : (
          <div className="badge-list">
            {matched_skills.map((m, i) => (
              <SkillBadge
                key={i}
                label={m.job_skill}
                variant="matched"
                similarity={m.similarity}
              />
            ))}
          </div>
        )}
      </section>

      <section className="results-section">
        <h3 className="section-title missing-title">
          ❌ Missing Skills <span className="count">({missing_skills.length})</span>
        </h3>
        {missing_skills.length === 0 ? (
          <p className="muted">You cover every required skill. 🎉</p>
        ) : (
          <div className="badge-list">
            {missing_skills.map((s, i) => (
              <SkillBadge key={i} label={s} variant="missing" />
            ))}
          </div>
        )}
      </section>

      <section className="results-section">
        <h3 className="section-title extra-title">
          💡 Other Skills on Your Resume <span className="count">({extra_resume_skills.length})</span>
        </h3>
        {extra_resume_skills.length === 0 ? (
          <p className="muted">No additional skills detected.</p>
        ) : (
          <div className="badge-list">
            {extra_resume_skills.map((s, i) => (
              <SkillBadge key={i} label={s} variant="extra" />
            ))}
          </div>
        )}
      </section>

      <RoadmapPanel roadmap={result.roadmap} />
    </div>
  )
}