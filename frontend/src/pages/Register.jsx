import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const STAR_COUNT = 320
    const stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        baseSize: Math.random() * 1.8 + 0.4,
        hue: Math.random() > 0.7 ? (Math.random() * 60 + 180) : 0,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        ox: 0, oy: 0,
      })
    }

    const shootingStars = []
    function spawnShootingStar() {
      if (shootingStars.length < 2 && Math.random() < 0.005) {
        shootingStars.push({
          x: Math.random() * w, y: Math.random() * h * 0.4,
          vx: (Math.random() * 6 + 4) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 3 + 2, life: 1,
          length: Math.random() * 60 + 40,
        })
      }
    }

    const handleMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h }
    window.addEventListener('resize', handleResize)

    let time = 0
    function animate() {
      time += 1
      ctx.clearRect(0, 0, w, h)
      const mx = mouseRef.current.x, my = mouseRef.current.y

      const ng = ctx.createRadialGradient(mx, my, 0, mx, my, 350)
      ng.addColorStop(0, 'rgba(0, 212, 255, 0.06)')
      ng.addColorStop(0.4, 'rgba(120, 80, 255, 0.03)')
      ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng
      ctx.fillRect(0, 0, w, h)

      for (const star of stars) {
        const dx = star.x - mx, dy = star.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = (1 - dist / 200) * 12
          star.ox += (dx / dist) * force * 0.08
          star.oy += (dy / dist) * force * 0.08
        }
        star.ox *= 0.92; star.oy *= 0.92
        const drawX = star.x + star.ox, drawY = star.y + star.oy
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5
        const size = star.baseSize * (0.6 + twinkle * 0.6)
        const alpha = 0.3 + twinkle * 0.7

        if (star.baseSize > 1.2) {
          const gg = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size * 6)
          gg.addColorStop(0, star.hue > 0 ? `hsla(${star.hue},80%,70%,${alpha * 0.15})` : `rgba(255,255,255,${alpha * 0.1})`)
          gg.addColorStop(1, 'transparent')
          ctx.fillStyle = gg
          ctx.fillRect(drawX - size * 6, drawY - size * 6, size * 12, size * 12)
        }

        ctx.beginPath()
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2)
        ctx.fillStyle = star.hue > 0 ? `hsla(${star.hue},80%,80%,${alpha})` : `rgba(255,255,255,${alpha})`
        ctx.fill()
      }

      spawnShootingStar()
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.x += s.vx; s.y += s.vy; s.life -= 0.012
        if (s.life <= 0 || s.x < -100 || s.x > w + 100 || s.y > h + 100) { shootingStars.splice(i, 1); continue }
        const tailX = s.x - s.vx * (s.length / 8), tailY = s.y - s.vy * (s.length / 8)
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(1, `rgba(200,230,255,${s.life * 0.8})`)
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,230,255,${s.life})`; ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('resize', handleResize) }
  }, [])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html, body { height: 100%; }
        body { font-family: 'DM Sans', sans-serif; background: #030306; color: #fff; overflow-x: hidden; }

        .register-root {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #030306;
          position: relative;
          overflow: hidden;
        }

        .star-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .register-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          margin: 1rem;
          padding: 2.5rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 28px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 0 0 1px rgba(0,212,255,0.04), 0 40px 80px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(30px) scale(0.97);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }

        .register-card.mounted {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .register-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,255,136,0.08), transparent 50%, rgba(120,80,255,0.15));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2rem;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00d4ff, #00ff88);
          display: grid;
          place-items: center;
          font-size: 1.1rem;
        }

        .brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-heading {
          font-family: 'Sora', sans-serif;
          font-size: 1.9rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }

        .register-heading span {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-sub {
          color: rgba(255,255,255,0.3);
          font-size: 0.88rem;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .field {
          margin-bottom: 1rem;
          position: relative;
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.4rem;
          transition: color 0.2s;
        }

        .field.focused .field-label { color: #00d4ff; }

        .field-input {
          width: 100%;
          padding: 0.85rem 1.1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          color: #fff;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
        }

        .field-input::placeholder { color: rgba(255,255,255,0.15); }

        .field-input:focus {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.05);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.05);
        }

        .submit-btn {
          width: 100%;
          padding: 0.95rem;
          margin-top: 0.5rem;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #00d4ff, #00b4d8);
          color: #030306;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(0,212,255,0.3);
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,255,0.45); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .error-box {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: #ff6b6b;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .bottom-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.25);
        }

        .bottom-link a {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .bottom-link a:hover { opacity: 0.7; }

        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .divider-text {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
        }
      `}</style>

      <div className="register-root">
        <canvas ref={canvasRef} className="star-canvas" />

        <div className={`register-card ${mounted ? 'mounted' : ''}`}>
          <div className="brand-row">
            <div className="brand-icon">💰</div>
            <span className="brand-name">FinanceAI</span>
          </div>

          <h1 className="register-heading">Create<br /><span>Account.</span></h1>
          <p className="register-sub">Start tracking your finances today</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className={`field ${focused === 'name' ? 'focused' : ''}`}>
              <label className="field-label" htmlFor="reg-name">Full Name</label>
              <input className="field-input" id="reg-name" name="name" type="text"
                placeholder="John Doe" autoComplete="name"
                value={formData.name} onChange={handleChange}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')} required />
            </div>
            <div className={`field ${focused === 'email' ? 'focused' : ''}`}>
              <label className="field-label" htmlFor="reg-email">Email Address</label>
              <input className="field-input" id="reg-email" name="email" type="email"
                placeholder="you@example.com" autoComplete="email"
                value={formData.email} onChange={handleChange}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} required />
            </div>
            <div className={`field ${focused === 'password' ? 'focused' : ''}`}>
              <label className="field-label" htmlFor="reg-password">Password</label>
              <input className="field-input" id="reg-password" name="password" type="password"
                placeholder="••••••••" autoComplete="new-password"
                value={formData.password} onChange={handleChange}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required />
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <p className="bottom-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register