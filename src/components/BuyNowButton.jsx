import React, { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useMenu } from '../context/MenuContext.jsx'

const PHONE = '601110547597'

export default function BuyNowButton() {
  const { cartItems, totalItems, totalPrice, getQty, addItem } = useCart()
  const { menuData } = useMenu()
  const [showSoupPrompt, setShowSoupPrompt] = useState(false)

  if (totalItems === 0) return null

  const hasSoup = getQty('soup') > 0
  const soupItem = menuData.loklokSingles.find((i) => i.id === 'soup')
  const soupSoldOut = soupItem?.soldOut ?? true

  const closingSalesActive = menuData?.closingSales || false

  function buildMessage() {
    let msg = closingSalesActive ? '🍢 *Tabelok Order* (Late Night Sale 🌙)\n\n' : '🍢 *Tabelok Order*\n\n'
    cartItems.forEach((item) => {
      msg += `• ${item.name} × ${item.qty}  (${item.price} each)\n`
      if (item.combos && item.combos.length > 0) {
        item.combos.forEach((subItems, i) => {
          msg += `   Set ${i + 1}: ${subItems.join(', ')}\n`
        })
      }
    })
    msg += `\n📦 Total items: ${totalItems}`
    msg += `\n💰 *Total: RM${totalPrice.toFixed(2)}*`
    return msg
  }

  function openWhatsApp() {
    const text = encodeURIComponent(buildMessage())
    window.open(`https://api.whatsapp.com/send?phone=${PHONE}&text=${text}`, '_blank')
    setShowSoupPrompt(false)
  }

  // Check if any combo is in the cart (combos already include soup)
  const hasCombo = cartItems.some((item) =>
    item.id.startsWith('combo')
  )

  // Check if any loklok single item (non-soup) is in the cart
  const loklokSingleIds = menuData.loklokSingles.filter((i) => i.id !== 'soup').map((i) => i.id)
  const hasLoklokItem = cartItems.some((item) =>
    loklokSingleIds.includes(item.id)
  )

  function handleClick() {
    // Skip soup prompt if: soup already added, soup sold out, any combo in cart,
    // total >= RM20 (free soup), or cart has NO loklok items (bubur-only order)
    if (!hasSoup && !soupSoldOut && !hasCombo && totalPrice < 20 && hasLoklokItem) {
      setShowSoupPrompt(true)
    } else {
      openWhatsApp()
    }
  }

  function handleAddSoup() {
    if (soupItem) {
      const activeSoupPrice = (closingSalesActive && soupItem.closingPrice) ? soupItem.closingPrice : soupItem.price
      addItem('soup', soupItem.name, activeSoupPrice)
      setTimeout(() => {
        openWhatsApp()
      }, 50)
    } else {
      setShowSoupPrompt(false)
    }
  }

  return (
    <>
      {/* Floating buy button */}
      <button
        onClick={handleClick}
        className="
          fixed bottom-6 right-6 z-50
          flex items-center gap-2.5 px-5 py-3 rounded-2xl
          bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white
          font-[Fredoka] font-bold text-sm tracking-wide
          shadow-xl shadow-[#25D366]/30
          hover:shadow-2xl hover:shadow-[#25D366]/40 hover:scale-105 hover:-translate-y-0.5
          active:scale-95
          transition-all duration-300
          animate-slide-up
        "
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        RM{totalPrice.toFixed(2)}
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/25 text-xs font-bold">
          {totalItems}
        </span>
      </button>

      {/* Soup confirmation popup */}
      {showSoupPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowSoupPrompt(false)}>
          <div className="absolute inset-0 bg-warm-brown/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-peach-100/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-5 animate-slide-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🍲</div>
            <h3 className="font-[Nunito] font-black text-lg text-warm-brown mb-1">Add Soup?</h3>
            <p className="font-[Inter] text-warm-brown/60 text-sm mb-4">
              You haven&apos;t added soup to your order.<br />
              Would you like to add one for <span className="font-bold text-warm-red">RM1.00</span>?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openWhatsApp}
                className="px-3 py-2.5 rounded-xl bg-warm-brown/10 font-[Fredoka] font-bold text-warm-brown text-sm hover:bg-warm-brown/20 active:scale-95 transition-all"
              >
                No thanks
              </button>
              <button
                onClick={handleAddSoup}
                className="px-3 py-2.5 rounded-xl bg-warm-red text-white font-[Fredoka] font-bold text-sm hover:bg-warm-red-dark active:scale-95 transition-all"
              >
                Yes, add soup!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
