/**
 * Agent Grid — add/update/remove Agent, updateGridLayout, resize
 */

import { SHEET, ANIM_SEQUENCES, stateConfig, lastAgents, agentStates, agentAvatars } from './config.js';
import { animationManager, playAnimation } from './animationManager.js';
import { updateAgentState, createAgentCard, createMiniAvatar } from './agentCard.js';

const agentGrid = document.getElementById('agent-grid');

// --- Satellite avatar helpers ---

const MINI_AVATAR_SCALE = 0.5;

/** Check if an agent should be rendered as a satellite (mini avatar inside parent) */
function isSatelliteCandidate(agent) {
  return !!(agent && (agent.isSubagent || (agent.isTeammate && agent.parentId)) && agent.parentId);
}

/** Find the parent card DOM element for a given agent */
function findParentCard(agent) {
  if (!agent || !agent.parentId) return null;
  return document.querySelector(`[data-agent-id="${agent.parentId}"]`);
}

/** Add a mini avatar into the parent card's satellite tray */
function addSatelliteAvatar(parentCard, agent) {
  const tray = parentCard.querySelector('.satellite-tray');
  if (!tray) return;

  // Avoid duplicates
  if (tray.querySelector(`[data-agent-id="${agent.id}"]`)) return;

  const mini = createMiniAvatar(agent);
  tray.appendChild(mini);

  // Start sprite animation at 50% scale
  const config = stateConfig[agent.state] || stateConfig['Waiting'];
  playAnimation(agent.id, mini, config.anim, MINI_AVATAR_SCALE);

  // Satellite added — card height changed, resize window
  requestDynamicResize();
}

/** Update a satellite mini avatar's state (border color, tooltip, animation) */
function updateSatelliteAvatar(parentCard, agent) {
  const tray = parentCard.querySelector('.satellite-tray');
  if (!tray) return false;

  const mini = tray.querySelector(`[data-agent-id="${agent.id}"]`);
  if (!mini) return false;

  const state = (agent.state || 'Waiting').toLowerCase();
  mini.dataset.state = state;

  // Update tooltip
  const label = agent.displayName || agent.agentType || 'Sub';
  mini.title = `${label} — ${agent.state || 'Waiting'}`;

  // Update animation
  const config = stateConfig[agent.state] || stateConfig['Waiting'];
  playAnimation(agent.id, mini, config.anim, MINI_AVATAR_SCALE);

  return true;
}

/** Remove a satellite mini avatar from the parent card */
function removeSatelliteAvatar(parentCard, agentId) {
  const tray = parentCard.querySelector('.satellite-tray');
  if (!tray) return false;

  const mini = tray.querySelector(`[data-agent-id="${agentId}"]`);
  if (!mini) return false;

  // Stop animation
  animationManager.stop(agentId);

  // Exit animation then remove
  mini.classList.add('removing');
  setTimeout(() => {
    mini.remove();
    // Satellite removed — card height changed, resize window
    requestDynamicResize();
  }, 200);

  return true;
}

/** Migrate existing standalone cards into satellites when a parent arrives late */
function migrateSatellites(parentCard, parentId) {
  // Find all standalone cards that should be children of this parent
  const cards = Array.from(agentGrid.querySelectorAll('.agent-card'));
  let migrated = false;

  cards.forEach(card => {
    const childId = card.dataset.agentId;
    if (childId === parentId) return; // skip self

    const agentData = lastAgents?.find(a => a.id === childId);
    if (!agentData || agentData.parentId !== parentId) return;
    if (!isSatelliteCandidate(agentData)) return;

    // Clean up the standalone card
    animationManager.stop(childId);
    const state = agentStates.get(childId);
    if (state) {
      if (state.interval) clearInterval(state.interval);
      if (state.timerInterval) clearInterval(state.timerInterval);
    }
    agentStates.delete(childId);
    card.remove();

    // Add as satellite
    addSatelliteAvatar(parentCard, agentData);
    migrated = true;
  });

  return migrated;
}

export function addAgent(agent) {
  if (!lastAgents.some(a => a.id === agent.id)) {
    lastAgents.push(agent);
  }

  // Check for existing DOM (satellite or card)
  if (document.querySelector(`[data-agent-id="${agent.id}"]`)) {
    return;
  }
  // Also check if already exists as mini-avatar inside a satellite tray
  if (document.querySelector(`.mini-avatar[data-agent-id="${agent.id}"]`)) {
    return;
  }

  // Route as satellite if parent card exists
  if (isSatelliteCandidate(agent)) {
    const parentCard = findParentCard(agent);
    if (parentCard) {
      addSatelliteAvatar(parentCard, agent);
      // No grid reflow needed — satellite is inside parent card
      return;
    }
    // Fallback: parent not yet arrived, create standalone card
  }

  const card = createAgentCard(agent);
  agentGrid.appendChild(card);

  updateAgentState(agent.id, card, agent);

  // If this is a parent, check if children arrived earlier and migrate them
  migrateSatellites(card, agent.id);

  updateGridLayout();
  requestDynamicResize();
}

export function updateAgent(agent) {
  // Capture previous data BEFORE updating lastAgents
  const prevData = lastAgents?.find(a => a.id === agent.id);

  const idx = lastAgents.findIndex(a => a.id === agent.id);
  if (idx > -1) {
    lastAgents[idx] = agent;
  } else {
    lastAgents.push(agent);
  }

  // Try updating as satellite first
  if (isSatelliteCandidate(agent)) {
    const parentCard = findParentCard(agent);
    if (parentCard && updateSatelliteAvatar(parentCard, agent)) {
      return; // Updated as satellite — no grid reflow
    }
  }

  const card = document.querySelector(`[data-agent-id="${agent.id}"]`);
  if (!card) return;

  // Detect agent type change (e.g., Main created via auto-create then switched to Sub via SubagentStart)
  const wasSubagent = card.classList.contains('is-subagent');
  const wasTeammate = card.classList.contains('is-teammate');
  const typeChanged = (!!agent.isSubagent !== wasSubagent) || (!!agent.isTeammate !== wasTeammate);

  const relationshipChanged = prevData && (
    prevData.parentId !== agent.parentId ||
    prevData.teamName !== agent.teamName
  );

  // Type changed to satellite candidate: migrate card -> satellite
  if ((typeChanged || relationshipChanged) && isSatelliteCandidate(agent)) {
    const parentCard = findParentCard(agent);
    if (parentCard) {
      // Remove standalone card and add as satellite
      animationManager.stop(agent.id);
      const state = agentStates.get(agent.id);
      if (state) {
        if (state.interval) clearInterval(state.interval);
        if (state.timerInterval) clearInterval(state.timerInterval);
      }
      agentStates.delete(agent.id);
      card.remove();

      addSatelliteAvatar(parentCard, agent);
      updateGridLayout();
      requestDynamicResize();
      return;
    }
  }

  updateAgentState(agent.id, card, agent);

  if (typeChanged || relationshipChanged) {
    updateGridLayout();
    requestDynamicResize();
  }
}

export function removeAgent(data) {
  // Try removing as satellite first
  const agentData = lastAgents?.find(a => a.id === data.id);
  if (agentData && isSatelliteCandidate(agentData)) {
    const parentCard = findParentCard(agentData);
    if (parentCard && removeSatelliteAvatar(parentCard, data.id)) {
      // Clean up state
      const state = agentStates.get(data.id);
      if (state) {
        if (state.interval) clearInterval(state.interval);
        if (state.timerInterval) clearInterval(state.timerInterval);
      }
      agentStates.delete(data.id);
      agentAvatars.delete(data.id);
      // No grid reflow — satellite removed inside parent
      return;
    }
  }

  const card = document.querySelector(`[data-agent-id="${data.id}"]`);
  if (!card) return;

  // Clean up satellite children inside this card (if this is a parent being removed)
  const tray = card.querySelector('.satellite-tray');
  if (tray) {
    const minis = tray.querySelectorAll('.mini-avatar');
    minis.forEach(mini => {
      const childId = mini.dataset.agentId;
      animationManager.stop(childId);
      const childState = agentStates.get(childId);
      if (childState) {
        if (childState.interval) clearInterval(childState.interval);
        if (childState.timerInterval) clearInterval(childState.timerInterval);
      }
      agentStates.delete(childId);
    });
  }

  // Clean up animation memory
  animationManager.stop(data.id);

  const state = agentStates.get(data.id);
  if (state) {
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = null;
    }
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }
  agentStates.delete(data.id);
  agentAvatars.delete(data.id);

  // Remove DOM element after exit animation
  card.classList.add('removing');
  setTimeout(() => {
    card.remove();
    updateGridLayout();
    requestDynamicResize();
  }, 250);
}

export function cleanupAgents(data) {
  updateGridLayout();
}

// --- Idle avatar for empty state (0 agents) ---
const idleContainer = document.getElementById('container');
const idleCharacter = document.getElementById('character');
const idleBubble = document.getElementById('speech-bubble');

export function startIdleAnimation() {
  if (!idleCharacter) return;
  const seq = ANIM_SEQUENCES.waiting;
  drawFrameOn(idleCharacter, seq.frames[0]);
  if (idleBubble) idleBubble.textContent = 'Waiting...';
}

export function showIdleAvatar(avatarFile) {
  if (!idleContainer) return;
  idleContainer.style.display = 'flex';
  if (idleCharacter && avatarFile) {
    idleCharacter.style.backgroundImage = `url('./public/characters/${avatarFile}')`;
  }
  startIdleAnimation();
}

function drawFrameOn(el, frameIndex) {
  if (!el) return;
  const col = frameIndex % SHEET.cols;
  const row = Math.floor(frameIndex / SHEET.cols);
  // Single character at 1x native (48x64, bg 384x576)
  const fw = 48;
  const fh = 64;
  el.style.backgroundPosition = `${col * -fw}px ${row * -fh}px`;
}

export function updateGridLayout() {
  const cards = Array.from(agentGrid.querySelectorAll('.agent-card'));
  if (cards.length === 0) {
    agentGrid.classList.remove('has-multiple');
    agentGrid.querySelectorAll('.agent-party-bg').forEach(el => el.remove());
    if (idleContainer) {
      if (!idleContainer.parentNode) {
        agentGrid.appendChild(idleContainer);
      }
      idleContainer.style.display = 'flex';
    }
    return;
  }

  if (idleContainer) idleContainer.style.display = 'none';
  agentGrid.classList.add('has-multiple');

  const cardDataList = cards.map(c => {
    return {
      card: c,
      data: lastAgents?.find(ag => ag.id === c.dataset.agentId) || { id: c.dataset.agentId }
    };
  });

  // Satellite children are inside parent cards, not in the grid.
  // Only main agents + orphan children (whose parent hasn't arrived yet) need grid cells.
  const gridCards = cardDataList.filter(item => {
    // If this agent is a satellite candidate and its parent card exists, skip it
    // (it should be inside the parent's tray, not standalone)
    if (isSatelliteCandidate(item.data)) {
      const parentCard = findParentCard(item.data);
      if (parentCard) return false;
    }
    return true;
  });

  const mains = gridCards.filter(item => !item.data.isSubagent && !item.data.isTeammate);
  const orphans = gridCards.filter(item => item.data.isSubagent || item.data.isTeammate);

  mains.sort((a, b) => (a.data.projectPath || '').localeCompare(b.data.projectPath || ''));

  // Combine sorted cards for placement
  const sorted = [...mains, ...orphans];

  // In-place grid position update (no DOM remove/re-insert to prevent flickering)
  let col = 1;
  let currentRow = 1;

  // Remove stale party backgrounds
  agentGrid.querySelectorAll('.agent-party-bg').forEach(el => el.remove());

  sorted.forEach(item => {
    if (col > 10) { col = 1; currentRow++; }

    item.card.classList.remove('group-start');
    item.card.style.gridColumn = col;
    item.card.style.gridRow = currentRow;

    // Only append if not already a child of agentGrid
    if (item.card.parentNode !== agentGrid) {
      agentGrid.appendChild(item.card);
    }

    col++;
  });

  // Remove cards that are no longer in the sorted set (e.g., migrated to satellite)
  const sortedIds = new Set(sorted.map(s => s.card.dataset.agentId));
  Array.from(agentGrid.querySelectorAll('.agent-card')).forEach(card => {
    if (!sortedIds.has(card.dataset.agentId)) {
      card.remove();
    }
  });
}

// Window resize — debounce (restarts on each call, uses latest size)
let _resizeTimer = null;
export function requestDynamicResize() {
  if (!window.electronAPI || !window.electronAPI.resizeWindow) return;
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    _resizeTimer = null;
    const grid = document.getElementById('agent-grid');
    if (!grid) return;
    const width = grid.scrollWidth;
    const height = grid.scrollHeight;
    if (width < 100 || height < 100) return;
    window.electronAPI.resizeWindow({ width, height });
  }, 100);
}
