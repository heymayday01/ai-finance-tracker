import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Outfit', sans-serif;
    background: #0a0a0f;
    color: #fff;
    min-height: 100vh;
  }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    position: relative;
    overflow: hidden;
  }

  .auth-orb-1 {
    position: fixed;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
    top: -150px;
    left: -150px;
    pointer-events: none;
  }

  .auth-orb-2 {
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
    pointer-events: none;
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    animation: fadeUp 0.6s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .auth-logo {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .auth-title {
    text-align: center;
    font-size: 1.6rem;
    font-weight: 700;
    background: linear-gradient(135deg, #818cf8, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.4rem;
  }

  .auth-subtitle {
    text-align: center;
    color: rgba(255,255,255,0.35);
    font-size: 0.9rem;
    font-weight: 400;
    margin-bottom: 2rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .auth-input {
    padding: 0.85rem 1.1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    color: #fff;
    font-size: 0.95rem;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .auth-input::placeholder { color: rgba(255,255,255,0.25); }

  .auth-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.08);
  }

  .auth-btn {
    margin-top: 0.5rem;
    padding: 0.9rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  }

  .auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99,102,241,0.45);
  }

  .auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .auth-error {
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.3);
    color: #f87171;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.88rem;
    margin-bottom: 0.5rem;
  }

  .auth-link {
    text-align: center;
    margin-top: 1.25rem;
    color: rgba(255,255,255,0.35);
    font-size: 0.88rem;
  }

  .auth-link a {
    color: #818cf8;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .auth-link a:hover { color: #a5b4fc; }
`

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', formData)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-orb-1" />
        <div className="auth-orb-2" />
        <div className="auth-card">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">Finance Tracker</h1>
          <p className="auth-subtitle">Welcome back, sign in to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <input className="auth-input" type="email" name="email"
              placeholder="Email address" value={formData.email}
              onChange={handleChange} required />
            <input className="auth-input" type="password" name="password"
              placeholder="Password" value={formData.password}
              onChange={handleChange} required />
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login