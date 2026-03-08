import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Dashboard() {
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

  async function fetchData() {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/')
      ])
      setSummary(summaryRes.data)
      setTransactions(transactionsRes.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      }
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

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>💰 Finance Tracker</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hey, {user?.name} 👋</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Summary Cards */}
        <div style={styles.cards}>
          <div style={{...styles.card, borderTop: '4px solid #10b981'}}>
            <p style={styles.cardLabel}>Total Income</p>
            <p style={{...styles.cardAmount, color: '#10b981'}}>₹{summary.total_income.toFixed(2)}</p>
          </div>
          <div style={{...styles.card, borderTop: '4px solid #ef4444'}}>
            <p style={styles.cardLabel}>Total Expenses</p>
            <p style={{...styles.cardAmount, color: '#ef4444'}}>₹{summary.total_expense.toFixed(2)}</p>
          </div>
          <div style={{...styles.card, borderTop: '4px solid #4f46e5'}}>
            <p style={styles.cardLabel}>Balance</p>
            <p style={{...styles.cardAmount, color: '#4f46e5'}}>₹{summary.balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction Button */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Transactions</h2>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <div style={styles.formCard}>
            <form onSubmit={handleAddTransaction} style={styles.form}>
              <select
                style={styles.input}
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input
                style={styles.input}
                type="number"
                placeholder="Amount (₹)"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Category (e.g. Food, Salary)"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <button style={styles.addBtn} type="submit">Save Transaction</button>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div style={styles.list}>
          {transactions.length === 0 ? (
            <div style={styles.empty}>No transactions yet. Add your first one!</div>
          ) : (
            transactions.map(t => (
              <div key={t.id} style={styles.transactionItem}>
                <div style={styles.transactionLeft}>
                  <span style={styles.category}>{t.category}</span>
                  <span style={styles.description}>{t.description}</span>
                </div>
                <span style={{
                  ...styles.amount,
                  color: t.type === 'income' ? '#10b981' : '#ef4444'
                }}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: {
    background: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  logo: { fontSize: '1.4rem', color: '#4f46e5' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcome: { color: '#666', fontSize: '0.95rem' },
  logoutBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: 'white',
    color: '#666',
    fontSize: '0.9rem'
  },
  content: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  cardLabel: { color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' },
  cardAmount: { fontSize: '1.8rem', fontWeight: '700' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600' },
  addBtn: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#4f46e5',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  formCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  empty: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#888'
  },
  transactionItem: {
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  transactionLeft: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  category: { fontWeight: '600', fontSize: '0.95rem' },
  description: { color: '#888', fontSize: '0.85rem' },
  amount: { fontSize: '1.1rem', fontWeight: '700' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem' }
}

export default Dashboard