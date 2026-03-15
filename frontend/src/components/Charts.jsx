import { memo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6366f1', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10,10,15,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        fontSize: '0.85rem',
        color: '#fff'
      }}>
        <p>{payload[0].name}: <strong>₹{payload[0].value.toFixed(2)}</strong></p>
      </div>
    )
  }
  return null
}

export const ExpensePieChart = memo(function ExpensePieChart({ transactions }) {
  const data = {}
  transactions.forEach(t => {
    if (t.type === 'expense') {
      data[t.category] = (data[t.category] || 0) + t.amount
    }
  })

  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }))

  if (chartData.length === 0) return (
    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem', fontSize: '0.9rem' }}>
      No expenses to display yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
          paddingAngle={4} dataKey="value">
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
})

export const IncomeExpenseBar = memo(function IncomeExpenseBar({ summary }) {
  const data = [
    { name: 'Income', value: summary.total_income, fill: '#34d399' },
    { name: 'Expenses', value: summary.total_expense, fill: '#f87171' },
    { name: 'Balance', value: summary.balance, fill: '#818cf8' },
  ]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={40}>
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${v}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})