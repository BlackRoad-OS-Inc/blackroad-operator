import React from 'react'
import { useCurrentFrame, useVideoConfig, Audio, Sequence } from 'remotion'
import { Background } from '@/remotion/components/Background'
import { AnimatedCharacter } from '@/remotion/components/AnimatedCharacter'
import { SpeechBubble } from '@/remotion/components/SpeechBubble'
import { Subtitles } from '@/remotion/components/Subtitles'
import type { Scene } from '@/lib/types'
import { FPS, PADDING_FRAMES } from '@/lib/constants'

interface DialogueSceneProps {
  scene: Scene
}

export function DialogueScene({ scene }: DialogueSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Calculate which dialogue line is currently active based on frame
  let currentLineIndex = 0
  let lineStartFrame = 0
  const lineFrames: { startFrame: number; endFrame: number }[] = []

  for (const line of scene.dialogue) {
    const lineDuration = line.audioDurationMs > 0
      ? Math.ceil((line.audioDurationMs / 1000) * fps) + Math.round(fps * 0.3)
      : Math.ceil((line.text.split(/\s+/).length / 150) * 60 * fps) + Math.round(fps * 0.5)

    lineFrames.push({ startFrame: lineStartFrame, endFrame: lineStartFrame + lineDuration })
    lineStartFrame += lineDuration
  }

  // Find current active line
  for (let i = 0; i < lineFrames.length; i++) {
    if (frame >= lineFrames[i].startFrame && frame < lineFrames[i].endFrame) {
      currentLineIndex = i
      break
    }
  }

  const currentLine = scene.dialogue[currentLineIndex]

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Background backgroundId={scene.backgroundId} />

      {/* Characters */}
      {scene.characters.map((placement) => (
        <AnimatedCharacter
          key={placement.characterId}
          placement={placement}
          isTalking={
            currentLine?.characterId === placement.characterId &&
            frame >= lineFrames[currentLineIndex]?.startFrame &&
            frame < lineFrames[currentLineIndex]?.endFrame
          }
        />
      ))}

      {/* Speech bubble for current line */}
      {currentLine && (
        <Sequence
          from={lineFrames[currentLineIndex]?.startFrame ?? 0}
          durationInFrames={
            (lineFrames[currentLineIndex]?.endFrame ?? 0) -
            (lineFrames[currentLineIndex]?.startFrame ?? 0)
          }
        >
          {currentLine.characterId ? (
            <SpeechBubble
              text={currentLine.text}
              x={
                (scene.characters.find((c) => c.characterId === currentLine.characterId)
                  ?.position.x ?? 0.5) * 1920
              }
              y={
                ((scene.characters.find((c) => c.characterId === currentLine.characterId)
                  ?.position.y ?? 0.5) - 0.35) * 1080
              }
            />
          ) : null}
        </Sequence>
      )}

      {/* Subtitles */}
      {currentLine && <Subtitles text={currentLine.text} />}

      {/* Audio tracks */}
      {scene.dialogue.map(
        (line, i) =>
          line.audioUrl && (
            <Sequence key={line.id} from={lineFrames[i]?.startFrame ?? 0}>
              <Audio src={line.audioUrl} />
            </Sequence>
          )
      )}
    </div>
  )
}
