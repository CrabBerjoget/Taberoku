import React, { useState } from 'react'
import { useMenu } from '../context/MenuContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function ComboPickerModal({ combo, onClose }) {
  const { menuData } = useMenu()
  const { addCombo } = useCart()
  const availableItems = menuData.loklokSingles.filter((item) => !item.soldOut && !item.comingSoon)
  const maxPicks = combo.maxPicks || 6

  const closingSalesActive = menuData?.closingSales || false
  const hasPromoPrice = closingSalesActive && combo.closingPrice && combo.closingPrice.trim() !== ''
  const activePrice = hasPromoPrice ? combo.closingPrice : combo.price

  // picks: { [itemId]: qty }
  const [picks, setPicks] = useState({})
  const totalPicked = Object.values(picks).reduce((s, v) => s + v, 0)
  const remaining = maxPicks - totalPicked

  function addPick(id) {
    if (totalPicked >= maxPicks) return
    setPicks((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function removePick(id) {
    setPicks((prev) => {
      const current = prev[id] || 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: current - 1 }
    })
  }

  function handleConfirm() {
    // Build sub-items list
    const subItems = []
    availableItems.forEach((item) => {
      const qty = picks[item.id] || 0
      for (let i = 0; i < qty; i++) {
        subItems.push(item.name)
      }
    })
    if (combo.includesBubur) {
      subItems.push('Bubur Ayam')
    }
    addCombo(combo.id, combo.name, activePrice, subItems)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-warm-brown/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-peach-100/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-warm-brown/20 border border-white/30 p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-warm-brown/50 hover:bg-warm-brown/20 hover:text-warm-brown transition-all text-sm"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-warm-gold/15 flex items-center justify-center text-2xl">
            🍢
          </div>
          <h3 className="font-[Nunito] font-black text-lg text-warm-brown">{combo.name}</h3>
          {hasPromoPrice ? (
            <p className="font-[Fredoka] font-bold text-sm">
              <span className="line-through text-warm-brown/40 mr-1.5 font-normal text-xs">{combo.price}</span>
              <span className="text-warm-red">🌙 {activePrice}</span>
            </p>
          ) : (
            <p className="font-[Fredoka] text-warm-red font-bold text-sm">{combo.price}</p>
          )}
          {combo.includesBubur && (
            <p className="font-[Caveat] text-warm-brown-light/60 text-sm mt-1">
              Includes Bubur Ayam 🍚
            </p>
          )}
        </div>

        {/* Pick counter */}
        <div className={`text-center mb-4 p-2 rounded-xl transition-colors ${remaining === 0 ? 'bg-green-100/50 border border-green-300/30' : 'bg-warm-gold/10 border border-warm-gold/20'}`}>
          <p className="font-[Fredoka] text-sm">
            {remaining === 0 ? (
              <span className="text-green-700 font-bold">✅ All {maxPicks} items selected!</span>
            ) : (
              <>
                <span className="text-warm-brown">Pick </span>
                <span className="text-warm-red font-bold text-base">{remaining}</span>
                <span className="text-warm-brown"> more item{remaining !== 1 ? 's' : ''}</span>
              </>
            )}
          </p>
        </div>

        {/* Items list */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {availableItems.map((item) => {
            const qty = picks[item.id] || 0
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  qty > 0 ? 'bg-warm-gold/15 border border-warm-gold/30' : 'bg-white/30 border border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${qty > 0 ? 'bg-warm-red' : 'bg-warm-gold/40'}`} />
                  <span className="font-[Inter] text-warm-brown text-sm font-medium">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => removePick(item.id)}
                    disabled={qty === 0}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all select-none ${
                      qty > 0 ? 'bg-warm-red/15 text-warm-red hover:bg-warm-red/25 active:scale-90' : 'bg-warm-brown/5 text-warm-brown/20'
                    }`}
                  >
                    −
                  </button>
                  <span className={`w-5 text-center font-[Fredoka] font-bold text-sm ${qty > 0 ? 'text-warm-brown' : 'text-warm-brown/20'}`}>
                    {qty}
                  </span>
                  <button
                    onClick={() => addPick(item.id)}
                    disabled={remaining === 0}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all select-none ${
                      remaining > 0 ? 'bg-warm-gold/20 text-warm-gold hover:bg-warm-gold/35 active:scale-90' : 'bg-warm-brown/5 text-warm-brown/15'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={totalPicked === 0}
          className={`w-full mt-4 px-4 py-3 rounded-xl font-[Fredoka] font-bold text-sm tracking-wide transition-all duration-200 ${
            totalPicked > 0
              ? 'bg-warm-brown text-white hover:bg-warm-brown-light active:scale-95'
              : 'bg-warm-brown/10 text-warm-brown/30 cursor-not-allowed'
          }`}
        >
          {totalPicked === 0
            ? 'Select your items above'
            : totalPicked < maxPicks
              ? `Add to order (${totalPicked}/${maxPicks} picked)`
              : `Add to order ✓`}
        </button>
      </div>
    </div>
  )
}
