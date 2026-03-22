import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface SubtitlesProps {
  text: string
}

export function Subtitles({ text }: SubtitlesProps) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 5, 5, 1000], [0, 1, 1, 1], {
    extrapolateRight: 'clamp',
  })

  if (!text) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.75)',
          borderRadius: 12,
          padding: '12px 32px',
          maxWidth: 900,
          fontSize: 32,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  )
}
