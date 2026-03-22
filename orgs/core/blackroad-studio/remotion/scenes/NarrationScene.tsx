import React from 'react'
import { useCurrentFrame } from 'remotion'
import { Background } from '@/remotion/components/Background'
import { AnimatedCharacter } from '@/remotion/components/AnimatedCharacter'
import { Subtitles } from '@/remotion/components/Subtitles'
import type { Scene } from '@/lib/types'

interface NarrationSceneProps {
  scene: Scene
}

export function NarrationScene({ scene }: NarrationSceneProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Background backgroundId={scene.backgroundId} />

      {scene.characters.map((placement) => (
        <AnimatedCharacter key={placement.characterId} placement={placement} />
      ))}

      {scene.narration && <Subtitles text={scene.narration} />}
    </div>
  )
}
