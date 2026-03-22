import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import type { BackgroundTemplate, BackgroundElement } from '@/lib/types'
import { BACKGROUND_TEMPLATES } from '@/lib/templates/backgrounds'

interface BackgroundProps {
  backgroundId: string
}

export function Background({ backgroundId }: BackgroundProps) {
  const frame = useCurrentFrame()
  const bg = BACKGROUND_TEMPLATES.find((b) => b.id === backgroundId) ?? BACKGROUND_TEMPLATES[0]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      {/* Sky */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${bg.skyColor} 0%, ${lighten(bg.skyColor, 0.15)} 100%)`,
        }}
      />

      {/* Ground */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: `linear-gradient(180deg, ${bg.groundColor} 0%, ${darken(bg.groundColor, 0.1)} 100%)`,
          borderTop: `3px solid ${darken(bg.groundColor, 0.15)}`,
        }}
      />

      {/* Elements */}
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {bg.elements.map((el, i) => (
          <ElementRenderer key={i} element={el} frame={frame} index={i} />
        ))}
      </svg>
    </div>
  )
}

function ElementRenderer({
  element,
  frame,
  index,
}: {
  element: BackgroundElement
  frame: number
  index: number
}) {
  const x = element.x * 1920
  const y = element.y * 1080
  const s = element.scale

  switch (element.type) {
    case 'cloud': {
      const drift = Math.sin((frame + index * 60) / 120) * 15
      return (
        <g transform={`translate(${x + drift}, ${y}) scale(${s})`}>
          <ellipse cx={0} cy={0} rx={60} ry={25} fill="white" opacity={0.9} />
          <ellipse cx={-30} cy={5} rx={35} ry={20} fill="white" opacity={0.9} />
          <ellipse cx={30} cy={5} rx={40} ry={22} fill="white" opacity={0.9} />
        </g>
      )
    }
    case 'sun': {
      const pulse = 1 + Math.sin(frame / 30) * 0.03
      return (
        <g transform={`translate(${x}, ${y}) scale(${s * pulse})`}>
          <circle cx={0} cy={0} r={50} fill="#FFD93D" />
          <circle cx={0} cy={0} r={42} fill="#FFF176" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={0}
              y1={-58}
              x2={0}
              y2={-72}
              stroke="#FFD93D"
              strokeWidth={4}
              strokeLinecap="round"
              transform={`rotate(${deg + frame * 0.3})`}
            />
          ))}
        </g>
      )
    }
    case 'moon':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <circle cx={0} cy={0} r={35} fill="#FFF9C4" />
          <circle cx={10} cy={-8} r={28} fill={element.color ?? '#1A237E'} />
        </g>
      )
    case 'star': {
      const twinkle = 0.5 + Math.sin((frame + index * 40) / 15) * 0.5
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={twinkle}>
          <polygon points="0,-12 3,-4 12,-4 5,2 7,10 0,5 -7,10 -5,2 -12,-4 -3,-4" fill="#FFF9C4" />
        </g>
      )
    }
    case 'tree':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <rect x={-8} y={0} width={16} height={50} rx={4} fill="#8D6E63" />
          <ellipse cx={0} cy={-15} rx={40} ry={45} fill="#4CAF50" />
          <ellipse cx={-15} cy={-5} rx={25} ry={30} fill="#66BB6A" />
          <ellipse cx={15} cy={-10} rx={28} ry={32} fill="#43A047" />
        </g>
      )
    case 'building':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <rect x={-50} y={-80} width={100} height={120} rx={8} fill={element.color ?? '#E57373'} />
          <rect x={-50} y={-80} width={100} height={120} rx={8} fill="none" stroke={darken(element.color ?? '#E57373', 0.15)} strokeWidth={2} />
          <rect x={-30} y={-60} width={20} height={20} rx={3} fill="rgba(255,255,255,0.4)" />
          <rect x={10} y={-60} width={20} height={20} rx={3} fill="rgba(255,255,255,0.4)" />
          <rect x={-30} y={-25} width={20} height={20} rx={3} fill="rgba(255,255,255,0.3)" />
          <rect x={10} y={-25} width={20} height={20} rx={3} fill="rgba(255,255,255,0.3)" />
          <rect x={-12} y={10} width={24} height={30} rx={4} fill={darken(element.color ?? '#E57373', 0.25)} />
        </g>
      )
    case 'hill':
      return (
        <ellipse
          cx={x}
          cy={y + 60}
          rx={200 * s}
          ry={80 * s}
          fill={element.color ?? '#81C784'}
          opacity={0.6}
        />
      )
    case 'flower': {
      const sway = Math.sin((frame + index * 30) / 20) * 3
      return (
        <g transform={`translate(${x + sway}, ${y}) scale(${s})`}>
          <line x1={0} y1={0} x2={0} y2={30} stroke="#4CAF50" strokeWidth={3} />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-10}
              rx={6}
              ry={10}
              fill={element.color ?? '#FF80AB'}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx={0} cy={0} r={5} fill="#FFF176" />
        </g>
      )
    }
    case 'fence':
      return (
        <g transform={`translate(${x - 400}, ${y}) scale(${s})`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <React.Fragment key={i}>
              <rect x={i * 42} y={-20} width={8} height={50} rx={2} fill="#D7CCC8" />
            </React.Fragment>
          ))}
          <rect x={0} y={-8} width={800} height={5} rx={2} fill="#BCAAA4" />
          <rect x={0} y={12} width={800} height={5} rx={2} fill="#BCAAA4" />
        </g>
      )
    default:
      return null
  }
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount))
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount))
  const b = Math.min(255, Math.floor((num & 0xff) + (255 - (num & 0xff)) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
