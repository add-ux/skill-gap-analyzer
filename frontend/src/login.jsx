import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './login.css'

const API_URL = 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.username.trim() || !form.password) {
      return setError('Please fill in both fields.')
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Login failed.')
      }
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      navigate('/analyze')
    } catch (err) {
      setError(err.message || 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-brand-icon">{'{ }'}</span>
            <span className="auth-brand-text">
              Skill<span className="auth-brand-accent">Gap</span>
            </span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to continue analyzing resumes.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Username</span>
              <div className="auth-input-group">
                <i className="fa fa-user"></i>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-group">
                <i className="fa fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <i
                  className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} auth-eye`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </label>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-content">
            <div className="auth-right-icon">{'{ }'}</div>
            <h2>Analyze resumes with AI precision</h2>
            <ul className="auth-right-features">
              <li>✓ Semantic skill matching</li>
              <li>✓ ML-powered resume scoring</li>
              <li>✓ 4-week learning roadmaps</li>
              <li>✓ Full analysis history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}