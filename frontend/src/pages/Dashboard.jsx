import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  .dashboard {
    min-height: 100vh;
    background: #0a0a0f;
    position: relative;
    overflow-x: hidden;
  }

  .bg-orb-1 {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
    top: -200px;
    left: -200px;
    pointer-events: none;
    z-index: 0;
  }

  .bg-orb-2 {
    position: fixed;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
    bottom: -150px;
    right: -150px;
    pointer-events: none;
    z-index: 0;
  }

  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(10,10,15,0.8);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1rem 2rem;
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
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #818cf8, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .welcome {
    color: rgba(255,255,255,0.5);
    font-size: 0.9rem;
    font-weight: 400;
  }

  .welcome span {
    color: rgba(255,255,255,0.9);
    font-weight: 600;
  }

  .logout-btn {
    padding: 0.45rem 1.1rem;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    font-size: 0.85rem;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border-color: rgba(255,255,255,0.2);
  }

  .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 1;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 1.5rem;
    transition: transform 0.2s ease, border-color 0.2s ease;
    animation: fadeUp 0.6s ease both;
  }

  .card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.15);
  }

  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-label {
    font-size: 0.78rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.75rem;
  }

  .card-amount {
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .card-amount.income { color: #34d399; }
  .card-amount.expense { color: #f87171; }
  .card-amount.balance { color: #818cf8; }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    margin-top: 0.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.02em;
  }

  .add-btn {
    padding: 0.55rem 1.2rem;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(99,102,241,0.3);
  }

  .add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
  }

  .add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .form-card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
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
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    color: #fff;
    font-size: 0.95rem;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.08);
  }

  .input option {
    background: #1a1a2e;
    color: #fff;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .transaction-item {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    animation: fadeUp 0.4s ease both;
  }

  .transaction-item:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
    transform: translateX(4px);
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

  .description {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.35);
  }

  .amount {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .amount.income { color: #34d399; }
  .amount.expense { color: #f87171; }

  .empty {
    backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    color: rgba(255,255,255,0.3);
    font-size: 0.9rem;
  }

  .insights-card {
    border-radius: 20px;
    padding: 1.5rem;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
    border: 1px solid rgba(99,102,241,0.3);
    backdrop-filter: blur(20px);
    animation: fadeUp 0.4s ease;
  }

  .insights-text {
    color: rgba(255,255,255,0.85);
    line-height: 1.8;
    font-size: 0.92rem;
    white-space: pre-wrap;
    font-weight: 400;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-size: 1rem;
    color: rgba(255,255,255,0.4);
    background: #0a0a0f;
  }

  .divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 1.5rem 0;
  }
`

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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchInsights() {
    setInsightsLoading(true)
    try {
      const res = await api.get('/ai/insights')
      setInsights(res.data.insights)
    } catch (err) {
      setInsights('Could not load insights right now.')
    } finally {
      setInsightsLoading(false)
    }
  }

  async function fetchData() {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/')
      ])
      setSummary(summaryRes.data)
      setTransactions(transactionsRes.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    try {
      await api.post('/transactions/', {
        ...formData,
        amount: parseFloat(formData.amount)
      })
      setFormData({ amount: '', type: 'income', category: '', description: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      alert('Failed to add transaction')
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="loading">Loading your dashboard...</div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />

        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">💰 Finance Tracker</div>
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

          {/* Transactions */}
          <div className="section-header">
            <h2 className="section-title">Transactions</h2>
            <button className="add-btn" onClick={() => setShowForm(!showForm)}>
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
                <button className="add-btn" type="submit">Save Transaction</button>
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
                    {t.description && <span className="description">{t.description}</span>}
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
            <button className="add-btn" onClick={fetchInsights} disabled={insightsLoading}>
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

export default Dashboard