import React, { useState } from 'react'
import MenuItem from './MenuItem.jsx'
import SoupBadge from './SoupBadge.jsx'
import FoodImage from './FoodImage.jsx'
import WaveDivider from './WaveDivider.jsx'
import ComboPickerModal from './ComboPickerModal.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useMenu } from '../context/MenuContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function LoklokMenu() {
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const { menuData } = useMenu()
  const { addItem, removeItem, getQty } = useCart()
  const [pickerCombo, setPickerCombo] = useState(null)

  // Separate soup from regular single items
  const regularItems = menuData.loklokSingles.filter((i) => i.id !== 'soup')
  const soupItem = menuData.loklokSingles.find((i) => i.id === 'soup')
  const comboItems = menuData.loklokCombos
  const soupInCart = getQty('soup') > 0

  return (
    <section id="loklok-menu" ref={sectionRef}>
      {/* Wave transition from header */}
      <WaveDivider color="rgba(255,255,255,0.15)" className="-mt-2" />

      <div className={`px-4 sm:px-6 pb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Section header */}
        <div className="text-center sm:text-left mb-5">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="text-3xl">🍢</span>
            <h2 className="font-[Nunito] font-black text-4xl sm:text-5xl text-warm-brown">
              Loklok
            </h2>
          </div>
          <p className="font-[Caveat] text-warm-brown-light/70 text-xl mt-1">
            Pick your items & dip away!
          </p>
        </div>

        {/* Glass card container */}
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food image */}
            <FoodImage
              src="/Image/04.png"
              alt="Delicious loklok in hot soup"
              className="h-56 sm:h-64 lg:h-full"
            />

            {/* Menu items */}
            <div className="space-y-3">
              {/* Single items */}
              <div className="space-y-2">
                <h3 className="font-[Fredoka] font-semibold text-warm-brown text-xs uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <span className="flex-1 h-px bg-gradient-to-r from-warm-gold/40 to-transparent" />
                  Single Item
                  <span className="flex-1 h-px bg-gradient-to-l from-warm-gold/40 to-transparent" />
                </h3>
                {regularItems.map((item, i) => (
                  <div key={item.id} className={isVisible ? 'animate-slide-up' : 'opacity-0'} style={{ animationDelay: `${300 + i * 100}ms` }}>
                    <MenuItem id={item.id} name={item.name} price={item.price} index={i} soldOut={item.soldOut} item={item} />
                  </div>
                ))}

                {/* Soup toggle */}
                {soupItem && !soupItem.soldOut && !soupItem.comingSoon && (
                  <div className={`${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: `${300 + regularItems.length * 100}ms` }}>
                    <div className={`
                      flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300
                      ${soupInCart
                        ? 'bg-gradient-to-r from-warm-red/10 to-warm-gold/10 border border-warm-red/20 shadow-md shadow-warm-red/5'
                        : 'bg-white/30 backdrop-blur-sm border border-white/20'
                      }
                    `}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍲</span>
                        <div>
                          <span className="font-[Inter] text-sm font-medium text-warm-brown">{soupItem.name}</span>
                          {menuData.closingSales && soupItem.closingPrice && soupItem.closingPrice !== soupItem.price ? (
                            <span className="ml-2 font-[Fredoka] text-sm font-bold">
                              <span className="line-through text-warm-brown/40 mr-1 font-normal text-xs">{soupItem.price}</span>
                              <span className="text-warm-red">🌙 {soupItem.closingPrice}</span>
                            </span>
                          ) : (
                            <span className="font-[Fredoka] font-bold text-warm-red text-sm ml-2">{soupItem.price}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const activePrice = (menuData.closingSales && soupItem.closingPrice) ? soupItem.closingPrice : soupItem.price
                          soupInCart ? removeItem('soup') : addItem('soup', soupItem.name, activePrice)
                        }}
                        className={`
                          relative w-12 h-6 rounded-full transition-all duration-300 shrink-0
                          ${soupInCart ? 'bg-warm-red' : 'bg-warm-brown/20'}
                        `}
                      >
                        <div className={`
                          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md
                          transition-all duration-300
                          ${soupInCart ? 'left-[26px]' : 'left-0.5'}
                        `} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RM1 Soup badge + FREE soup promo */}
              <div className="flex flex-col sm:flex-row items-center gap-3 py-3">
                <SoupBadge />
                <div className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-warm-red/10 via-peach-200/40 to-warm-gold/10 border border-warm-red/15 text-center sm:text-left">
                  <p className="font-[Fredoka] text-warm-brown text-sm leading-snug">
                    🎉 <span className="font-bold text-warm-red">FREE Soup</span> on purchases of
                    <span className="font-bold text-warm-red"> RM20</span> and above!
                  </p>
                </div>
              </div>

              {/* Combo divider */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-gold/40 to-transparent" />
                <span className="font-[Fredoka] text-warm-gold text-xs uppercase tracking-[0.3em] bg-peach-100/50 px-3 py-1 rounded-full border border-warm-gold/20">
                  🔥 Combos
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-gold/40 to-transparent" />
              </div>

              {/* Combo items */}
              <div className="space-y-2">
                {comboItems.map((item, i) => (
                  <div key={item.id} className={isVisible ? 'animate-slide-up' : 'opacity-0'} style={{ animationDelay: `${800 + i * 120}ms` }}>
                    <MenuItem
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      isCombo
                      index={i}
                      tooltip={item.tooltip}
                      soldOut={item.soldOut}
                      onComboAdd={() => setPickerCombo(item)}
                      item={item}
                    />
                  </div>
                ))}
              </div>

              {/* Soup included disclaimer */}
              <p className="text-center font-[Fredoka] text-warm-brown-light/50 text-xs italic mt-2">
                🍲 Soup price is included in all Combo sets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Combo picker modal */}
      {pickerCombo && (
        <ComboPickerModal combo={pickerCombo} onClose={() => setPickerCombo(null)} />
      )}
    </section>
  )
}
