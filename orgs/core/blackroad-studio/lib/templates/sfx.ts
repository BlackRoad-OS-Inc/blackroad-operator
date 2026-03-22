import type { SFXTemplate } from '@/lib/types'

export const SFX_TEMPLATES: SFXTemplate[] = [
  // Transitions
  { id: 'sfx-whoosh', name: 'Whoosh', category: 'transitions', durationMs: 500, description: 'Quick swoosh for scene changes' },
  { id: 'sfx-swoosh-soft', name: 'Soft Swoosh', category: 'transitions', durationMs: 400, description: 'Gentle transition sweep' },
  { id: 'sfx-page-turn', name: 'Page Turn', category: 'transitions', durationMs: 300, description: 'Paper page flip sound' },
  { id: 'sfx-chime', name: 'Chime', category: 'transitions', durationMs: 800, description: 'Musical chime for new scenes' },
  { id: 'sfx-reverse', name: 'Reverse', category: 'transitions', durationMs: 600, description: 'Tape rewind effect' },

  // Actions
  { id: 'sfx-pop', name: 'Pop', category: 'actions', durationMs: 200, description: 'Bubble pop for appearing elements' },
  { id: 'sfx-click', name: 'Click', category: 'actions', durationMs: 100, description: 'UI button click' },
  { id: 'sfx-ding', name: 'Ding', category: 'actions', durationMs: 400, description: 'Success notification bell' },
  { id: 'sfx-stamp', name: 'Stamp', category: 'actions', durationMs: 300, description: 'Heavy stamp/seal sound' },
  { id: 'sfx-typing', name: 'Typing', category: 'actions', durationMs: 2000, description: 'Keyboard typing sequence' },

  // Comedy
  { id: 'sfx-boing', name: 'Boing', category: 'comedy', durationMs: 500, description: 'Cartoon spring bounce' },
  { id: 'sfx-slide-whistle', name: 'Slide Whistle', category: 'comedy', durationMs: 800, description: 'Classic comedy slide whistle' },
  { id: 'sfx-rim-shot', name: 'Ba Dum Tss', category: 'comedy', durationMs: 1000, description: 'Drum rimshot for punchlines' },
  { id: 'sfx-record-scratch', name: 'Record Scratch', category: 'comedy', durationMs: 600, description: 'Vinyl record scratch — "wait what?"' },
  { id: 'sfx-sad-trombone', name: 'Sad Trombone', category: 'comedy', durationMs: 1500, description: 'Wah wah wahhhh' },

  // UI sounds
  { id: 'sfx-notification', name: 'Notification', category: 'ui', durationMs: 500, description: 'Phone notification ping' },
  { id: 'sfx-success', name: 'Success', category: 'ui', durationMs: 600, description: 'Level complete fanfare' },
  { id: 'sfx-error', name: 'Error', category: 'ui', durationMs: 400, description: 'Error buzzer sound' },
  { id: 'sfx-countdown', name: 'Countdown', category: 'ui', durationMs: 3000, description: '3-2-1 countdown beeps' },

  // Nature
  { id: 'sfx-bird', name: 'Bird Chirp', category: 'nature', durationMs: 1000, description: 'Single bird chirp' },
  { id: 'sfx-thunder', name: 'Thunder', category: 'nature', durationMs: 2000, description: 'Distant thunder rumble' },
  { id: 'sfx-rain', name: 'Rain', category: 'nature', durationMs: 5000, description: 'Gentle rain on window' },
  { id: 'sfx-wind', name: 'Wind', category: 'nature', durationMs: 3000, description: 'Breezy wind gust' },
  { id: 'sfx-ocean', name: 'Ocean Wave', category: 'nature', durationMs: 4000, description: 'Single ocean wave crash' },
]

export const SFX_CATEGORIES = [
  { id: 'transitions', label: 'Transitions', icon: '↔' },
  { id: 'actions', label: 'Actions', icon: '⚡' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'ui', label: 'UI', icon: '🔔' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
] as const
