import React from 'react'

export default function SoupBadge() {
  return (
    <div className="relative inline-flex items-center justify-center animate-float" style={{ animationDuration: '4s' }}>
      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-36 h-36 rounded-full bg-warm-red/10 animate-pulse-glow" />
      </div>

      {/* Spinning starburst */}
      <div className="absolute inset-0 flex items-center justify-center animate-spin-slow" style={{ animationDuration: '30s' }}>
        <svg viewBox="0 0 200 200" className="w-34 h-34" aria-hidden="true">
          <polygon
            points={generateStarburstPoints(100, 100, 95, 72, 18)}
            fill="url(#badgeGradient)"
            stroke="#8B0000"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D72638" />
              <stop offset="50%" stopColor="#E83A4C" />
              <stop offset="100%" stopColor="#B71C2A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Badge text — stays still while starburst spins */}
      <div className="relative z-10 flex flex-col items-center justify-center w-34 h-34">
        <span className="text-white font-[Nunito] font-black text-3xl leading-none tracking-tight drop-shadow-md">
          RM1
        </span>
        <span className="text-yellow-200 font-[Fredoka] font-bold text-xs leading-tight uppercase tracking-[0.2em] mt-0.5 drop-shadow-sm">
          Soup
        </span>
      </div>
    </div>
  )
}

function generateStarburstPoints(cx, cy, outerR, innerR, numPoints) {
  const points = []
  const totalPoints = numPoints * 2
  for (let i = 0; i < totalPoints; i++) {
    const angle = (Math.PI * 2 * i) / totalPoints - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return points.join(' ')
}
