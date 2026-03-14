import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} style={{ animation: 'pageIn 0.4s ease' }}>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App