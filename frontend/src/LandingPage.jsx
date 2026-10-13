import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode')
    else document.body.classList.remove('dark-mode')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${
      darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
    } 0%, transparent 70%)`,
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="landing-brand-icon">{'{ }'}</span>
          <span className="landing-brand-text">
            Skill<span className="landing-brand-accent">Gap</span>
          </span>
        </div>
        <div className="landing-nav-right">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="nav-login-btn" onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className="nav-signup-btn" onClick={() => navigate('/signup')}>
            Get started
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="landing-hero" style={gradientStyle}>
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                ML-powered · Semantic matching
              </div>
              <h1>
                Find out if you're a fit
                <br />
                <span className="accent-text">before you apply.</span>
              </h1>
              <p className="hero-description">
                Upload your resume, paste any job description, and get an instant
                match score, missing skills, and a personalized 4-week learning
                roadmap — powered by a trained CatBoost ML model.
              </p>
              <div className="hero-cta">
                <button className="btn-primary" onClick={() => navigate('/signup')}>
                  Get started free
                  <span className="btn-arrow">→</span>
                </button>
                <button className="btn-secondary-hero" onClick={() => navigate('/login')}>
                  I have an account
                </button>
              </div>
              <div className="hero-trust">
                ✓ Trained on 2,385 real resume-job pairs · R² 0.986
              </div>
            </div>

            <div className="landing-hero-visual">
              <div className="demo-card">
                <div className="demo-header">
                  <span className="demo-dot red"></span>
                  <span className="demo-dot amber"></span>
                  <span className="demo-dot green"></span>
                  <span className="demo-title">analyze.py</span>
                </div>
                <pre className="demo-code">{`$ skillgap analyze resume.pdf --jd job.txt

  Skill Match:          83%
  Resume Score:         71/100
  Interview Prob:       79%
  Projects Detected:    3

  ✅ Matched:  Python, C++, React, Git, OOP
  ❌ Missing:  Linux, Docker, AWS

  Model: CatBoost · R²=0.986
$`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="landing-stats" style={gradientStyle}>
          <div className="landing-container landing-stats-grid">
            <div className="landing-stat">
              <span className="stat-number">2,385</span>
              <span className="stat-label">resume-JD pairs</span>
            </div>
            <div className="landing-stat">
              <span className="stat-number">10</span>
              <span className="stat-label">ML features</span>
            </div>
            <div className="landing-stat">
              <span className="stat-number">R² 0.986</span>
              <span className="stat-label">model accuracy</span>
            </div>
            <div className="landing-stat">
              <span className="stat-number">~5s</span>
              <span className="stat-label">per analysis</span>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section className="landing-features" style={gradientStyle}>
          <div className="landing-container">
            <h2 className="section-title">What you get</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Semantic matching</h3>
                <p>
                  Not just exact keywords. Uses sentence embeddings to match
                  related skills like "Flask" ↔ "Express".
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>ML-powered scoring</h3>
                <p>
                  A trained CatBoost model predicts your Resume Score from 10
                  engineered features. R² = 0.986.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗺️</div>
                <h3>Learning roadmap</h3>
                <p>
                  Get a personalized 4-week study plan focused on your specific
                  missing skills.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🕓</div>
                <h3>Full history</h3>
                <p>
                  Every analysis is saved. Revisit past results, compare JDs, and
                  track your progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="landing-how" style={gradientStyle}>
          <div className="landing-container">
            <h2 className="section-title">How it works</h2>
            <div className="how-steps">
              <div className="how-step">
                <span className="step-num">1</span>
                <h4>Upload</h4>
                <p>Drop your resume — PDF or DOCX</p>
              </div>
              <div className="how-step">
                <span className="step-num">2</span>
                <h4>Paste JD</h4>
                <p>Any job description you're targeting</p>
              </div>
              <div className="how-step">
                <span className="step-num">3</span>
                <h4>Analyze</h4>
                <p>Get scores, gaps, and a roadmap</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-cta" style={gradientStyle}>
          <div className="landing-container">
            <div className="cta-card">
              <h2>Ready to find your gap?</h2>
              <p>
                Create a free account and run your first analysis in under a minute.
              </p>
              <button className="btn-cta-light" onClick={() => navigate('/signup')}>
                Get started →
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div>
              <strong>SkillGap</strong>
              <p>AI-powered resume analysis</p>
            </div>
            <div>
              <span>Product</span>
              <button onClick={() => navigate('/signup')}>Sign up</button>
              <button onClick={() => navigate('/login')}>Sign in</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 SkillGap · MCA Final Year Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}