import { BackgroundTemplate } from '@/lib/types'

export const BACKGROUND_TEMPLATES: BackgroundTemplate[] = [
  // === OUTDOOR SCENES ===
  { id: 'neighborhood', name: 'Neighborhood', skyColor: '#87CEEB', groundColor: '#90EE90', accentColor: '#228B22', elements: [
    { type: 'cloud', x: 0.15, y: 0.12, scale: 1 }, { type: 'cloud', x: 0.55, y: 0.08, scale: 1.3 }, { type: 'cloud', x: 0.85, y: 0.15, scale: 0.8 },
    { type: 'sun', x: 0.9, y: 0.08, scale: 1 }, { type: 'building', x: 0.1, y: 0.45, scale: 1, color: '#FF6B6B' }, { type: 'building', x: 0.3, y: 0.4, scale: 1.2, color: '#74B9FF' },
    { type: 'building', x: 0.7, y: 0.42, scale: 1.1, color: '#FDCB6E' }, { type: 'tree', x: 0.5, y: 0.5, scale: 1 }, { type: 'fence', x: 0.5, y: 0.72, scale: 1 },
  ]},
  { id: 'park', name: 'Sunny Park', skyColor: '#87CEEB', groundColor: '#7BC67E', accentColor: '#4CAF50', elements: [
    { type: 'sun', x: 0.85, y: 0.1, scale: 1.2 }, { type: 'cloud', x: 0.2, y: 0.1, scale: 1 }, { type: 'cloud', x: 0.6, y: 0.06, scale: 0.9 },
    { type: 'tree', x: 0.08, y: 0.4, scale: 1.3 }, { type: 'tree', x: 0.92, y: 0.42, scale: 1.1 },
    { type: 'flower', x: 0.25, y: 0.78, scale: 0.6 }, { type: 'flower', x: 0.4, y: 0.82, scale: 0.5 }, { type: 'flower', x: 0.65, y: 0.79, scale: 0.7 }, { type: 'hill', x: 0.5, y: 0.55, scale: 1 },
  ]},
  { id: 'beach', name: 'Beach', skyColor: '#4FC3F7', groundColor: '#FFE0B2', accentColor: '#0288D1', elements: [
    { type: 'sun', x: 0.85, y: 0.08, scale: 1.3 }, { type: 'cloud', x: 0.2, y: 0.12, scale: 0.9 }, { type: 'cloud', x: 0.5, y: 0.06, scale: 1 },
  ]},
  { id: 'forest', name: 'Enchanted Forest', skyColor: '#4CAF50', groundColor: '#2E7D32', accentColor: '#1B5E20', elements: [
    { type: 'tree', x: 0.05, y: 0.3, scale: 1.6 }, { type: 'tree', x: 0.2, y: 0.35, scale: 1.8 }, { type: 'tree', x: 0.4, y: 0.32, scale: 1.5 },
    { type: 'tree', x: 0.6, y: 0.38, scale: 1.7 }, { type: 'tree', x: 0.8, y: 0.3, scale: 1.9 }, { type: 'tree', x: 0.95, y: 0.35, scale: 1.4 },
    { type: 'flower', x: 0.3, y: 0.85, scale: 0.4 }, { type: 'flower', x: 0.7, y: 0.82, scale: 0.5 },
  ]},
  { id: 'mountain', name: 'Mountain Vista', skyColor: '#90CAF9', groundColor: '#8BC34A', accentColor: '#689F38', elements: [
    { type: 'cloud', x: 0.3, y: 0.05, scale: 1.4 }, { type: 'cloud', x: 0.7, y: 0.08, scale: 1 }, { type: 'sun', x: 0.9, y: 0.06, scale: 1 },
    { type: 'hill', x: 0.2, y: 0.35, scale: 2 }, { type: 'hill', x: 0.5, y: 0.3, scale: 2.5 }, { type: 'hill', x: 0.8, y: 0.38, scale: 1.8 },
    { type: 'tree', x: 0.15, y: 0.55, scale: 0.8 }, { type: 'tree', x: 0.85, y: 0.52, scale: 0.9 },
  ]},
  { id: 'farm', name: 'Farm', skyColor: '#87CEEB', groundColor: '#A5D6A7', accentColor: '#66BB6A', elements: [
    { type: 'sun', x: 0.85, y: 0.1, scale: 1 }, { type: 'cloud', x: 0.2, y: 0.08, scale: 1 }, { type: 'building', x: 0.2, y: 0.4, scale: 1.5, color: '#D32F2F' },
    { type: 'fence', x: 0.5, y: 0.68, scale: 1 }, { type: 'tree', x: 0.85, y: 0.45, scale: 1.2 },
    { type: 'flower', x: 0.6, y: 0.82, scale: 0.5 }, { type: 'flower', x: 0.75, y: 0.85, scale: 0.4 },
  ]},
  { id: 'desert', name: 'Desert', skyColor: '#FFB74D', groundColor: '#F9A825', accentColor: '#FF8F00', elements: [
    { type: 'sun', x: 0.5, y: 0.08, scale: 1.5 }, { type: 'hill', x: 0.2, y: 0.5, scale: 1.5 }, { type: 'hill', x: 0.7, y: 0.55, scale: 1.2 },
  ]},
  { id: 'arctic', name: 'Arctic', skyColor: '#B3E5FC', groundColor: '#E1F5FE', accentColor: '#81D4FA', elements: [
    { type: 'cloud', x: 0.15, y: 0.1, scale: 1.2 }, { type: 'cloud', x: 0.6, y: 0.06, scale: 1 },
    { type: 'hill', x: 0.3, y: 0.5, scale: 1.5 }, { type: 'hill', x: 0.7, y: 0.55, scale: 1.8 },
  ]},
  { id: 'jungle', name: 'Jungle', skyColor: '#66BB6A', groundColor: '#33691E', accentColor: '#1B5E20', elements: [
    { type: 'tree', x: 0.0, y: 0.2, scale: 2 }, { type: 'tree', x: 0.25, y: 0.25, scale: 2.2 }, { type: 'tree', x: 0.5, y: 0.2, scale: 2.5 },
    { type: 'tree', x: 0.75, y: 0.22, scale: 2 }, { type: 'tree', x: 1.0, y: 0.25, scale: 2.3 },
    { type: 'flower', x: 0.2, y: 0.8, scale: 0.8 }, { type: 'flower', x: 0.5, y: 0.85, scale: 0.6 }, { type: 'flower', x: 0.8, y: 0.82, scale: 0.7 },
  ]},
  { id: 'volcano', name: 'Volcano Island', skyColor: '#FF8A65', groundColor: '#795548', accentColor: '#4E342E', elements: [
    { type: 'hill', x: 0.5, y: 0.2, scale: 3 }, { type: 'cloud', x: 0.2, y: 0.05, scale: 1 }, { type: 'cloud', x: 0.7, y: 0.08, scale: 0.8 },
  ]},

  // === INDOOR SCENES ===
  { id: 'house-interior', name: 'Living Room', skyColor: '#FFF8E1', groundColor: '#D7CCC8', accentColor: '#8D6E63', elements: [
    { type: 'furniture', x: 0.15, y: 0.5, scale: 1, color: '#E17055' }, { type: 'furniture', x: 0.8, y: 0.55, scale: 0.8, color: '#00B894' },
  ]},
  { id: 'classroom', name: 'Classroom', skyColor: '#FFFDE7', groundColor: '#FFF9C4', accentColor: '#FBC02D', elements: [
    { type: 'furniture', x: 0.5, y: 0.3, scale: 1.5, color: '#4E342E' },
  ]},
  { id: 'kitchen', name: 'Kitchen', skyColor: '#FFF3E0', groundColor: '#FFE0B2', accentColor: '#E65100', elements: [
    { type: 'furniture', x: 0.2, y: 0.45, scale: 1.2, color: '#BCAAA4' }, { type: 'furniture', x: 0.75, y: 0.5, scale: 1, color: '#8D6E63' },
  ]},
  { id: 'library', name: 'Library', skyColor: '#EFEBE9', groundColor: '#D7CCC8', accentColor: '#5D4037', elements: [
    { type: 'furniture', x: 0.1, y: 0.3, scale: 1.5, color: '#4E342E' }, { type: 'furniture', x: 0.5, y: 0.3, scale: 1.5, color: '#5D4037' }, { type: 'furniture', x: 0.9, y: 0.3, scale: 1.5, color: '#6D4C41' },
  ]},
  { id: 'stage', name: 'Theater Stage', skyColor: '#1A1A2E', groundColor: '#8D6E63', accentColor: '#D32F2F', elements: [] },
  { id: 'studio-room', name: 'Recording Studio', skyColor: '#212121', groundColor: '#424242', accentColor: '#FF1D6C', elements: [] },

  // === SPECIAL SCENES ===
  { id: 'school', name: 'School', skyColor: '#B3E5FC', groundColor: '#CFD8DC', accentColor: '#78909C', elements: [
    { type: 'building', x: 0.5, y: 0.3, scale: 2, color: '#E57373' }, { type: 'cloud', x: 0.15, y: 0.1, scale: 0.8 }, { type: 'cloud', x: 0.75, y: 0.08, scale: 1.1 },
    { type: 'tree', x: 0.08, y: 0.5, scale: 1 }, { type: 'tree', x: 0.92, y: 0.48, scale: 1.2 },
  ]},
  { id: 'playground', name: 'Playground', skyColor: '#81D4FA', groundColor: '#C8E6C9', accentColor: '#66BB6A', elements: [
    { type: 'sun', x: 0.88, y: 0.1, scale: 1 }, { type: 'cloud', x: 0.3, y: 0.08, scale: 1.2 },
    { type: 'tree', x: 0.05, y: 0.4, scale: 1.4 }, { type: 'flower', x: 0.15, y: 0.8, scale: 0.5 }, { type: 'flower', x: 0.85, y: 0.78, scale: 0.6 },
  ]},
  { id: 'night-sky', name: 'Starry Night', skyColor: '#1A237E', groundColor: '#283593', accentColor: '#3F51B5', elements: [
    { type: 'moon', x: 0.8, y: 0.1, scale: 1 }, { type: 'star', x: 0.1, y: 0.08, scale: 0.5 }, { type: 'star', x: 0.25, y: 0.15, scale: 0.3 },
    { type: 'star', x: 0.4, y: 0.05, scale: 0.4 }, { type: 'star', x: 0.55, y: 0.18, scale: 0.3 }, { type: 'star', x: 0.7, y: 0.07, scale: 0.5 }, { type: 'star', x: 0.9, y: 0.2, scale: 0.35 },
    { type: 'hill', x: 0.3, y: 0.65, scale: 1.2 }, { type: 'hill', x: 0.7, y: 0.6, scale: 1.4 },
  ]},
  { id: 'space', name: 'Outer Space', skyColor: '#0D0D2B', groundColor: '#1A1A4E', accentColor: '#4A148C', elements: [
    { type: 'star', x: 0.05, y: 0.05, scale: 0.3 }, { type: 'star', x: 0.15, y: 0.2, scale: 0.5 }, { type: 'star', x: 0.3, y: 0.08, scale: 0.25 },
    { type: 'star', x: 0.45, y: 0.25, scale: 0.4 }, { type: 'star', x: 0.6, y: 0.1, scale: 0.35 }, { type: 'star', x: 0.75, y: 0.22, scale: 0.5 },
    { type: 'star', x: 0.88, y: 0.06, scale: 0.3 }, { type: 'star', x: 0.95, y: 0.18, scale: 0.45 }, { type: 'moon', x: 0.2, y: 0.15, scale: 1.5 },
  ]},
  { id: 'underwater', name: 'Underwater', skyColor: '#006064', groundColor: '#004D40', accentColor: '#00BCD4', elements: [
    { type: 'flower', x: 0.15, y: 0.85, scale: 1 }, { type: 'flower', x: 0.4, y: 0.82, scale: 0.8 }, { type: 'flower', x: 0.7, y: 0.88, scale: 1.2 }, { type: 'flower', x: 0.9, y: 0.84, scale: 0.9 },
  ]},
  { id: 'candy-land', name: 'Candy Land', skyColor: '#F8BBD0', groundColor: '#CE93D8', accentColor: '#AB47BC', elements: [
    { type: 'cloud', x: 0.2, y: 0.1, scale: 1, color: '#F48FB1' }, { type: 'cloud', x: 0.6, y: 0.05, scale: 1.2, color: '#F48FB1' },
    { type: 'tree', x: 0.1, y: 0.4, scale: 1.3 }, { type: 'tree', x: 0.9, y: 0.42, scale: 1.1 },
    { type: 'hill', x: 0.5, y: 0.55, scale: 1.5 },
  ]},
  { id: 'city-skyline', name: 'City Skyline', skyColor: '#FF7043', groundColor: '#37474F', accentColor: '#263238', elements: [
    { type: 'building', x: 0.1, y: 0.25, scale: 2, color: '#455A64' }, { type: 'building', x: 0.25, y: 0.2, scale: 2.5, color: '#546E7A' },
    { type: 'building', x: 0.4, y: 0.3, scale: 1.8, color: '#607D8B' }, { type: 'building', x: 0.55, y: 0.15, scale: 3, color: '#78909C' },
    { type: 'building', x: 0.7, y: 0.25, scale: 2.2, color: '#546E7A' }, { type: 'building', x: 0.85, y: 0.22, scale: 2, color: '#455A64' },
    { type: 'sun', x: 0.5, y: 0.05, scale: 1.5 },
  ]},
  { id: 'castle', name: 'Castle', skyColor: '#7986CB', groundColor: '#66BB6A', accentColor: '#43A047', elements: [
    { type: 'building', x: 0.5, y: 0.2, scale: 3, color: '#9E9E9E' }, { type: 'cloud', x: 0.15, y: 0.08, scale: 1 }, { type: 'cloud', x: 0.8, y: 0.05, scale: 1.3 },
    { type: 'tree', x: 0.05, y: 0.5, scale: 1.2 }, { type: 'tree', x: 0.95, y: 0.48, scale: 1 },
  ]},
  { id: 'rainbow', name: 'Rainbow Valley', skyColor: '#64B5F6', groundColor: '#81C784', accentColor: '#4CAF50', elements: [
    { type: 'sun', x: 0.85, y: 0.08, scale: 1.2 }, { type: 'cloud', x: 0.15, y: 0.1, scale: 1 }, { type: 'cloud', x: 0.4, y: 0.06, scale: 0.9 },
    { type: 'flower', x: 0.2, y: 0.82, scale: 0.6 }, { type: 'flower', x: 0.4, y: 0.85, scale: 0.5 }, { type: 'flower', x: 0.6, y: 0.8, scale: 0.7 }, { type: 'flower', x: 0.8, y: 0.84, scale: 0.5 },
    { type: 'hill', x: 0.3, y: 0.6, scale: 1 }, { type: 'hill', x: 0.7, y: 0.58, scale: 1.2 },
  ]},

  // === SOLID/GRADIENT COLORS (for clean overlays) ===
  { id: 'solid-black', name: 'Black', skyColor: '#000000', groundColor: '#000000', accentColor: '#333333', elements: [] },
  { id: 'solid-white', name: 'White', skyColor: '#FFFFFF', groundColor: '#F5F5F5', accentColor: '#E0E0E0', elements: [] },
  { id: 'gradient-sunset', name: 'Sunset Gradient', skyColor: '#FF6B2B', groundColor: '#CC00AA', accentColor: '#8844FF', elements: [] },
  { id: 'gradient-ocean', name: 'Ocean Gradient', skyColor: '#00D4FF', groundColor: '#0055FF', accentColor: '#4488FF', elements: [] },
  { id: 'gradient-neon', name: 'Neon', skyColor: '#FF2255', groundColor: '#8844FF', accentColor: '#FF1D6C', elements: [] },
  { id: 'gradient-mint', name: 'Mint', skyColor: '#00E676', groundColor: '#00BFA5', accentColor: '#1DE9B6', elements: [] },
]
