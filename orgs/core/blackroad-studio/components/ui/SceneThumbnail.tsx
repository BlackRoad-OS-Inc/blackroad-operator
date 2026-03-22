'use client'

import { BACKGROUND_TEMPLATES } from '@/lib/templates/backgrounds'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import type { Scene } from '@/lib/types'

export function SceneThumbnail({ scene, width = 120, height = 68 }: { scene: Scene; width?: number; height?: number }) {
  const bg = BACKGROUND_TEMPLATES.find((b) => b.id === scene.backgroundId)
  const skyColor = bg?.skyColor ?? '#1a1a2e'
  const groundColor = bg?.groundColor ?? '#2d3436'

  return (
    <svg width={width} height={height} viewBox="0 0 120 68" className="rounded">
      {/* Background */}
      <defs>
        <linearGradient id={`bg-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyColor} />
          <stop offset="65%" stopColor={skyColor} />
          <stop offset="100%" stopColor={groundColor} />
        </linearGradient>
      </defs>
      <rect width="120" height="68" fill={`url(#bg-${scene.id})`} />

      {/* Type label */}
      {scene.type === 'title' && (
        <text x="60" y="30" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" opacity="0.8">
          TITLE
        </text>
      )}
      {scene.type === 'end' && (
        <text x="60" y="30" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" opacity="0.8">
          THE END
        </text>
      )}

      {/* Mini characters */}
      {scene.characters.slice(0, 4).map((placement, i) => {
        const template = CHARACTER_TEMPLATES.find((c) => c.id === placement.characterId)
        if (!template) return null
        const x = 20 + i * 28
        return (
          <g key={placement.characterId}>
            <ellipse cx={x} cy={48} rx={8} ry={10} fill={template.bodyColor} />
            <circle cx={x - 3} cy={45} r={1.5} fill="white" />
            <circle cx={x + 3} cy={45} r={1.5} fill="white" />
          </g>
        )
      })}

      {/* Dialogue indicator */}
      {scene.dialogue.length > 0 && (
        <g>
          <rect x="88" y="4" width="28" height="14" rx="4" fill="rgba(0,0,0,0.5)" />
          <text x="102" y="14" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace">
            {scene.dialogue.length}L
          </text>
        </g>
      )}

      {/* Transition indicator */}
      {scene.transition !== 'cut' && (
        <rect x="0" y="62" width="120" height="6" fill="rgba(255,29,108,0.3)" rx="0" />
      )}
    </svg>
  )
}
