import React, { useState, useEffect } from 'react'
import { useMenu } from '../context/MenuContext.jsx'

function AdminLogin({ onClose, onNavigate }) {
  const { login } = useMenu()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (login(password)) {
      setError(false)
      onClose()
      if (onNavigate) onNavigate('admin')
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center text-3xl animate-float">
        🔐
      </div>
      <h2 className="font-[Nunito] font-black text-2xl text-warm-brown mb-1">Admin Login</h2>
      <p className="font-[Inter] text-warm-brown-light/60 text-sm mb-6">Enter password to proceed to admin page</p>

      <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'animate-wiggle' : ''}`}>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/40 font-[Inter] text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40 focus:border-warm-gold/40 transition-all"
        />
        {error && (
          <p className="font-[Fredoka] text-warm-red text-xs">Wrong password, try again</p>
        )}
        <button
          type="submit"
          className="w-full px-4 py-3 rounded-xl bg-warm-brown text-white font-[Fredoka] font-bold text-sm tracking-wide hover:bg-warm-brown-light active:scale-95 transition-all duration-200"
        >
          Login
        </button>
      </form>

      <button onClick={onClose} className="mt-4 font-[Inter] text-warm-brown/40 text-xs hover:text-warm-brown/60 transition-colors">
        Cancel
      </button>
    </div>
  )
}

export default function AdminModal({ onClose, onNavigate }) {
  const { isAdmin } = useMenu()

  // Redirect to admin page immediately if they are already logged in
  useEffect(() => {
    if (isAdmin) {
      onClose()
      if (onNavigate) onNavigate('admin')
    }
  }, [isAdmin, onClose, onNavigate])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-warm-brown/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative w-full max-w-sm bg-peach-100/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-warm-brown/20 border border-white/30 p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-warm-brown/50 hover:bg-warm-brown/20 hover:text-warm-brown transition-all"
        >
          ✕
        </button>

        <AdminLogin onClose={onClose} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
