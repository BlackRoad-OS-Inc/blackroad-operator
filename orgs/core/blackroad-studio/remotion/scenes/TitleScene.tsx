import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface TitleSceneProps {
  title: string
  subtitle?: string
  backgroundColor?: string
}

export function TitleScene({
  title,
  subtitle,
  backgroundColor = '#1A237E',
}: TitleSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } })
  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${lighten(backgroundColor, 0.2)} 100%)`,
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          fontSize: 80,
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'white',
          textAlign: 'center',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: 1200,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            opacity: subtitleOpacity,
            fontSize: 36,
            fontFamily: "'Inter', sans-serif",
            color: 'rgba(255,255,255,0.8)',
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount))
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount))
  const b = Math.min(255, Math.floor((num & 0xff) + (255 - (num & 0xff)) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
