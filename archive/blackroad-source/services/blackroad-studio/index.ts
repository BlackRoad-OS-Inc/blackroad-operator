import { interpolate, spring } from 'remotion'

export function bob(frame: number, fps: number, amplitude = 6): number {
  return Math.sin((frame / fps) * Math.PI * 2 * 0.5) * amplitude
}

export function talk(frame: number, fps: number): boolean {
  // Alternate mouth open/closed roughly every 4-6 frames
  const cycle = Math.floor(frame / 5)
  return cycle % 2 === 0
}

export function slideIn(
  frame: number,
  fps: number,
  direction: 'left' | 'right',
  durationFrames = 20
): number {
  const offset = direction === 'left' ? -600 : 600
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return offset * (1 - progress)
}

export function bounceIn(frame: number, fps: number): number {
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 200, mass: 0.8 } })
  return s
}

export function fadeIn(frame: number, durationFrames = 15): number {
  return interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

export function dropIn(frame: number, fps: number): { y: number; scale: number } {
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 150 } })
  return {
    y: interpolate(s, [0, 1], [-200, 0]),
    scale: interpolate(s, [0, 1], [0.3, 1]),
  }
}

export function pulse(frame: number, fps: number, speed = 1): number {
  return 1 + Math.sin((frame / fps) * Math.PI * 2 * speed) * 0.03
}
