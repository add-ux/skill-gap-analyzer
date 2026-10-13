export default function RoadmapPanel({ roadmap }) {
  if (!roadmap || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) {
    return null
  }

  const source = roadmap.source === 'openai' ? 'AI-generated' : 'Curated plan'

  return (
    <section className="results-section roadmap-section">
      <h3 className="section-title roadmap-title">
        🗺️ 4-Week Learning Roadmap
        <span className="roadmap-source">{source}</span>
      </h3>

      <div className="roadmap-list">
        {roadmap.weeks.map((w, i) => (
          <div className="roadmap-week" key={i}>
            <div className="roadmap-week-badge">Week {w.week}</div>
            <div className="roadmap-week-body">
              <h4>{w.topic}</h4>
              <p>{w.description}</p>
              {Array.isArray(w.skills) && w.skills.length > 0 && (
                <div className="roadmap-skills">
                  {w.skills.map((s, j) => (
                    <span className="roadmap-skill-tag" key={j}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {roadmap.note && (
        <p className="roadmap-note">{roadmap.note}</p>
      )}
    </section>
  )
}