import { useState, useEffect } from 'react'
import './App.css'
import ResultsPanel from './ResultsPanel'
import LoadingState from './LoadingState'
import HistoryTab from './HistoryTab'

const API_URL = 'http://localhost:8000'
const MAX_FILE_SIZE_MB = 10
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

export default function App() {
  const [tab, setTab] = useState('analyze')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  function validateInputs() {
    if (!resumeFile) return 'Please choose a resume file (PDF or DOCX).'
    const name = resumeFile.name.toLowerCase()
    if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext)))
      return 'Unsupported file type. Please upload a PDF or DOCX file.'
    const sizeMB = resumeFile.size / (1024 * 1024)
    if (sizeMB > MAX_FILE_SIZE_MB)
      return `File is too large (${sizeMB.toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`
    if (resumeFile.size === 0)
      return 'The selected file is empty. Please choose a different one.'
    const jd = jobDescription.trim()
    if (jd.length < 3) return 'Please paste a job description.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const err = validateInputs()
    if (err) return setError(err)

    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_description', jobDescription)

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          typeof data.detail === 'string'
            ? data.detail
            : 'The server could not process this request.'
        throw new Error(msg)
      }
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError('')
    setResumeFile(null)
    setJobDescription('')
  }

  return (
    <div className="app-shell">
      {/* ===== Navigation Bar ===== */}
      <nav className="app-nav">
        <div className="app-brand">
          <span className="app-brand-icon">{'{ }'}</span>
          <span className="app-brand-text">
            Skill<span className="app-brand-accent">Gap</span>
          </span>
        </div>

        <div className="nav-controls">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* ===== Page Body ===== */}
      <div className="page-body">
        <header className="page-header">
          <h1>AI Skill Gap Analyzer</h1>
          <p className="page-subtitle">
            Compare your resume against any job description using semantic AI
          </p>
        </header>

        {/* Tabs */}
        <nav className="tab-bar">
          <button
            className={`tab ${tab === 'analyze' ? 'tab-active' : ''}`}
            onClick={() => setTab('analyze')}
          >
            <span className="tab-icon">📊</span>
            Analyze
          </button>
          <button
            className={`tab ${tab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setTab('history')}
          >
            <span className="tab-icon">🕓</span>
            History
          </button>
        </nav>

        {tab === 'analyze' && (
          <div className="two-col">
            {/* LEFT: form */}
            <aside className="col-form">
              <form className="card" onSubmit={handleSubmit}>
                <h2 className="card-title">New Analysis</h2>

                <label className="field">
                  <span>Resume (PDF or DOCX, max {MAX_FILE_SIZE_MB} MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      setResumeFile(e.target.files?.[0] ?? null)
                      setError('')
                    }}
                  />
                  {resumeFile && (
                    <span className="file-hint">
                      {resumeFile.name} · {(resumeFile.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                </label>

                <label className="field">
                  <span>Job Description</span>
                  <textarea
                    rows={10}
                    placeholder="Paste the job description or a list of required skills here..."
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value)
                      setError('')
                    }}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing…' : 'Analyze'}
                  </button>
                  {result && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {error && <div className="alert error">{error}</div>}
              </form>
            </aside>

            {/* RIGHT: results */}
            <main className="col-results">
              {loading && <LoadingState />}

              {result && !loading && <ResultsPanel result={result} />}

              {!loading && !result && (
                <div className="empty-state">
                  <div className="empty-icon">{'{ }'}</div>
                  <h3>Ready to analyze</h3>
                  <p>
                    Upload a resume and paste a job description, then click
                    <strong> Analyze</strong>. Your match score, missing skills,
                    and a 4-week learning roadmap will appear here.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}

        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  )
}