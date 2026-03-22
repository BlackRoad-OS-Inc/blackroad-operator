/**
 * Renderer Config — constants, sprite settings, state maps
 */

// Single source of truth
import AVATAR_FILES_DATA from '../../public/shared/avatars.json' with { type: 'json' };
import SPRITE_DATA from '../../public/shared/sprite-frames.json' with { type: 'json' };

// --- Sprite sheet settings (from shared JSON) ---
export const SHEET = {
  cols: SPRITE_DATA.sheet.cols,
  width: SPRITE_DATA.sheet.frameWidth,
  height: SPRITE_DATA.sheet.frameHeight
};

// --- Animation sequences (mapped from shared frame definitions) ---
const F = SPRITE_DATA.frames;
export const ANIM_SEQUENCES = {
  working:  { frames: F.front_done_dance, fps: 8, loop: true },
  complete: { frames: F.front_alert_jump, fps: 4, loop: true },
  waiting:  { frames: F.front_idle,       fps: 4, loop: true },
  alert:    { frames: F.front_alert_jump, fps: 4, loop: true },
};

// --- State-to-config mapping ---
export const stateConfig = {
  'Working': { anim: 'working', class: 'state-working', label: 'Working...' },
  'Thinking': { anim: 'working', class: 'state-working', label: 'Thinking...' },
  'Done': { anim: 'complete', class: 'state-complete', label: 'Done!' },
  'Waiting': { anim: 'waiting', class: 'state-waiting', label: 'Waiting...' },
  'Error': { anim: 'alert', class: 'state-alert', label: 'Error!' },
  'Help': { anim: 'alert', class: 'state-alert', label: 'Help!' },
  'Offline': { anim: 'waiting', class: 'state-offline', label: 'Offline' }
};

// --- Shared agent data ---
export const lastAgents = [];

// --- Per-agent state management ---
export const agentStates = new Map();

// --- Avatar management ---
// Loaded from public/shared/avatars.json (single source of truth)
export const AVATAR_FILES = AVATAR_FILES_DATA;
export const agentAvatars = new Map();

/** Agent ID -> deterministic avatar filename (produces same result as office view) */
export function avatarFromAgentId(id) {
  let hash = 0;
  const str = id || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_FILES[Math.abs(hash) % AVATAR_FILES.length];
}
