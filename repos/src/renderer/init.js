/**
 * Renderer Init — initialization, visibility handling
 */

import { AVATAR_FILES, lastAgents, agentStates } from './config.js';
import { playAnimation } from './animationManager.js';
import { addAgent, updateAgent, removeAgent, cleanupAgents, updateGridLayout, showIdleAvatar } from './agentGrid.js';
import { createWebDashboardButton, setupKeyboardShortcuts, setupContextMenu } from './uiComponents.js';
import { createErrorUI } from './errorUI.js';

let availableAvatars = [];
let idleAvatar = 'avatar_0.webp';

async function init() {
  if (!window.electronAPI) {
    console.error('[Renderer] electronAPI not available');
    return;
  }

  setupKeyboardShortcuts();
  setupContextMenu();

  // Load avatar list
  if (window.electronAPI.getAvatars) {
    try {
      const files = await window.electronAPI.getAvatars();
      const validFiles = files.filter(f => f.match(/\.(png|jpe?g|webp|gif)$/i));
      const zero = validFiles.find(f => f.includes('0.') || f.includes('_0.'));
      if (zero) idleAvatar = zero;

      availableAvatars = validFiles.filter(f => f !== idleAvatar);
      if (availableAvatars.length === 0 && idleAvatar) {
        availableAvatars.push(idleAvatar);
      }
    } catch (e) {
      console.warn('Failed to load avatars', e);
    }
  }

  // Display idle avatar
  showIdleAvatar(idleAvatar);

  // Dashboard button — floating overlay at bottom-right corner
  const toolbar = document.createElement('div');
  toolbar.className = 'avatar-toolbar';
  toolbar.appendChild(createWebDashboardButton());
  document.body.appendChild(toolbar);

  // Register event listeners
  window.electronAPI.onAgentAdded(addAgent);
  window.electronAPI.onAgentUpdated(updateAgent);
  window.electronAPI.onAgentRemoved(removeAgent);
  window.electronAPI.onAgentsCleaned(cleanupAgents);

  if (window.electronAPI.onErrorOccurred) {
    window.electronAPI.onErrorOccurred(createErrorUI);
  }

  // Load existing agents
  try {
    const agents = await window.electronAPI.getAllAgents();
    lastAgents.length = 0;
    lastAgents.push(...agents);
    for (const agent of agents) {
      addAgent(agent);
    }
    updateGridLayout();
  } catch (err) {
    console.error('[Renderer] Failed to load agents:', err);
  }

  window.electronAPI.rendererReady();
}

// --- Visibility handling ---
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    for (const [agentId, state] of agentStates.entries()) {
      if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
      }
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
    }
  } else {
    for (const [agentId, state] of agentStates.entries()) {
      if (state.animName) {
        const card = document.querySelector(`[data-agent-id="${agentId}"]`);
        const character = card?.querySelector('.agent-character');
        if (character) {
          const tempAnim = state.animName;
          state.animName = null;
          playAnimation(agentId, character, tempAnim);
        }
      }
    }
  }
});

// --- Start ---
init();
