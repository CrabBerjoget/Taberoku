import React from 'react'

export default function FoodImage({ src, alt, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-xl shadow-warm-brown/10 group ${className}`}>
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        loading="lazy"
      />

      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-warm-brown/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-warm-gold/5 to-transparent pointer-events-none" />

      {/* Corner accent */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
        <span className="text-sm">✨</span>
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none" />
    </div>
  )
}
