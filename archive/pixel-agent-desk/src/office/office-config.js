/**
 * Office Config — Constants, sprite frame map, seat configs, state mappings
 * Ported from pixel_office spriteSheet.ts, types.ts, seatConfigs.ts
 */

/* eslint-disable no-unused-vars */

// OFFICE constants — FRAME_W/H/COLS populated from sprite-frames.json at init
const OFFICE = {
  TILE_SIZE: 32,
  FRAME_W: 48,
  FRAME_H: 64,
  COLS: 8,
  ANIM_FPS: 8,
  ANIM_INTERVAL: 1000 / 8,
  IDLE_ANIM_INTERVAL: 1000 / 2,
  MOVE_SPEED: 110,
  ARRIVE_THRESHOLD: 2,
};

// SPRITE_FRAMES — office uses different key names (direction-based) than the raw JSON.
// Built from sprite-frames.json at init via loadSpriteFrames().
var SPRITE_FRAMES = {};

/** Fetch sprite frame definitions and build SPRITE_FRAMES + update OFFICE constants. */
async function loadSpriteFrames() {
  try {
    const res = await fetch('/public/shared/sprite-frames.json');
    const data = await res.json();
    const f = data.frames;

    OFFICE.FRAME_W = data.sheet.frameWidth;
    OFFICE.FRAME_H = data.sheet.frameHeight;
    OFFICE.COLS = data.sheet.cols;

    // Map canonical names → office direction-based keys
    SPRITE_FRAMES = {
      down_idle:      f.front_idle,
      walk_down:      f.front_walk,
      left_idle:      f.left_idle,
      walk_left:      f.left_walk,
      right_idle:     f.right_idle,
      walk_right:     f.right_walk,
      up_idle:        f.back_idle,
      walk_up:        f.back_walk,
      dance:          f.front_done_dance,
      alert_jump:     f.front_alert_jump,
      sit_down:       f.front_sit_idle,
      sit_left:       f.left_sit_idle,
      sit_right:      f.right_sit_idle,
      sit_up:         f.back_sit_idle,
      sit_work_down:  f.front_sit_work,
      sit_work_left:  f.left_sit_work,
      sit_work_right: f.right_sit_work,
      sit_work_up:    f.back_sit_work,
    };
  } catch (e) {
    console.error('[OfficeConfig] Failed to load sprite-frames.json:', e);
  }
}

// Animation keys that use the slower idle FPS (vs active/walk FPS)
const IDLE_ANIM_KEYS = new Set([
  'down_idle', 'left_idle', 'right_idle', 'up_idle',
  'sit_down', 'sit_left', 'sit_right', 'sit_up',
  'dance',
]);

// Seat direction/pose config (global ID → pose)
const SEAT_MAP = {
  10: { dir: 'right', animType: 'sit' },
  12: { dir: 'right', animType: 'sit' },
  18: { dir: 'right', animType: 'sit' },
  28: { dir: 'right', animType: 'sit' },

  11: { dir: 'left', animType: 'sit' },
  13: { dir: 'left', animType: 'sit' },
  19: { dir: 'left', animType: 'sit' },
  29: { dir: 'left', animType: 'sit' },

  24: { dir: 'up', animType: 'stand' },

  4:  { dir: 'up', animType: 'sit' },
  5:  { dir: 'up', animType: 'sit' },
  6:  { dir: 'up', animType: 'sit' },
  7:  { dir: 'up', animType: 'sit' },
  14: { dir: 'up', animType: 'sit' },
  15: { dir: 'up', animType: 'sit' },
};

function getSeatConfig(id) {
  return SEAT_MAP[id] || { dir: 'down', animType: 'sit' };
}

// Idle zone spot → resting animation ('dance' or sit direction)
const IDLE_SEAT_MAP = {
  18: 'right',
  28: 'right',
  24: 'dance',
  19: 'left',
  29: 'left',
  // all others default to 'down' (front_sit_idle)
};

// Dashboard status → office zone mapping
const STATE_ZONE_MAP = {
  'working':   'desk',
  'thinking':  'desk',
  'waiting':   'idle',
  'completed': 'idle',
  'help':      'desk',
  'error':     'desk',
};

// State colors for nametags (unified palette — synced with styles.css, dashboard.html)
const STATE_COLORS = {
  idle:      '#94a3b8',
  working:   '#f97316',
  thinking:  '#8b5cf6',
  meeting:   '#3b82f6',
  wandering: '#a855f7',
  error:     '#ef4444',
  done:      '#22c55e',
  completed: '#22c55e',
  waiting:   '#94a3b8',
  help:      '#ef4444',
};

// Loaded from public/shared/avatars.json at init time (single source of truth)
var AVATAR_FILES = [];

/** Fetch avatar list from shared JSON. Must be called before office init. */
async function loadAvatarFiles() {
  try {
    const res = await fetch('/public/shared/avatars.json');
    AVATAR_FILES = await res.json();
  } catch (e) {
    console.error('[OfficeConfig] Failed to load avatars.json, using fallback');
    AVATAR_FILES = ['avatar_0.webp'];
  }
}

/**
 * Deterministic avatar index from agentId (same result for same id, everywhere)
 * Used by both taskbar renderer and office to sync avatars.
 */
function avatarIndexFromId(id) {
  let hash = 0;
  const str = id || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // 32-bit int
  }
  return Math.abs(hash) % AVATAR_FILES.length;
}

// Laptop index → seat ID mapping
const LAPTOP_ID_MAP = {
  0: 10, 1: 8, 2: 9, 3: 11,
  4: 0, 5: 1, 6: 2, 7: 3,
  8: 12, 9: 14, 10: 15, 11: 13,
  12: 4, 13: 5, 14: 6, 15: 7,
};
