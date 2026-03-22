import React from 'react'
import { Sequence, useCurrentFrame, interpolate } from 'remotion'
import { TitleScene } from '@/remotion/scenes/TitleScene'
import { DialogueScene } from '@/remotion/scenes/DialogueScene'
import { NarrationScene } from '@/remotion/scenes/NarrationScene'
import { EndScene } from '@/remotion/scenes/EndScene'
import type { StudioProject, Scene, TransitionType } from '@/lib/types'
import { calculateSceneDuration } from '@/remotion/utils/timing'

interface VideoProps {
  project: StudioProject
}

export function Video({ project }: VideoProps) {
  let currentFrame = 0

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      {project.scenes.map((scene, index) => {
        const duration = calculateSceneDuration(scene)
        const startFrame = currentFrame
        currentFrame += duration

        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={duration}>
            <TransitionWrapper transition={scene.transition} durationInFrames={duration}>
              <SceneRenderer scene={scene} />
            </TransitionWrapper>
          </Sequence>
        )
      })}
    </div>
  )
}

function SceneRenderer({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case 'title':
      return (
        <TitleScene
          title={scene.narration ?? 'Untitled'}
          subtitle={scene.dialogue[0]?.text}
        />
      )
    case 'dialogue':
      return <DialogueScene scene={scene} />
    case 'narration':
      return <NarrationScene scene={scene} />
    case 'end':
      return (
        <EndScene
          title={scene.narration ?? 'The End'}
          credits={scene.dialogue.map((d) => d.text).join('\n')}
        />
      )
    case 'transition':
      return <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
    default:
      return null
  }
}

function TransitionWrapper({
  children,
  transition,
  durationInFrames,
}: {
  children: React.ReactNode
  transition: TransitionType
  durationInFrames: number
}) {
  const frame = useCurrentFrame()
  const fadeFrames = 10

  let opacity = 1
  let transform = 'none'

  switch (transition) {
    case 'fade':
      opacity = interpolate(
        frame,
        [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
      break
    case 'slide-left':
      if (frame < fadeFrames) {
        const x = interpolate(frame, [0, fadeFrames], [100, 0], { extrapolateRight: 'clamp' })
        transform = `translateX(${x}%)`
      }
      break
    case 'slide-right':
      if (frame < fadeFrames) {
        const x = interpolate(frame, [0, fadeFrames], [-100, 0], { extrapolateRight: 'clamp' })
        transform = `translateX(${x}%)`
      }
      break
    case 'zoom':
      if (frame < fadeFrames) {
        const s = interpolate(frame, [0, fadeFrames], [0.5, 1], { extrapolateRight: 'clamp' })
        opacity = interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: 'clamp' })
        transform = `scale(${s})`
      }
      break
    case 'cut':
    default:
      break
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transform,
      }}
    >
      {children}
    </div>
  )
}
