import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface SpeechBubbleProps {
  text: string
  x: number
  y: number
  tailDirection?: 'left' | 'right' | 'center'
  maxWidth?: number
}

export function SpeechBubble({
  text,
  x,
  y,
  tailDirection = 'center',
  maxWidth = 400,
}: SpeechBubbleProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } })
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const tailX = tailDirection === 'left' ? '25%' : tailDirection === 'right' ? '75%' : '50%'

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale}) translateX(-50%)`,
        transformOrigin: `${tailX} bottom`,
        opacity,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '16px 24px',
          maxWidth,
          fontSize: 28,
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
          color: '#333',
          lineHeight: 1.4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {text}
        {/* Tail */}
        <div
          style={{
            position: 'absolute',
            bottom: -14,
            left: tailX,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '16px solid white',
          }}
        />
      </div>
    </div>
  )
}
