import { useEffect, useState } from 'react'
import ResultsPanel from './ResultsPanel'

const API_URL = 'http://localhost:8000'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'Z')
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function scoreColor(pct) {
  if (pct >= 70) return '#22c55e'
  if (pct >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function HistoryTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/history?limit=50`)
      if (!res.ok) throw new Error('Failed to load history')
      const data = await res.json()
      setItems(data.items || [])
      if (data.items?.length > 0 && !selected) {
        setSelected(data.items[0])
      }
    } catch (err) {
      setError(err.message || 'Could not load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this analysis?')) return
    try {
      const res = await fetch(`${API_URL}/history/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((it) => it.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="two-col">
      {/* LEFT: list */}
      <aside className="col-form">
        <div className="card">
          <div className="history-header">
            <h2 className="card-title">Past Analyses</h2>
            <button className="btn-secondary btn-small" onClick={load} disabled={loading}>
              {loading ? '…' : 'Refresh'}
            </button>
          </div>

          {error && <div className="alert error">{error}</div>}

          {loading && items.length === 0 && (
            <p className="muted">Loading…</p>
          )}

          {!loading && items.length === 0 && (
            <p className="muted">
              No analyses yet. Run one from the Analyze tab.
            </p>
          )}

          {items.length > 0 && (
            <div className="history-list">
              {items.map((it) => (
                <div
                  key={it.id}
                  className={`history-row ${selected?.id === it.id ? 'history-row-active' : ''}`}
                  onClick={() => setSelected(it)}
                >
                  <div
                    className="history-score"
                    style={{ background: scoreColor(it.match_percentage) }}
                  >
                    {Math.round(it.match_percentage)}%
                  </div>

                  <div className="history-body">
                    <div className="history-file">📄 {it.resume_filename}</div>
                    <div className="history-meta">
                      <span>{formatDate(it.timestamp)}</span>
                      <span>·</span>
                      <span>Score: {it.resume_score ?? '—'}</span>
                    </div>
                  </div>

                  <button
                    className="history-delete"
                    onClick={(e) => handleDelete(it.id, e)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT: detail */}
      <main className="col-results">
        {selected ? (
          <ResultsPanel result={selected} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🕓</div>
            <h3>Select an analysis</h3>
            <p>Click a past analysis on the left to see its full details.</p>
          </div>
        )}
      </main>
    </div>
  )
}