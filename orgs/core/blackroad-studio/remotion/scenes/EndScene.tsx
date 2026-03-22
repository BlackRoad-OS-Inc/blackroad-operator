import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface EndSceneProps {
  title?: string
  credits?: string
}

export function EndScene({ title = 'The End', credits }: EndSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } })
  const creditsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D0D2B 0%, #1A1A4E 50%, #2D1B69 100%)',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          background: 'linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      {credits && (
        <div
          style={{
            opacity: creditsOpacity,
            fontSize: 24,
            fontFamily: "'Inter', sans-serif",
            color: 'rgba(255,255,255,0.6)',
            marginTop: 32,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {credits}
        </div>
      )}
      <div
        style={{
          opacity: creditsOpacity,
          fontSize: 16,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(255,255,255,0.3)',
          marginTop: 48,
        }}
      >
        Made with BlackRoad Studio
      </div>
    </div>
  )
}
