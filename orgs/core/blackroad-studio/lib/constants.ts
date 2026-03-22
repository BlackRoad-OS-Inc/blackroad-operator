export const FPS = 30
export const VIDEO_WIDTH = 1920
export const VIDEO_HEIGHT = 1080
export const MAX_DURATION_MINUTES = 40
export const MAX_DURATION_FRAMES = MAX_DURATION_MINUTES * 60 * FPS
export const DEFAULT_SCENE_DURATION_FRAMES = 5 * FPS // 5 seconds
export const TITLE_SCENE_DURATION_FRAMES = 4 * FPS
export const TRANSITION_DURATION_FRAMES = Math.round(0.5 * FPS) // 0.5s
export const PADDING_FRAMES = Math.round(0.8 * FPS) // 0.8s padding after dialogue

export const BRAND_COLORS = {
  amber: '#F5A623',
  hotPink: '#FF1D6C',
  electricBlue: '#2979FF',
  violet: '#9C27B0',
  black: '#000000',
  white: '#FFFFFF',
} as const

export const TEXT_OVERLAY_DEFAULTS = {
  fontSize: 48,
  fontFamily: 'Space Grotesk' as const,
  color: '#FFFFFF',
  backgroundColor: null,
  bold: true,
  italic: false,
  align: 'center' as const,
  outline: true,
  outlineColor: '#000000',
  shadow: true,
  rotation: 0,
  opacity: 1,
  maxWidth: 800,
}

export const CAPTION_STYLES = {
  default: { bg: 'rgba(0,0,0,0.7)', text: '#FFFFFF', outline: false, font: 24 },
  bold: { bg: 'rgba(0,0,0,0.85)', text: '#FFFFFF', outline: true, font: 28 },
  karaoke: { bg: 'transparent', text: '#FFFF00', outline: true, font: 32 },
  minimal: { bg: 'transparent', text: '#FFFFFF', outline: false, font: 20 },
  cinematic: { bg: 'rgba(0,0,0,0.5)', text: '#FFFFFF', outline: false, font: 22 },
} as const
