import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './signup.css'

const API_URL = 'http://localhost:8000'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.username.trim().length < 3) return setError('Username must be at least 3 characters.')
    if (!form.email.includes('@')) return setError('Please enter a valid email.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Signup failed.')
      }
      setSuccess('Account created! Redirecting to sign in…')
      setTimeout(() => navigate('/login'), 1200)
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

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Get started in seconds. No credit card required.
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Username</span>
              <div className="auth-input-group">
                <i className="fa fa-user"></i>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Email</span>
              <div className="auth-input-group">
                <i className="fa fa-envelope"></i>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <i
                  className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} auth-eye`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </label>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-content">
            <div className="auth-right-icon">{'{ }'}</div>
            <h2>Join to find your skill gaps</h2>
            <ul className="auth-right-features">
              <li>✓ Unlimited resume analyses</li>
              <li>✓ ML-powered fit scoring</li>
              <li>✓ Learning roadmaps</li>
              <li>✓ Full history & comparison</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}