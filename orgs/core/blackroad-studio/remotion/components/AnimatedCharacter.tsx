import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { HigglyCharacter } from '@/components/characters/HigglyCharacter'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import { bob, talk, slideIn, bounceIn, fadeIn, dropIn } from '@/remotion/animations'
import type { CharacterPlacement, CharacterAnimation, EnterAnimation } from '@/lib/types'

interface AnimatedCharacterProps {
  placement: CharacterPlacement
  isTalking?: boolean
}

export function AnimatedCharacter({ placement, isTalking = false }: AnimatedCharacterProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const template = CHARACTER_TEMPLATES.find((c) => c.id === placement.characterId)
  if (!template) return null

  const baseX = placement.position.x * 1920
  const baseY = placement.position.y * 1080
  const scale = placement.scale

  // Entry animation
  let enterOffset = { x: 0, y: 0 }
  let enterOpacity = 1
  let enterScale = 1

  switch (placement.enterAnimation) {
    case 'slide-left':
      enterOffset.x = slideIn(frame, fps, 'left')
      break
    case 'slide-right':
      enterOffset.x = slideIn(frame, fps, 'right')
      break
    case 'bounce-in': {
      const s = bounceIn(frame, fps)
      enterScale = s
      enterOpacity = s
      break
    }
    case 'fade-in':
      enterOpacity = fadeIn(frame)
      break
    case 'drop-in': {
      const d = dropIn(frame, fps)
      enterOffset.y = d.y
      enterScale = d.scale
      break
    }
  }

  // Idle/active animation
  let animY = 0
  let mouthOpen = false

  switch (placement.animation) {
    case 'idle':
      animY = bob(frame, fps, 3)
      break
    case 'talking':
      animY = bob(frame, fps, 2)
      mouthOpen = isTalking ? talk(frame, fps) : false
      break
    case 'bouncing':
      animY = bob(frame, fps, 12)
      break
    case 'waving':
      animY = bob(frame, fps, 4)
      break
    case 'dancing':
      animY = bob(frame, fps, 8)
      break
    case 'walking':
      animY = bob(frame, fps, 5)
      break
  }

  const charWidth = template.size === 'small' ? 120 : template.size === 'large' ? 200 : 160
  const charHeight = charWidth * 1.4

  return (
    <div
      style={{
        position: 'absolute',
        left: baseX + enterOffset.x - (charWidth * scale * enterScale) / 2,
        top: baseY + enterOffset.y + animY - charHeight * scale * enterScale,
        opacity: enterOpacity,
        transform: `scale(${scale * enterScale})`,
        transformOrigin: 'bottom center',
      }}
    >
      <HigglyCharacter
        bodyColor={template.bodyColor}
        accentColor={template.accentColor}
        faceColor={template.faceColor}
        eyeColor={template.eyeColor}
        accessory={template.accessory}
        mouthOpen={mouthOpen}
        expression="happy"
        width={charWidth}
        height={charHeight}
      />
    </div>
  )
}
