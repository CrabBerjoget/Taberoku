import React from 'react'
import MenuItem from './MenuItem.jsx'
import FoodImage from './FoodImage.jsx'
import WaveDivider from './WaveDivider.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useMenu } from '../context/MenuContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function BuburMenu() {
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const { menuData } = useMenu()
  const { addItem, removeItem, getQty } = useCart()

  const buburItems = menuData.buburItems
  const promoItem = menuData.buburPromos?.[0]
  const promoQty = promoItem ? getQty(promoItem.id) : 0

  return (
    <section id="bubur-menu" ref={sectionRef}>
      {/* Decorative dot separator */}
      <div className="flex items-center justify-center gap-2 py-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
            style={{
              width: i === 2 ? '10px' : '6px',
              height: i === 2 ? '10px' : '6px',
              backgroundColor: i === 2 ? '#D72638' : '#C8952E',
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      <div className={`px-4 sm:px-6 pb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Section header with dramatic typography */}
        <div className="text-center mb-8 relative">
          {/* Background text watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="font-[Nunito] font-black text-8xl sm:text-9xl text-warm-brown/[0.03] tracking-widest">
              粥
            </span>
          </div>

          <p className="font-[Caveat] text-warm-gold text-xl mb-1 relative z-10">~ our signature ~</p>
          <h2 className="font-[Nunito] font-black text-5xl sm:text-6xl text-warm-brown tracking-tight leading-none relative z-10">
            BUBUR
          </h2>
          <h2 className="font-[Nunito] font-black text-4xl sm:text-5xl tracking-wider leading-tight -mt-1 relative z-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-red to-warm-red-dark">
              ALAM C
            </span>
          </h2>
          <p className="font-[Caveat] text-warm-brown-light/60 text-xl mt-2 relative z-10">
            Comfort in every spoonful 🍚
          </p>
        </div>

        {/* Glass card container */}
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Menu items */}
            <div className="space-y-3 order-2 lg:order-1">
              <h3 className="font-[Fredoka] font-semibold text-warm-brown text-xs uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                <span className="flex-1 h-px bg-gradient-to-r from-warm-gold/40 to-transparent" />
                Choose Your Bubur Toppings
                <span className="flex-1 h-px bg-gradient-to-l from-warm-gold/40 to-transparent" />
              </h3>

              {buburItems.map((item, i) => (
                <div key={item.id} className={isVisible ? 'animate-slide-up' : 'opacity-0'} style={{ animationDelay: `${400 + i * 120}ms` }}>
                  <MenuItem id={item.id} name={item.name} price={item.price} index={i} soldOut={item.soldOut} />
                </div>
              ))}

              {/* 3x Kosong promo */}
              {promoItem && !promoItem.soldOut && (
                <div className={`mt-4 p-4 rounded-2xl glass-card border-warm-gold/30 relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${promoQty > 0 ? 'ring-2 ring-warm-gold/30' : ''}`} style={{ transitionDelay: '700ms' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-warm-gold/15 text-xl">🍚</span>
                      <div>
                        <p className="font-[Fredoka] font-bold text-warm-brown text-sm">{promoItem.name}</p>
                        <p className="font-[Caveat] text-warm-brown-light/60 text-sm">Save RM0.50!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[Fredoka] font-bold text-warm-red text-lg">{promoItem.price}</span>
                      <button
                        onClick={() => removeItem(promoItem.id)}
                        disabled={promoQty === 0}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all select-none ${promoQty > 0 ? 'bg-warm-red/15 text-warm-red hover:bg-warm-red/25 active:scale-90' : 'bg-warm-brown/5 text-warm-brown/15'}`}
                      >
                        −
                      </button>
                      <span className={`w-5 text-center font-[Fredoka] font-bold text-sm ${promoQty > 0 ? 'text-warm-brown' : 'text-warm-brown/20'}`}>
                        {promoQty}
                      </span>
                      <button
                        onClick={() => addItem(promoItem.id, promoItem.name, promoItem.price)}
                        className="w-7 h-7 rounded-full bg-warm-gold/20 text-warm-gold hover:bg-warm-gold/35 active:scale-90 flex items-center justify-center text-sm font-bold transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlight callout card */}
              <div className={`mt-3 p-4 rounded-2xl bg-gradient-to-br from-warm-red/10 via-peach-200/40 to-warm-gold/10 border border-warm-red/15 relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '800ms' }}>
                {/* Decorative corner */}
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-warm-red/5 rounded-full" />
                <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-warm-gold/5 rounded-full" />

                <p className="font-[Caveat] text-warm-brown text-lg text-center leading-relaxed relative z-10">
                  🌶️ Try our <span className="font-bold text-warm-red text-xl">Bubur Ayam</span> — slow-cooked
                  with love & topped with crispy shallots!
                </p>
              </div>
            </div>

            {/* Food images grid */}
            <div className="grid grid-cols-2 gap-3 order-1 lg:order-2">
              <FoodImage
                src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&crop=center"
                alt="Warm bubur porridge bowl"
                className="h-36 sm:h-44"
              />
              <FoodImage
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center"
                alt="Fresh ingredients for porridge"
                className="h-36 sm:h-44"
              />
              <FoodImage
                src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop&crop=center"
                alt="Creamy rice porridge with toppings"
                className="col-span-2 h-36 sm:h-44"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
