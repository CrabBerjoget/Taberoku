import React from 'react'

export default function WaveDivider({ color = '#FDE6C2', flip = false, className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-8 sm:h-12"
      >
        <path
          d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
