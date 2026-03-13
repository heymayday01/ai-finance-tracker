import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { ExpensePieChart, IncomeExpenseBar } from '../components/Charts'

function Dashboard() {
  const [insights, setInsights] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    category: '',
    description: ''
  })
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const STAR_COUNT = 220
    const stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseSize: Math.random() * 1.6 + 0.3,
        hue: Math.random() > 0.75 ? (Math.random() * 60 + 180) : 0,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        ox: 0, oy: 0,
      })
    }

    const shootingStars = []
    function spawnShootingStar() {
      if (shootingStars.length < 2 && Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * w, y: Math.random() * h * 0.4,
          vx: (Math.random() * 5 + 3) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 2.5 + 1.5, life: 1,
          length: Math.random() * 50 + 30,
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

      // Nebula glow
      const ng = ctx.createRadialGradient(mx, my, 0, mx, my, 300)
      ng.addColorStop(0, 'rgba(0, 212, 255, 0.05)')
      ng.addColorStop(0.5, 'rgba(120, 80, 255, 0.02)')
      ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng
      ctx.fillRect(0, 0, w, h)

      for (const star of stars) {
        const dx = star.x - mx, dy = star.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180) {
          const force = (1 - dist / 180) * 10
          star.ox += (dx / dist) * force * 0.06
          star.oy += (dy / dist) * force * 0.06
        }
        star.ox *= 0.93; star.oy *= 0.93
        const drawX = star.x + star.ox, drawY = star.y + star.oy
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5
        const size = star.baseSize * (0.6 + twinkle * 0.5)
        const alpha = 0.25 + twinkle * 0.65

        if (star.baseSize > 1.0) {
          const gg = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size * 5)
          gg.addColorStop(0, star.hue > 0 ? `hsla(${star.hue},70%,65%,${alpha * 0.12})` : `rgba(255,255,255,${alpha * 0.08})`)
          gg.addColorStop(1, 'transparent')
          ctx.fillStyle = gg
          ctx.fillRect(drawX - size * 5, drawY - size * 5, size * 10, size * 10)
        }

        ctx.beginPath()
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2)
        ctx.fillStyle = star.hue > 0 ? `hsla(${star.hue},70%,75%,${alpha})` : `rgba(255,255,255,${alpha})`
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
        grad.addColorStop(1, `rgba(200,230,255,${s.life * 0.7})`)
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.stroke()
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,230,255,${s.life})`; ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(() => { fetchData() }, [])

  async function fetchInsights() {
    setInsightsLoading(true)
    try { const res = await api.get('/ai/insights'); setInsights(res.data.insights) }
    catch (err) { setInsights('Could not load insights right now.') }
    finally { setInsightsLoading(false) }
  }

  async function fetchData() {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([ api.get('/transactions/summary'), api.get('/transactions/') ])
      setSummary(summaryRes.data); setTransactions(transactionsRes.data)
    } catch (err) { if (err.response?.status === 401) navigate('/login') }
    finally { setLoading(false) }
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    try {
      await api.post('/transactions/', { ...formData, amount: parseFloat(formData.amount) })
      setFormData({ amount: '', type: 'income', category: '', description: '' })
      setShowForm(false); fetchData()
    } catch (err) { alert('Failed to add transaction') }
  }

  function handleLogout() {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

  if (loading) return (
    <>
      <style>{dashStyles}</style>
      <div className="loading-screen">
        <canvas ref={canvasRef} className="star-canvas" />
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    </>
  )

  return (
    <>
      <style>{dashStyles}</style>
      <div className="dashboard">
        <canvas ref={canvasRef} className="star-canvas" />

        <nav className="navbar">
          <div className="logo">💰 FinanceAI</div>
          <div className="nav-right">
            <p className="welcome">Hey, <span>{user?.name}</span> 👋</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="content">

          {/* Summary Cards */}
          <div className="cards">
            <div className="card">
              <p className="card-label">Total Income</p>
              <p className="card-amount income">₹{summary.total_income.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="card-label">Total Expenses</p>
              <p className="card-amount expense">₹{summary.total_expense.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="card-label">Balance</p>
              <p className="card-amount balance">₹{summary.balance.toFixed(2)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="card">
              <p className="card-label" style={{marginBottom: '1rem'}}>Expense Breakdown</p>
              <ExpensePieChart transactions={transactions} />
            </div>
            <div className="card">
              <p className="card-label" style={{marginBottom: '1rem'}}>Income vs Expenses</p>
              <IncomeExpenseBar summary={summary} />
            </div>
          </div>

          {/* Transactions */}
          <div className="section-header">
            <h2 className="section-title">Transactions</h2>
            <button className="action-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Transaction'}
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <form onSubmit={handleAddTransaction} className="form">
                <select className="input" value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input className="input" type="number" placeholder="Amount (₹)"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})} required />
                <input className="input" type="text" placeholder="Category (e.g. Food, Salary)"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})} required />
                <input className="input" type="text" placeholder="Description (optional)"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
                <button className="action-btn" type="submit">Save Transaction</button>
              </form>
            </div>
          )}

          <div className="list">
            {transactions.length === 0 ? (
              <div className="empty">No transactions yet. Add your first one! 🚀</div>
            ) : (
              transactions.map((t, i) => (
                <div key={t.id} className="transaction-item" style={{animationDelay: `${i * 0.05}s`}}>
                  <div className="transaction-left">
                    <span className="category">{t.category}</span>
                    {t.description && <span className="desc">{t.description}</span>}
                  </div>
                  <span className={`amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="divider" />

          {/* AI Insights */}
          <div className="section-header">
            <h2 className="section-title">🤖 AI Insights</h2>
            <button className="action-btn" onClick={fetchInsights} disabled={insightsLoading}>
              {insightsLoading ? 'Analyzing...' : 'Analyze My Spending'}
            </button>
          </div>

          {insights && (
            <div className="insights-card">
              <p className="insights-text">{insights}</p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #030306;
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .star-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .loading-screen {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #030306;
    position: relative;
  }

  .loading-text {
    position: relative;
    z-index: 1;
    color: rgba(255,255,255,0.4);
    font-size: 1rem;
  }

  .dashboard {
    min-height: 100vh;
    background: #030306;
    position: relative;
    overflow-x: hidden;
  }

  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    background: rgba(3,3,6,0.75);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideDown 0.5s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .logo {
    font-family: 'Sora', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    background: linear-gradient(90deg, #00d4ff, #00ff88);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .welcome {
    color: rgba(255,255,255,0.5);
    font-size: 0.95rem;
    font-weight: 400;
  }

  .welcome span {
    color: rgba(255,255,255,0.9);
    font-weight: 600;
  }

  .logout-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.6);
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .logout-btn:hover {
    background: rgba(255,80,80,0.1);
    color: #ff6b6b;
    border-color: rgba(255,80,80,0.3);
  }

  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    position: relative;
    z-index: 1;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .card {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease;
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0,212,255,0.15), transparent 50%, rgba(120,80,255,0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    border-color: rgba(0,212,255,0.15);
  }

  .card:hover::before { opacity: 1; }

  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.75rem;
  }

  .card-amount {
    font-family: 'Sora', sans-serif;
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .card-amount.income { color: #00ff88; }
  .card-amount.expense { color: #ff6b6b; }
  .card-amount.balance { color: #00d4ff; }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    margin-top: 0.5rem;
  }

  .section-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    letter-spacing: -0.01em;
  }

  .action-btn {
    padding: 0.65rem 1.4rem;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, #00d4ff, #00b4d8);
    color: #030306;
    font-weight: 700;
    font-size: 0.9rem;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 20px rgba(0,212,255,0.25);
    position: relative;
    overflow: hidden;
  }

  .action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .action-btn:hover::after { opacity: 1; }
  .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,212,255,0.35); }
  .action-btn:active { transform: translateY(0); }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .form-card {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    animation: fadeUp 0.3s ease;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .input {
    padding: 0.85rem 1.1rem;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.04);
    color: #fff;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.25s ease;
  }

  .input::placeholder { color: rgba(255,255,255,0.15); }

  .input:focus {
    border-color: rgba(0,212,255,0.4);
    background: rgba(0,212,255,0.05);
    box-shadow: 0 0 0 3px rgba(0,212,255,0.08);
  }

  .input option {
    background: #030306;
    color: #fff;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .transaction-item {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 18px;
    padding: 1.15rem 1.4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    animation: fadeUp 0.4s ease both;
  }

  .transaction-item:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(0,212,255,0.1);
    transform: translateX(6px);
  }

  .transaction-left {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .category {
    font-weight: 600;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.9);
  }

  .desc {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.35);
  }

  .amount {
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .amount.income { color: #00ff88; }
  .amount.expense { color: #ff6b6b; }

  .empty {
    backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    color: rgba(255,255,255,0.3);
    font-size: 0.95rem;
  }

  .insights-card {
    border-radius: 24px;
    padding: 1.75rem;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(120,80,255,0.06));
    border: 1px solid rgba(0,212,255,0.12);
    backdrop-filter: blur(30px);
    animation: fadeUp 0.4s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  .insights-text {
    color: rgba(255,255,255,0.85);
    line-height: 1.8;
    font-size: 0.92rem;
    white-space: pre-wrap;
    font-weight: 400;
  }

  .divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 1.5rem 0;
  }
`

export default Dashboard