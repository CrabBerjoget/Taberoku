import React, { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useMenu } from '../context/MenuContext.jsx'

export default function MenuItem({ id, name, price, isCombo = false, comboData = null, index = 0, tooltip = '', soldOut = false, onComboAdd, item }) {
  const [tapped, setTapped] = useState(false)
  const { addItem, removeItem, getQty } = useCart()
  const { menuData } = useMenu()
  const qty = getQty(id)

  const closingSalesActive = menuData?.closingSales || false
  const isComingSoon = item?.comingSoon || false
  const isSoldOut = item?.soldOut || soldOut || false

  // Price resolution
  const hasPromoPrice = closingSalesActive && item?.closingPrice && item.closingPrice.trim() !== ''
  const displayPrice = hasPromoPrice ? item.closingPrice : price

  function handleAdd(e) {
    e.stopPropagation()
    if (isCombo && onComboAdd) {
      onComboAdd()
    } else {
      addItem(id, name, displayPrice)
    }
  }

  return (
    <div
      className={`
        group relative flex items-center justify-between px-4 py-3 rounded-2xl
        transition-all duration-400 ease-out cursor-default
        ${isSoldOut
          ? 'bg-warm-brown/5 border border-warm-brown/10 opacity-60'
          : isComingSoon
            ? 'bg-warm-gold/5 border border-warm-gold/20 opacity-80'
            : isCombo
              ? 'glass-card border-warm-gold/30 hover:border-warm-gold/60'
              : 'bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/50'
        }
        ${!isSoldOut && !isComingSoon && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-peach-300/20'}
        ${tapped && !isSoldOut && !isComingSoon ? 'scale-95' : ''}
      `}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseDown={() => !isSoldOut && !isComingSoon && setTapped(true)}
      onMouseUp={() => setTapped(false)}
      onMouseLeave={() => setTapped(false)}
    >
      {/* Shine sweep on hover (disabled when sold out or coming soon) */}
      {!isSoldOut && !isComingSoon && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Tooltip on hover */}
      {tooltip && !isSoldOut && !isComingSoon && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-xl bg-warm-brown text-white text-xs font-[Fredoka] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-lg group-hover:-top-11">
          {tooltip}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-warm-brown" />
        </div>
      )}

      {/* Left side: icon + name + badges */}
      <div className="flex items-center gap-2 relative z-10 min-w-0 flex-1 pr-1.5">
        {isCombo && !isSoldOut && !isComingSoon ? (
          <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-warm-red/20 to-warm-gold/20 text-sm group-hover:scale-110 transition-transform duration-300">
            🔥
          </span>
        ) : !isSoldOut && !isComingSoon ? (
          <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-warm-gold/60 group-hover:bg-warm-red group-hover:scale-150 transition-all duration-300" />
        ) : (
          <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-warm-brown/20" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`
            font-[Inter] transition-colors duration-300 whitespace-normal break-words
            ${isSoldOut
              ? 'text-warm-brown/40 line-through text-sm'
              : isComingSoon
                ? 'text-warm-brown/60 text-sm italic'
                : isCombo
                  ? 'text-sm font-bold text-warm-brown group-hover:text-warm-brown-light'
                  : 'text-sm font-medium text-warm-brown group-hover:text-warm-brown-light'
            }
          `}>
            {name}
          </span>
          
          {/* Badges container */}
          {(isSoldOut || isComingSoon || (isCombo && !isSoldOut && !isComingSoon)) && (
            <div className="flex flex-wrap items-center gap-1 mt-0.5">
              {isSoldOut && (
                <span className="text-[8px] font-[Fredoka] text-white bg-warm-red px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">
                  Sold Out
                </span>
              )}
              {isComingSoon && (
                <span className="text-[8px] font-[Fredoka] text-white bg-warm-gold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0 shadow-sm border border-white/10">
                  Coming Soon
                </span>
              )}
              {isCombo && !isSoldOut && !isComingSoon && (
                <span className="text-[8px] font-[Fredoka] text-warm-gold bg-warm-gold/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Best Value
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="relative z-10 font-[Fredoka] font-bold transition-all duration-300 shrink-0 mx-2 flex flex-col items-end">
        {hasPromoPrice ? (
          <>
            <span className="text-[10px] line-through text-warm-brown/40 font-normal leading-none">{price}</span>
            <span className={`text-warm-red ${isCombo ? 'text-base' : 'text-sm'} leading-none mt-0.5 flex items-center gap-0.5`}>
              <span className="text-[10px]">🌙</span> {displayPrice}
            </span>
          </>
        ) : (
          <span className={`
            ${isSoldOut || isComingSoon
              ? 'text-warm-brown/30 text-sm line-through'
              : isCombo
                ? 'text-warm-red text-base group-hover:scale-110'
                : 'text-warm-brown text-sm group-hover:text-warm-red group-hover:scale-105'
            }
          `}>
            {price}
          </span>
        )}
      </div>

      {/* Quantity controls */}
      {!isSoldOut && !isComingSoon && (
        <div className="flex items-center gap-1 relative z-10 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); removeItem(id) }}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
              transition-all duration-200 select-none
              ${qty > 0
                ? 'bg-warm-red/15 text-warm-red hover:bg-warm-red/25 active:scale-90'
                : 'bg-warm-brown/5 text-warm-brown/20 cursor-default'
              }
            `}
            disabled={qty === 0}
          >
            −
          </button>
          <span className={`
            w-6 text-center font-[Fredoka] font-bold text-sm
            transition-all duration-200
            ${qty > 0 ? 'text-warm-brown' : 'text-warm-brown/20'}
          `}>
            {qty}
          </span>
          <button
            onClick={handleAdd}
            className="w-7 h-7 rounded-full bg-warm-gold/20 text-warm-gold hover:bg-warm-gold/35 active:scale-90 flex items-center justify-center text-sm font-bold transition-all duration-200 select-none"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
