import React, { useEffect, useRef, useState } from 'react'

const EMOJIS = ['🍢', '🍜', '🍚', '🌶️', '🥢', '🍲', '🧄', '🫚', '🥘']

function Particle({ emoji, style }) {
  return (
    <div
      className="fixed pointer-events-none text-2xl animate-particle select-none"
      style={style}
      aria-hidden="true"
    >
      {emoji}
    </div>
  )
}

export default function FloatingParticles() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      style: {
        left: `${Math.random() * 100}%`,
        bottom: `-40px`,
        animationDuration: `${12 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 8}s`,
        fontSize: `${16 + Math.random() * 14}px`,
        opacity: 0.4 + Math.random() * 0.3,
      },
    }))
    setParticles(initial)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <Particle key={p.id} emoji={p.emoji} style={p.style} />
      ))}
    </div>
  )
}
