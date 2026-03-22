export interface StudioProject {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  scenes: Scene[]
  settings: ProjectSettings
  status: 'draft' | 'previewing' | 'rendering' | 'complete'
  music?: { trackId: string; volume: number } | null
  brandKit?: BrandKit | null
  captions?: CaptionSettings | null
}

export interface MusicTrack {
  id: string
  name: string
  category: 'upbeat' | 'calm' | 'dramatic' | 'playful' | 'ambient'
  bpm: number
  durationSeconds: number
  description: string
}

export interface ProjectSettings {
  fps: number
  width: number
  height: number
  aspectRatio: AspectRatio
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3'

export const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '16:9': { width: 1920, height: 1080, label: 'Landscape (YouTube, TV)' },
  '9:16': { width: 1080, height: 1920, label: 'Vertical (TikTok, Reels, Shorts)' },
  '1:1': { width: 1080, height: 1080, label: 'Square (Instagram, Facebook)' },
  '4:3': { width: 1440, height: 1080, label: 'Classic (Presentations)' },
}

export interface Scene {
  id: string
  order: number
  type: 'title' | 'dialogue' | 'narration' | 'transition' | 'end'
  backgroundId: string
  characters: CharacterPlacement[]
  props: PropPlacement[]
  dialogue: DialogueLine[]
  narration: string | null
  durationFrames: number
  transition: TransitionType
  overlays?: TextOverlay[]
  stickers?: StickerPlacement[]
  sfx?: SoundEffect[]
}

// Text overlay system
export interface TextOverlay {
  id: string
  text: string
  position: { x: number; y: number }
  style: TextOverlayStyle
  animation: TextAnimation
  startFrame: number
  durationFrames: number
}

export interface TextOverlayStyle {
  fontSize: number
  fontFamily: 'Space Grotesk' | 'JetBrains Mono' | 'Inter' | 'Comic Sans MS'
  color: string
  backgroundColor: string | null
  bold: boolean
  italic: boolean
  align: 'left' | 'center' | 'right'
  outline: boolean
  outlineColor: string
  shadow: boolean
  rotation: number
  opacity: number
  maxWidth: number
}

export type TextAnimation =
  | 'none'
  | 'fade-in'
  | 'typewriter'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce-in'
  | 'scale-in'
  | 'spin-in'
  | 'glitch'
  | 'wave'

// Sticker/shape overlays
export interface StickerPlacement {
  id: string
  stickerId: string
  position: { x: number; y: number }
  scale: number
  rotation: number
  animation: 'none' | 'bounce' | 'spin' | 'pulse' | 'shake' | 'float'
  startFrame: number
  durationFrames: number
}

export interface StickerTemplate {
  id: string
  name: string
  emoji: string
  category: 'arrows' | 'shapes' | 'emojis' | 'callouts' | 'badges' | 'effects'
}

// Sound effects
export interface SoundEffect {
  id: string
  sfxId: string
  startFrame: number
  volume: number
}

export interface SFXTemplate {
  id: string
  name: string
  category: 'transitions' | 'actions' | 'comedy' | 'ui' | 'nature'
  durationMs: number
  description: string
}

// Brand kit
export interface BrandKit {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontHeading: 'Space Grotesk' | 'JetBrains Mono' | 'Inter'
  fontBody: 'Space Grotesk' | 'JetBrains Mono' | 'Inter'
  logoUrl: string | null
  watermark: boolean
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  watermarkOpacity: number
}

// Auto-captions
export interface CaptionSettings {
  enabled: boolean
  style: 'default' | 'bold' | 'karaoke' | 'minimal' | 'cinematic'
  position: 'bottom' | 'top' | 'middle'
  fontSize: 'small' | 'medium' | 'large'
  backgroundColor: string
  textColor: string
  outline: boolean
}

export interface CharacterTemplate {
  id: string
  name: string
  bodyColor: string
  accentColor: string
  faceColor: string
  eyeColor: string
  size: 'small' | 'medium' | 'large'
  accessory: 'none' | 'hat' | 'bow' | 'glasses' | 'crown' | 'headband'
}

export interface CharacterPlacement {
  characterId: string
  position: { x: number; y: number }
  scale: number
  animation: CharacterAnimation
  enterAnimation: EnterAnimation
}

export type CharacterAnimation = 'idle' | 'talking' | 'walking' | 'waving' | 'bouncing' | 'dancing'
export type EnterAnimation = 'none' | 'slide-left' | 'slide-right' | 'bounce-in' | 'fade-in' | 'drop-in'

export interface DialogueLine {
  id: string
  characterId: string | null
  text: string
  voiceId: string
  audioUrl: string | null
  audioDurationMs: number
}

export interface BackgroundTemplate {
  id: string
  name: string
  skyColor: string
  groundColor: string
  accentColor: string
  elements: BackgroundElement[]
}

export interface BackgroundElement {
  type: 'cloud' | 'sun' | 'moon' | 'star' | 'hill' | 'building' | 'tree' | 'fence' | 'flower' | 'furniture'
  x: number
  y: number
  scale: number
  color?: string
}

export interface PropTemplate {
  id: string
  name: string
  color: string
  category: 'nature' | 'vehicle' | 'toy' | 'furniture' | 'food' | 'tool'
}

export interface PropPlacement {
  propId: string
  position: { x: number; y: number }
  scale: number
}

export type TransitionType = 'cut' | 'fade' | 'slide-left' | 'slide-right' | 'wipe' | 'zoom'

export interface VoiceOption {
  id: string
  name: string
  gender: 'male' | 'female'
  style: 'narrator' | 'child' | 'character' | 'dramatic'
  sampleText: string
}

export interface RenderJob {
  id: string
  projectId: string
  status: 'queued' | 'rendering' | 'encoding' | 'complete' | 'failed'
  progress: number
  outputUrl: string | null
  startedAt: number
}
