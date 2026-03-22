import { CharacterTemplate } from '@/lib/types'

// Little Miss / Mr. Men × Higgly Town Heroes hybrid style
// Simple round/oval shapes, bold colors, big expressions, tiny limbs
export const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  // === ORIGINAL CAST ===
  { id: 'miss-sunshine', name: 'Miss Sunshine', bodyColor: '#FFD93D', accentColor: '#FF6B6B', faceColor: '#FFE082', eyeColor: '#2D3436', size: 'medium', accessory: 'bow' },
  { id: 'mr-cool', name: 'Mr. Cool', bodyColor: '#74B9FF', accentColor: '#0984E3', faceColor: '#DFE6E9', eyeColor: '#2D3436', size: 'medium', accessory: 'glasses' },
  { id: 'miss-sparkle', name: 'Miss Sparkle', bodyColor: '#FD79A8', accentColor: '#E84393', faceColor: '#FFEAA7', eyeColor: '#2D3436', size: 'small', accessory: 'crown' },
  { id: 'mr-brave', name: 'Mr. Brave', bodyColor: '#E17055', accentColor: '#D63031', faceColor: '#FFEAA7', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'miss-dream', name: 'Miss Dream', bodyColor: '#A29BFE', accentColor: '#6C5CE7', faceColor: '#DFE6E9', eyeColor: '#2D3436', size: 'medium', accessory: 'headband' },
  { id: 'mr-jolly', name: 'Mr. Jolly', bodyColor: '#00B894', accentColor: '#00CEC9', faceColor: '#FFEAA7', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'miss-curious', name: 'Miss Curious', bodyColor: '#81ECEC', accentColor: '#00CEC9', faceColor: '#DFE6E9', eyeColor: '#2D3436', size: 'small', accessory: 'bow' },
  { id: 'mr-grumpy', name: 'Mr. Grumpy', bodyColor: '#636E72', accentColor: '#2D3436', faceColor: '#B2BEC3', eyeColor: '#2D3436', size: 'medium', accessory: 'none' },
  { id: 'miss-giggles', name: 'Miss Giggles', bodyColor: '#FDCB6E', accentColor: '#F39C12', faceColor: '#FFEAA7', eyeColor: '#2D3436', size: 'small', accessory: 'bow' },
  { id: 'mr-tiny', name: 'Mr. Tiny', bodyColor: '#55EFC4', accentColor: '#00B894', faceColor: '#DFE6E9', eyeColor: '#2D3436', size: 'small', accessory: 'hat' },
  { id: 'miss-chatterbox', name: 'Miss Chatterbox', bodyColor: '#FF7675', accentColor: '#D63031', faceColor: '#FAB1A0', eyeColor: '#2D3436', size: 'medium', accessory: 'headband' },
  { id: 'mr-strong', name: 'Mr. Strong', bodyColor: '#E74C3C', accentColor: '#C0392B', faceColor: '#FFEAA7', eyeColor: '#2D3436', size: 'large', accessory: 'none' },
  { id: 'miss-magic', name: 'Miss Magic', bodyColor: '#9B59B6', accentColor: '#8E44AD', faceColor: '#DFE6E9', eyeColor: '#6C5CE7', size: 'medium', accessory: 'crown' },
  { id: 'mr-messy', name: 'Mr. Messy', bodyColor: '#E056A0', accentColor: '#C44569', faceColor: '#F8B4C8', eyeColor: '#2D3436', size: 'medium', accessory: 'none' },
  { id: 'narrator', name: 'Narrator', bodyColor: '#34495E', accentColor: '#2C3E50', faceColor: '#BDC3C7', eyeColor: '#2D3436', size: 'large', accessory: 'glasses' },

  // === NEW CHARACTERS — Season 2 ===
  { id: 'miss-flash', name: 'Miss Flash', bodyColor: '#FF6B2B', accentColor: '#FF2255', faceColor: '#FFE0B2', eyeColor: '#2D3436', size: 'small', accessory: 'headband' },
  { id: 'mr-chill', name: 'Mr. Chill', bodyColor: '#00D4FF', accentColor: '#0097A7', faceColor: '#E0F7FA', eyeColor: '#2D3436', size: 'medium', accessory: 'glasses' },
  { id: 'miss-nova', name: 'Miss Nova', bodyColor: '#FF2255', accentColor: '#CC00AA', faceColor: '#FCE4EC', eyeColor: '#8844FF', size: 'medium', accessory: 'crown' },
  { id: 'mr-whiskers', name: 'Mr. Whiskers', bodyColor: '#FF9800', accentColor: '#E65100', faceColor: '#FFF3E0', eyeColor: '#4E342E', size: 'small', accessory: 'none' },
  { id: 'miss-pixel', name: 'Miss Pixel', bodyColor: '#00E676', accentColor: '#00C853', faceColor: '#E8F5E9', eyeColor: '#2D3436', size: 'small', accessory: 'glasses' },
  { id: 'mr-thunder', name: 'Mr. Thunder', bodyColor: '#311B92', accentColor: '#4527A0', faceColor: '#D1C4E9', eyeColor: '#FFC107', size: 'large', accessory: 'none' },
  { id: 'miss-breeze', name: 'Miss Breeze', bodyColor: '#80DEEA', accentColor: '#4DD0E1', faceColor: '#E0F7FA', eyeColor: '#00ACC1', size: 'medium', accessory: 'bow' },
  { id: 'mr-blaze', name: 'Mr. Blaze', bodyColor: '#FF5722', accentColor: '#BF360C', faceColor: '#FFCCBC', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'miss-melody', name: 'Miss Melody', bodyColor: '#CE93D8', accentColor: '#AB47BC', faceColor: '#F3E5F5', eyeColor: '#2D3436', size: 'medium', accessory: 'headband' },
  { id: 'mr-sketch', name: 'Mr. Sketch', bodyColor: '#90A4AE', accentColor: '#546E7A', faceColor: '#ECEFF1', eyeColor: '#2D3436', size: 'medium', accessory: 'glasses' },

  // === NEW CHARACTERS — Season 3: Professionals ===
  { id: 'dr-brain', name: 'Dr. Brain', bodyColor: '#1565C0', accentColor: '#0D47A1', faceColor: '#BBDEFB', eyeColor: '#2D3436', size: 'medium', accessory: 'glasses' },
  { id: 'chef-pepper', name: 'Chef Pepper', bodyColor: '#F44336', accentColor: '#D32F2F', faceColor: '#FFCDD2', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'captain-star', name: 'Captain Star', bodyColor: '#1B5E20', accentColor: '#2E7D32', faceColor: '#C8E6C9', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'miss-palette', name: 'Miss Palette', bodyColor: '#E91E63', accentColor: '#C2185B', faceColor: '#F8BBD0', eyeColor: '#4A148C', size: 'small', accessory: 'bow' },
  { id: 'professor-owl', name: 'Professor Owl', bodyColor: '#795548', accentColor: '#5D4037', faceColor: '#D7CCC8', eyeColor: '#FF6F00', size: 'medium', accessory: 'glasses' },
  { id: 'miss-byte', name: 'Miss Byte', bodyColor: '#00BCD4', accentColor: '#0097A7', faceColor: '#B2EBF2', eyeColor: '#2D3436', size: 'small', accessory: 'headband' },
  { id: 'coach-power', name: 'Coach Power', bodyColor: '#FF9800', accentColor: '#F57C00', faceColor: '#FFE0B2', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },

  // === NEW CHARACTERS — Season 4: Fantasy ===
  { id: 'princess-aurora', name: 'Princess Aurora', bodyColor: '#FFD700', accentColor: '#FFA000', faceColor: '#FFF8E1', eyeColor: '#4A148C', size: 'medium', accessory: 'crown' },
  { id: 'knight-valor', name: 'Knight Valor', bodyColor: '#9E9E9E', accentColor: '#616161', faceColor: '#F5F5F5', eyeColor: '#2D3436', size: 'large', accessory: 'hat' },
  { id: 'fairy-dewdrop', name: 'Fairy Dewdrop', bodyColor: '#E1BEE7', accentColor: '#CE93D8', faceColor: '#FCE4EC', eyeColor: '#7B1FA2', size: 'small', accessory: 'crown' },
  { id: 'wizard-frost', name: 'Wizard Frost', bodyColor: '#42A5F5', accentColor: '#1E88E5', faceColor: '#E3F2FD', eyeColor: '#0D47A1', size: 'medium', accessory: 'hat' },
  { id: 'dragon-ember', name: 'Dragon Ember', bodyColor: '#FF3D00', accentColor: '#DD2C00', faceColor: '#FF8A65', eyeColor: '#FFD600', size: 'large', accessory: 'none' },
  { id: 'elf-willow', name: 'Elf Willow', bodyColor: '#66BB6A', accentColor: '#43A047', faceColor: '#C8E6C9', eyeColor: '#1B5E20', size: 'small', accessory: 'headband' },
]
