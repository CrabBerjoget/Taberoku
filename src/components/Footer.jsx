import React from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useMenu } from '../context/MenuContext.jsx'

export default function Footer() {
  const [ref, isVisible] = useScrollReveal(0.2)
  const { isAdmin, setShowAdmin } = useMenu()

  function handleAdminClick() {
    if (isAdmin) {
      window.location.hash = '#/admin'
    } else {
      setShowAdmin(true)
    }
  }

  return (
    <footer ref={ref} className={`text-center py-10 px-4 mt-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="w-16 h-px bg-gradient-to-r from-transparent to-warm-gold/40" />
        <span className="text-xl animate-float" style={{ animationDuration: '3s' }}>🍜</span>
        <div className="w-16 h-px bg-gradient-to-l from-transparent to-warm-gold/40" />
      </div>

      {/* Clickable logo mark — opens admin */}
      <button
        onClick={handleAdminClick}
        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2 mb-3 hover:bg-white/35 hover:border-warm-gold/40 hover:shadow-md hover:shadow-peach-300/20 active:scale-95 transition-all duration-300 cursor-pointer group"
      >
        <span className="font-[Caveat] text-warm-gold text-lg group-hover:text-warm-gold transition-colors">タベロク</span>
        <span className="w-px h-4 bg-warm-brown/20 group-hover:bg-warm-gold/40 transition-colors" />
        <span className="font-[Fredoka] text-warm-brown text-sm font-bold tracking-wide group-hover:text-warm-brown-light transition-colors">TABELOK</span>
      </button>

      <p className="font-[Inter] text-warm-brown/40 text-xs mt-2">
        &copy; {new Date().getFullYear()} &middot; Made with ❤️ &amp; lots of sambal
      </p>
    </footer>
  )
}
