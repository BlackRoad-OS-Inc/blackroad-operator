import type { StickerTemplate } from '@/lib/types'

export const STICKER_TEMPLATES: StickerTemplate[] = [
  // Arrows
  { id: 'arrow-right', name: 'Arrow Right', emoji: '→', category: 'arrows' },
  { id: 'arrow-left', name: 'Arrow Left', emoji: '←', category: 'arrows' },
  { id: 'arrow-up', name: 'Arrow Up', emoji: '↑', category: 'arrows' },
  { id: 'arrow-down', name: 'Arrow Down', emoji: '↓', category: 'arrows' },
  { id: 'arrow-curved', name: 'Curved Arrow', emoji: '↪', category: 'arrows' },

  // Shapes
  { id: 'circle', name: 'Circle', emoji: '⬤', category: 'shapes' },
  { id: 'star', name: 'Star', emoji: '★', category: 'shapes' },
  { id: 'heart', name: 'Heart', emoji: '♥', category: 'shapes' },
  { id: 'diamond', name: 'Diamond', emoji: '◆', category: 'shapes' },
  { id: 'triangle', name: 'Triangle', emoji: '▲', category: 'shapes' },
  { id: 'square', name: 'Square', emoji: '■', category: 'shapes' },

  // Emojis
  { id: 'emoji-fire', name: 'Fire', emoji: '🔥', category: 'emojis' },
  { id: 'emoji-100', name: '100', emoji: '💯', category: 'emojis' },
  { id: 'emoji-star', name: 'Sparkles', emoji: '✨', category: 'emojis' },
  { id: 'emoji-rocket', name: 'Rocket', emoji: '🚀', category: 'emojis' },
  { id: 'emoji-lightning', name: 'Lightning', emoji: '⚡', category: 'emojis' },
  { id: 'emoji-check', name: 'Check', emoji: '✅', category: 'emojis' },
  { id: 'emoji-x', name: 'Cross', emoji: '❌', category: 'emojis' },
  { id: 'emoji-eyes', name: 'Eyes', emoji: '👀', category: 'emojis' },
  { id: 'emoji-clap', name: 'Clap', emoji: '👏', category: 'emojis' },
  { id: 'emoji-crown', name: 'Crown', emoji: '👑', category: 'emojis' },
  { id: 'emoji-brain', name: 'Brain', emoji: '🧠', category: 'emojis' },
  { id: 'emoji-bulb', name: 'Idea', emoji: '💡', category: 'emojis' },
  { id: 'emoji-party', name: 'Party', emoji: '🎉', category: 'emojis' },
  { id: 'emoji-target', name: 'Target', emoji: '🎯', category: 'emojis' },

  // Callouts
  { id: 'callout-new', name: 'NEW!', emoji: '🆕', category: 'callouts' },
  { id: 'callout-sale', name: 'SALE', emoji: '🏷️', category: 'callouts' },
  { id: 'callout-free', name: 'FREE', emoji: '🆓', category: 'callouts' },
  { id: 'callout-hot', name: 'HOT', emoji: '🔴', category: 'callouts' },
  { id: 'callout-tip', name: 'TIP', emoji: '💡', category: 'callouts' },
  { id: 'callout-warning', name: 'Warning', emoji: '⚠️', category: 'callouts' },

  // Badges
  { id: 'badge-1', name: '#1', emoji: '🥇', category: 'badges' },
  { id: 'badge-2', name: '#2', emoji: '🥈', category: 'badges' },
  { id: 'badge-3', name: '#3', emoji: '🥉', category: 'badges' },
  { id: 'badge-trophy', name: 'Trophy', emoji: '🏆', category: 'badges' },
  { id: 'badge-verified', name: 'Verified', emoji: '✓', category: 'badges' },

  // Effects
  { id: 'effect-explosion', name: 'Boom', emoji: '💥', category: 'effects' },
  { id: 'effect-sparkle', name: 'Sparkle', emoji: '⭐', category: 'effects' },
  { id: 'effect-confetti', name: 'Confetti', emoji: '🎊', category: 'effects' },
  { id: 'effect-music', name: 'Music', emoji: '🎵', category: 'effects' },
  { id: 'effect-speech', name: 'Speech', emoji: '💬', category: 'effects' },
  { id: 'effect-thought', name: 'Thought', emoji: '💭', category: 'effects' },
]

export const STICKER_CATEGORIES = [
  { id: 'arrows', label: 'Arrows', icon: '→' },
  { id: 'shapes', label: 'Shapes', icon: '★' },
  { id: 'emojis', label: 'Emojis', icon: '🔥' },
  { id: 'callouts', label: 'Callouts', icon: '🆕' },
  { id: 'badges', label: 'Badges', icon: '🏆' },
  { id: 'effects', label: 'Effects', icon: '💥' },
] as const
