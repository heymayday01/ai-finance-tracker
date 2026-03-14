import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { ExpensePieChart, IncomeExpenseBar } from '../components/Charts'
import AnimatedCounter from '../components/AnimatedCounter'
import Skeleton from '../components/Skeleton'
import ConfettiBurst from '../components/ConfettiBurst'
import { useToast } from '../components/Toast'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'

function Dashboard() {
  const toast = useToast()
  const [insights, setInsights] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '', type: 'income', category: '', description: ''
  })
  const [confettiKey, setConfettiKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, w = window.innerWidth, h = window.innerHeight
    canvas.width = w; canvas.height = h

    const stars = []
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        baseSize: Math.random() * 1.6 + 0.3,
        hue: Math.random() > 0.75 ? (Math.random() * 60 + 180) : 0,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        ox: 0, oy: 0,
      })
    }

    const shootingStars = []
    function spawnSS() {
      if (shootingStars.length < 2 && Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * w, y: Math.random() * h * 0.4,
          vx: (Math.random() * 5 + 3) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 2.5 + 1.5, life: 1,
          length: Math.random() * 50 + 30,
        })
      }
    }

    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)

    let time = 0
    function animate() {
      time++
      ctx.clearRect(0, 0, w, h)
      const mx = mouseRef.current.x, my = mouseRef.current.y

      const ng = ctx.createRadialGradient(mx, my, 0, mx, my, 300)
      ng.addColorStop(0, 'rgba(0,212,255,0.08)')
      ng.addColorStop(0.5, 'rgba(120,80,255,0.03)')
      ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng; ctx.fillRect(0, 0, w, h)

      for (const s of stars) {
        const dx = s.x - mx, dy = s.y - my, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180) { const f = (1 - dist / 180) * 10; s.ox += (dx / dist) * f * 0.06; s.oy += (dy / dist) * f * 0.06 }
        s.ox *= 0.93; s.oy *= 0.93
        const drawX = s.x + s.ox, drawY = s.y + s.oy
        const tw = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5
        const sz = s.baseSize * (0.6 + tw * 0.5), al = 0.25 + tw * 0.65

        if (s.baseSize > 1.0) {
          const gg = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, sz * 5)
          gg.addColorStop(0, s.hue > 0 ? `hsla(${s.hue},70%,65%,${al * 0.12})` : `rgba(255,255,255,${al * 0.08})`)
          gg.addColorStop(1, 'transparent')
          ctx.fillStyle = gg; ctx.fillRect(drawX - sz * 5, drawY - sz * 5, sz * 10, sz * 10)
        }
        ctx.beginPath(); ctx.arc(drawX, drawY, sz, 0, Math.PI * 2)
        ctx.fillStyle = s.hue > 0 ? `hsla(${s.hue},70%,75%,${al})` : `rgba(255,255,255,${al})`; ctx.fill()
      }

      spawnSS()
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i]
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.012
        if (ss.life <= 0 || ss.x < -100 || ss.x > w + 100 || ss.y > h + 100) { shootingStars.splice(i, 1); continue }
        const tx = ss.x - ss.vx * (ss.length / 8), ty = ss.y - ss.vy * (ss.length / 8)
        const g = ctx.createLinearGradient(tx, ty, ss.x, ss.y)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(200,230,255,${ss.life * 0.7})`)
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ss.x, ss.y); ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke()
        ctx.beginPath(); ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(200,230,255,${ss.life})`; ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('resize', onResize) }
  }, [])

  useEffect(() => { fetchData() }, [])

  async function fetchInsights() {
    setInsightsLoading(true)
    try { const res = await api.get('/ai/insights'); setInsights(res.data.insights); toast('AI insights generated!') }
    catch { setInsights('Could not load insights right now.'); toast('Failed to load insights', 'error') }
    finally { setInsightsLoading(false) }
  }

  async function fetchData() {
    try {
      const [sRes, tRes] = await Promise.all([api.get('/transactions/summary'), api.get('/transactions/')])
      setSummary(sRes.data); setTransactions(tRes.data)
    } catch (err) { if (err.response?.status === 401) navigate('/login') }
    finally { setLoading(false) }
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    try {
      await api.post('/transactions/', { ...formData, amount: parseFloat(formData.amount) })
      setFormData({ amount: '', type: 'income', category: '', description: '' })
      setShowForm(false)
      setConfettiKey(prev => prev + 1)
      toast('Transaction added successfully! 🎉')
      fetchData()
    } catch { toast('Failed to add transaction', 'error') }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/transactions/${id}`)
      toast('Transaction deleted')
      fetchData()
    } catch { toast('Failed to delete transaction', 'error') }
  }

  function handleLogout() {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

  // Filtering
  const filtered = transactions.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <Skeleton />
    </>
  )

  return (
    <>
      <style>{dashStyles}</style>
      <ConfettiBurst trigger={confettiKey} />
      <div className="dashboard">
        
        {/* Dynamic Liquid Background Blobs */}
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
        <div className="ambient-blob blob-3"></div>
        
        <canvas ref={canvasRef} className="star-canvas" />

        <nav className="navbar">
          <div className="logo">💰 FinanceAI</div>
          <div className="nav-right">
            <p className="welcome">Hey, <span>{user?.name}</span> 👋</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="content">
          {/* Summary Cards with Animated Counters */}
          <div className="cards">
            <div className="card">
              <p className="card-label">Total Income</p>
              <p className="card-amount income">
                <AnimatedCounter value={summary.total_income} prefix="₹" />
              </p>
            </div>
            <div className="card">
              <p className="card-label">Total Expenses</p>
              <p className="card-amount expense">
                <AnimatedCounter value={summary.total_expense} prefix="₹" />
              </p>
            </div>
            <div className="card">
              <p className="card-label">Balance</p>
              <p className="card-amount balance">
                <AnimatedCounter value={summary.balance} prefix="₹" />
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="card chart-card">
              <p className="card-label" style={{marginBottom:'1rem'}}>Expense Breakdown</p>
              <ExpensePieChart transactions={transactions} />
            </div>
            <div className="card chart-card">
              <p className="card-label" style={{marginBottom:'1rem'}}>Income vs Expenses</p>
              <IncomeExpenseBar summary={summary} />
            </div>
          </div>

          {/* Transactions Header */}
          <div className="section-header">
            <h2 className="section-title">Transactions</h2>
            <button className="action-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Transaction'}
            </button>
          </div>

          {/* Add Transaction Form */}
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

          {/* Search & Filters */}
          <div className="filter-bar">
            <input className="search-input" type="text" placeholder="🔍  Search transactions..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div className="filter-pills">
              {['all', 'income', 'expense'].map(t => (
                <button key={t}
                  className={`filter-pill ${filterType === t ? 'active' : ''}`}
                  onClick={() => setFilterType(t)}>
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="list">
            {filtered.length === 0 ? (
              <div className="empty card">
                {transactions.length === 0 ? 'No transactions yet. Add your first one! 🚀' : 'No transactions match your search.'}
              </div>
            ) : (
              filtered.map((t, i) => (
                <div key={t.id} className="transaction-item" style={{animationDelay: `${i * 0.04}s`}}>
                  <div className="transaction-left">
                    <span className="category">{t.category}</span>
                    <div className="transaction-meta">
                      {t.description && <span className="desc">{t.description}</span>}
                      <span className="timestamp">
                        {formatDistanceToNow(new Date(t.date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <span className={`amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </span>
                    <button className="delete-btn" onClick={() => handleDelete(t.id)} title="Delete">
                      🗑
                    </button>
                  </div>
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
              <div className="insights-text">
                <ReactMarkdown>{insights}</ReactMarkdown>
              </div>
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

  /* Dynamic Liquid Blobs */
  .ambient-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    z-index: 0;
    opacity: 0.55;
    animation: float 25s infinite ease-in-out alternate;
    pointer-events: none;
  }

  .blob-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0,212,255,0.45), transparent 70%);
    top: -100px;
    left: -150px;
    animation-delay: 0s;
  }

  .blob-2 {
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(120,80,255,0.4), transparent 70%);
    bottom: -100px;
    right: -100px;
    animation-delay: -5s;
    animation-direction: alternate-reverse;
  }

  .blob-3 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0,255,136,0.25), transparent 70%);
    top: 40%;
    left: 45%;
    animation-duration: 35s;
    animation-delay: -10s;
  }

  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(60px, -40px) scale(1.1); }
    66% { transform: translate(-40px, 40px) scale(0.9); }
    100% { transform: translate(0, 0) scale(1); }
  }

  .star-canvas {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .dashboard {
    min-height: 100vh;
    background: #030306;
    position: relative;
    overflow-x: hidden;
  }

  /* Pure Liquid Glass Navbar */
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    background: rgba(3, 3, 6, 0.4);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
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
    filter: drop-shadow(0 0 8px rgba(0,212,255,0.3));
  }

  .nav-right { display: flex; align-items: center; gap: 1.5rem; }
  .welcome { color: rgba(255,255,255,0.6); font-size: 0.95rem; font-weight: 400; }
  .welcome span { color: rgba(255,255,255,1); font-weight: 600; text-shadow: 0 0 10px rgba(255,255,255,0.2); }

  .logout-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(10px);
  }

  .logout-btn:hover {
    background: rgba(255,80,80,0.15);
    color: #ff6b6b;
    border-color: rgba(255,80,80,0.4);
    box-shadow: 0 0 15px rgba(255,80,80,0.2);
  }

  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    position: relative;
    z-index: 2;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }

  /* Enhanced Liquid Glassmorphism Cards */
  .card {
    backdrop-filter: blur(50px) saturate(200%);
    -webkit-backdrop-filter: blur(50px) saturate(200%);
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.15), 
      inset 0 -1px 1px rgba(0,0,0,0.2), 
      0 20px 40px rgba(0,0,0,0.4),
      0 0 0 1px rgba(255,255,255,0.05);
    border-radius: 28px;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.4s ease;
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }

  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 50%);
    mix-blend-mode: overlay;
  }

  .card:hover { 
    transform: translateY(-5px); 
    border-color: rgba(255,255,255,0.25);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.2), 
      inset 0 -1px 1px rgba(0,0,0,0.2), 
      0 25px 50px rgba(0,0,0,0.5),
      0 0 20px rgba(0,212,255,0.1);
  }

  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }

  .card-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.5);
    margin-bottom: 0.75rem;
  }

  .card-amount {
    font-family: 'Sora', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }

  .card-amount.income { color: #00ff88; filter: drop-shadow(0 0 10px rgba(0,255,136,0.2)); }
  .card-amount.expense { color: #ff6b6b; filter: drop-shadow(0 0 10px rgba(255,107,107,0.2)); }
  .card-amount.balance { color: #00d4ff; filter: drop-shadow(0 0 10px rgba(0,212,255,0.2)); }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .chart-card {
    padding: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    margin-top: 1rem;
  }

  .section-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  }

  .action-btn {
    padding: 0.7rem 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.2);
    background: linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,180,216,0.9));
    color: #030306;
    font-weight: 700;
    font-size: 0.9rem;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 8px 24px rgba(0,212,255,0.3), inset 0 1px 1px rgba(255,255,255,0.5);
    position: relative;
    overflow: hidden;
  }

  .action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .action-btn:hover::after { opacity: 1; }
  .action-btn:hover { 
    transform: translateY(-3px) scale(1.02); 
    box-shadow: 0 12px 30px rgba(0,212,255,0.4), inset 0 1px 1px rgba(255,255,255,0.6); 
  }
  .action-btn:active { transform: translateY(0) scale(0.98); }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: grayscale(1); }

  .form-card {
    backdrop-filter: blur(50px) saturate(200%);
    -webkit-backdrop-filter: blur(50px) saturate(200%);
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5);
    border-radius: 28px;
    padding: 1.75rem;
    margin-bottom: 2rem;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1);
  }

  .form { display: flex; flex-direction: column; gap: 1rem; }

  .input {
    padding: 0.9rem 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
    color: #fff;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
  .input::placeholder { color: rgba(255,255,255,0.3); }
  .input:focus {
    border-color: rgba(0,212,255,0.6);
    background: rgba(0,212,255,0.05);
    box-shadow: 0 0 0 3px rgba(0,212,255,0.15), inset 0 1px 2px rgba(0,0,0,0.2);
  }
  .input option { background: #0b0b12; color: #fff; padding: 10px; }

  /* Search & Filter */
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 250px;
    padding: 0.9rem 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
    color: #fff;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
  .search-input::placeholder { color: rgba(255,255,255,0.3); }
  .search-input:focus {
    border-color: rgba(0,212,255,0.5);
    background: rgba(0,0,0,0.4);
    box-shadow: 0 0 0 3px rgba(0,212,255,0.1), inset 0 1px 2px rgba(0,0,0,0.3);
  }

  .filter-pills { display: flex; gap: 0.5rem; }

  .filter-pill {
    padding: 0.6rem 1.25rem;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    backdrop-filter: blur(10px);
  }

  .filter-pill:hover {
    border-color: rgba(255,255,255,0.3);
    color: rgba(255,255,255,1);
    background: rgba(255,255,255,0.1);
  }

  .filter-pill.active {
    background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05));
    border-color: rgba(0,212,255,0.5);
    color: #00d4ff;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0,212,255,0.15);
  }

  .list { display: flex; flex-direction: column; gap: 0.75rem; }

  .transaction-item {
    backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
    background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    animation: fadeUp 0.4s ease both;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  .transaction-item:hover {
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    border-color: rgba(0,212,255,0.2);
    transform: translateX(8px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3), inset 1px 0 0 rgba(0,212,255,0.5);
  }

  .transaction-left { display: flex; flex-direction: column; gap: 0.2rem; }

  .category { font-weight: 600; font-size: 1rem; color: rgba(255,255,255,0.95); text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

  .transaction-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .desc { font-size: 0.85rem; color: rgba(255,255,255,0.5); }

  .timestamp {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    font-style: italic;
  }

  .transaction-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .amount {
    font-family: 'Sora', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  .amount.income { color: #00ff88; }
  .amount.expense { color: #ff6b6b; }

  .delete-btn {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.45rem 0.6rem;
    opacity: 0.3;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    backdrop-filter: blur(5px);
  }

  .transaction-item:hover .delete-btn {
    opacity: 0.6;
  }

  .delete-btn:hover {
    opacity: 1 !important;
    background: rgba(255,80,80,0.15);
    border-color: rgba(255,80,80,0.4);
    box-shadow: 0 0 15px rgba(255,80,80,0.2);
    transform: scale(1.1);
  }

  .empty {
    text-align: center;
    color: rgba(255,255,255,0.4);
    font-size: 1rem;
    font-weight: 500;
    padding: 4rem 2rem;
  }

  .insights-card {
    border-radius: 28px;
    padding: 2rem;
    margin-top: 1rem;
    background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(120,80,255,0.08));
    border: 1px solid rgba(0,212,255,0.2);
    backdrop-filter: blur(50px) saturate(200%);
    -webkit-backdrop-filter: blur(50px) saturate(200%);
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.15), 0 20px 40px rgba(0,0,0,0.4);
  }

  .insights-text {
    color: rgba(255,255,255,0.9);
    line-height: 1.8;
    font-size: 0.95rem;
    font-weight: 400;
  }

  .insights-text h1, .insights-text h2, .insights-text h3 {
    font-family: 'Sora', sans-serif;
    color: #00d4ff;
    margin: 1.25rem 0 0.75rem;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0,212,255,0.3);
  }

  .insights-text h1 { font-size: 1.3rem; }
  .insights-text h2 { font-size: 1.15rem; }
  .insights-text h3 { font-size: 1rem; }

  .insights-text strong { color: #fff; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }

  .insights-text ul, .insights-text ol {
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }

  .insights-text li { margin-bottom: 0.4rem; }
  .insights-text p { margin-bottom: 0.75rem; }

  .insights-text code {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #00ff88;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    margin: 2.5rem 0;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .cards { grid-template-columns: 1fr; }
    .chart-grid { grid-template-columns: 1fr; }
    .navbar { padding: 1rem 1.5rem; }
    .content { padding: 2rem 1.25rem; }
    .section-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .filter-bar { flex-direction: column; align-items: stretch; }
    .search-input { min-width: unset; width: 100%; }
    .filter-pills { justify-content: space-between; }
    .filter-pill { text-align: center; flex: 1; }
    .card-amount { font-size: 1.75rem; }
  }

  @media (max-width: 480px) {
    .logo { font-size: 1.2rem; }
    .nav-right { gap: 1rem; }
    .welcome { display: none; }
    .card { padding: 1.5rem; border-radius: 20px; }
    .transaction-item { padding: 1.25rem; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    .transaction-right { align-self: flex-start; width: 100%; justify-content: space-between; }
    .delete-btn { opacity: 0.6; }
  }
`

export default Dashboard