import React, { useState, useEffect } from 'react'
import tabelokLogo from '../assets/tabelokLogo.png'

export default function Header() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <header className="relative text-center pt-6 pb-2 px-4 overflow-hidden">
      {/* Animated morphing blob backgrounds */}
      <div
        className="absolute -top-20 -left-20 w-64 h-64 bg-peach-300/20 animate-blob"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute -top-10 -right-16 w-48 h-48 bg-warm-red/10 animate-blob"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-warm-gold/10 animate-blob"
        style={{ animationDelay: '8s' }}
      />

      {/* Rotating decorative ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 opacity-[0.06] pointer-events-none">
        <div className="w-full h-full border-[3px] border-dashed border-warm-brown rounded-full animate-spin-slow" />
      </div>

      {/* Logo content */}
      <div className={`relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Interactive logo image */}
        <div className="group inline-block cursor-pointer select-none">
          <img
            src={tabelokLogo}
            alt="タベロク Tabelok – Lapar? Bah lan kita makan"
            className="
              w-72 sm:w-80 md:w-96 mx-auto
              drop-shadow-xl
              transition-all duration-500 ease-out
              group-hover:scale-105 group-hover:drop-shadow-2xl
              group-hover:-translate-y-1
              group-active:scale-95
            "
            draggable="false"
          />

          {/* Glow ring behind logo on hover */}
          <div className="
            absolute inset-0 -z-10 mx-auto
            w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-peach-300/0 group-hover:bg-peach-300/15
            blur-3xl transition-all duration-700
          " />
        </div>

        {/* Subtitle / Tagline */}
        <h2 className="font-[Fredoka] font-bold text-sm sm:text-base text-warm-brown mt-2.5 tracking-wide">
          Tabelok - Pickup System
        </h2>
      </div>

      {/* Floating emoji accents */}
      <div className="absolute top-6 left-8 text-2xl animate-float opacity-60" style={{ animationDelay: '0s' }}>🍢</div>
      <div className="absolute top-16 right-6 text-xl animate-float-slow opacity-50" style={{ animationDelay: '2s' }}>🌶️</div>
      <div className="absolute bottom-8 left-12 text-lg animate-float opacity-40" style={{ animationDelay: '1s' }}>🥢</div>
      <div className="absolute bottom-4 right-16 text-2xl animate-float-slow opacity-50" style={{ animationDelay: '3s' }}>🍜</div>
    </header>
  )
}
