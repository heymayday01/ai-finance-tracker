import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, leaving: false }])

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 350)
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column-reverse', gap: '0.6rem',
        zIndex: 9999, pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            padding: '0.85rem 1.25rem',
            background: toast.type === 'error' ? 'rgba(255,80,80,0.12)' :
                         toast.type === 'warning' ? 'rgba(255,180,50,0.12)' :
                         'rgba(0,212,255,0.12)',
            border: `1px solid ${
              toast.type === 'error' ? 'rgba(255,80,80,0.25)' :
              toast.type === 'warning' ? 'rgba(255,180,50,0.25)' :
              'rgba(0,212,255,0.25)'
            }`,
            borderRadius: '14px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: toast.type === 'error' ? '#ff6b6b' :
                   toast.type === 'warning' ? '#ffb432' :
                   '#00d4ff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
            animation: toast.leaving ? 'toastOut 0.35s ease forwards' : 'toastIn 0.35s ease forwards',
          }}>
            <span style={{ fontSize: '1.1rem' }}>
              {toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : '✓'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(40px) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
