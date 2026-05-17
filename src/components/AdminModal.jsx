import React, { useState } from 'react'
import { useMenu } from '../context/MenuContext.jsx'

const CATEGORIES = [
  { key: 'loklokSingles', label: '🍢 Loklok — Single Item' },
  { key: 'loklokCombos', label: '🔥 Loklok — Combos' },
  { key: 'buburItems', label: "🍚 AlaMeq D'Bubur" },
  { key: 'buburPromos', label: '🎉 Bubur — Promos' },
]

function AdminLogin({ onClose }) {
  const { login } = useMenu()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (login(password)) {
      setError(false)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center text-3xl">
        🔐
      </div>
      <h2 className="font-[Nunito] font-black text-2xl text-warm-brown mb-1">Admin Login</h2>
      <p className="font-[Inter] text-warm-brown-light/60 text-sm mb-6">Enter password to manage menu</p>

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

function AdminItemRow({ category, item }) {
  const { updateItem } = useMenu()
  const [editingName, setEditingName] = useState(false)
  const [editingPrice, setEditingPrice] = useState(false)
  const [nameVal, setNameVal] = useState(item.name)
  const [priceVal, setPriceVal] = useState(item.price)

  function saveName() {
    if (nameVal.trim()) updateItem(category, item.id, { name: nameVal.trim() })
    setEditingName(false)
  }

  function savePrice() {
    if (priceVal.trim()) updateItem(category, item.id, { price: priceVal.trim() })
    setEditingPrice(false)
  }

  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-all ${item.soldOut ? 'bg-warm-red/5' : 'bg-white/20'}`}>
      {/* Sold out toggle */}
      <button
        onClick={() => updateItem(category, item.id, { soldOut: !item.soldOut })}
        className={`shrink-0 w-9 h-5 rounded-full relative transition-all duration-300 ${item.soldOut ? 'bg-warm-red' : 'bg-warm-gold/30'}`}
        title={item.soldOut ? 'Mark available' : 'Mark sold out'}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${item.soldOut ? 'left-[18px]' : 'left-0.5'}`} />
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editingName ? (
          <input
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            autoFocus
            className="w-full px-2 py-1 rounded-lg bg-white/50 border border-warm-gold/30 font-[Inter] text-warm-brown text-xs focus:outline-none focus:ring-1 focus:ring-warm-gold/40"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className={`font-[Inter] text-xs text-left truncate w-full hover:text-warm-gold transition-colors ${item.soldOut ? 'text-warm-brown/40 line-through' : 'text-warm-brown'}`}
          >
            {item.name}
          </button>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0">
        {editingPrice ? (
          <input
            value={priceVal}
            onChange={(e) => setPriceVal(e.target.value)}
            onBlur={savePrice}
            onKeyDown={(e) => e.key === 'Enter' && savePrice()}
            autoFocus
            className="w-20 px-2 py-1 rounded-lg bg-white/50 border border-warm-gold/30 font-[Fredoka] text-warm-brown text-xs focus:outline-none focus:ring-1 focus:ring-warm-gold/40 text-right"
          />
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className={`font-[Fredoka] font-bold text-xs hover:text-warm-gold transition-colors ${item.soldOut ? 'text-warm-brown/40' : 'text-warm-red'}`}
          >
            {item.price}
          </button>
        )}
      </div>
    </div>
  )
}

function AdminPanel({ onClose, onNavigate }) {
  const { menuData, logout, resetToDefaults } = useMenu()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sticky top-0 bg-peach-100/90 backdrop-blur-sm py-2 -mx-1 px-1 z-10">
        <h2 className="font-[Nunito] font-black text-xl text-warm-brown">⚙️ Menu Manager</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { logout(); onClose() }}
            className="px-3 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-brown/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Worker report link */}
      <button
        onClick={() => { onClose(); onNavigate && onNavigate('report') }}
        className="w-full mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-warm-brown/90 to-warm-brown-light/90 text-white font-[Fredoka] font-bold text-sm tracking-wide hover:from-warm-brown hover:to-warm-brown-light active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
      >
        📋 Daily Sales Report
      </button>

      {/* Instructions */}
      <div className="mb-4 p-3 rounded-xl bg-warm-gold/10 border border-warm-gold/20">
        <p className="font-[Inter] text-warm-brown/70 text-xs leading-relaxed">
          <strong>Tap name/price</strong> to edit inline. Use the <strong>toggle</strong> to mark items as <span className="text-warm-red font-semibold">Sold Out</span>.
          Changes save automatically.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-5">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <h3 className="font-[Fredoka] font-semibold text-warm-brown text-sm mb-2">{label}</h3>
            <div className="space-y-1.5">
              {menuData[key].map((item) => (
                <AdminItemRow key={item.id} category={key} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="mt-6 pt-4 border-t border-warm-brown/10">
        {showResetConfirm ? (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-[Inter] text-warm-brown text-xs">Are you sure?</span>
            <button
              onClick={() => { resetToDefaults(); setShowResetConfirm(false) }}
              className="px-3 py-1.5 rounded-lg bg-warm-red text-white font-[Fredoka] text-xs hover:bg-warm-red-dark transition-colors"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-brown/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full px-4 py-2 rounded-xl bg-warm-brown/5 font-[Fredoka] text-warm-brown/50 text-xs hover:bg-warm-brown/10 hover:text-warm-brown/70 transition-all"
          >
            🔄 Reset all to defaults
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminModal({ onClose, onNavigate }) {
  const { isAdmin } = useMenu()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-warm-brown/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative w-full max-w-md bg-peach-100/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-warm-brown/20 border border-white/30 p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-warm-brown/50 hover:bg-warm-brown/20 hover:text-warm-brown transition-all"
        >
          ✕
        </button>

        {isAdmin ? <AdminPanel onClose={onClose} onNavigate={onNavigate} /> : <AdminLogin onClose={onClose} />}
      </div>
    </div>
  )
}
