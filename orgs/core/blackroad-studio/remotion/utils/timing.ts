import type { Scene } from '@/lib/types'
import { FPS, DEFAULT_SCENE_DURATION_FRAMES, PADDING_FRAMES, TITLE_SCENE_DURATION_FRAMES } from '@/lib/constants'

export function calculateSceneDuration(scene: Scene): number {
  if (scene.type === 'title' || scene.type === 'end') {
    return TITLE_SCENE_DURATION_FRAMES
  }

  if (scene.type === 'transition') {
    return Math.round(FPS * 1)
  }

  // Duration based on dialogue audio
  const totalAudioMs = scene.dialogue.reduce((sum, line) => sum + line.audioDurationMs, 0)
  if (totalAudioMs > 0) {
    return Math.ceil((totalAudioMs / 1000) * FPS) + PADDING_FRAMES
  }

  // Fallback: estimate from text length (150 words per minute average speaking rate)
  const totalWords = scene.dialogue.reduce(
    (sum, line) => sum + line.text.split(/\s+/).length,
    0
  )
  if (totalWords > 0) {
    const estimatedMs = (totalWords / 150) * 60 * 1000
    return Math.ceil((estimatedMs / 1000) * FPS) + PADDING_FRAMES
  }

  return DEFAULT_SCENE_DURATION_FRAMES
}

export function calculateTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((total, scene) => total + calculateSceneDuration(scene), 0)
}

export function framesToTimecode(frames: number): string {
  const totalSeconds = Math.floor(frames / FPS)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getSceneStartFrame(scenes: Scene[], sceneIndex: number): number {
  let frame = 0
  for (let i = 0; i < sceneIndex; i++) {
    frame += calculateSceneDuration(scenes[i])
  }
  return frame
}
