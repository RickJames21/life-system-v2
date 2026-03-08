import { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Global toast manager
type ToastFn = (msg: string) => void
let _showToast: ToastFn = () => {}

export function showToast(msg: string) {
  _showToast(msg)
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const show: ToastFn = useCallback((msg) => {
    setMessage(msg)
    setKey((k) => k + 1)
  }, [])

  useEffect(() => {
    _showToast = show
    return () => { _showToast = () => {} }
  }, [show])

  useEffect(() => {
    if (message) {
      const id = setTimeout(() => setMessage(null), 2400)
      return () => clearTimeout(id)
    }
  }, [key, message])

  const root = document.getElementById('toast-root')
  if (!root) return null

  return ReactDOM.createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            bottom: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2a2e32',
            color: 'var(--text-primary)',
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 12,
            border: '1px solid var(--border)',
            pointerEvents: 'none',
            zIndex: 400,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>,
    root
  )
}
