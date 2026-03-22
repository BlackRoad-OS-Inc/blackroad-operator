/**
 * Office Init — Entry point: agent sync, render loop start
 * SSE events are received from dashboard's connectSSE() — no separate connection needed.
 */

/* eslint-disable no-unused-vars */

var officeInitialized = false;

async function initOffice() {
  if (officeInitialized) {
    officeRenderer.resume();
    return;
  }

  // Load shared config before anything else
  await Promise.all([loadAvatarFiles(), loadSpriteFrames()]);

  const canvas = document.getElementById('office-canvas');
  if (!canvas) return;

  // Show loading indicator
  const container = canvas.parentElement;
  let loadingEl = container.querySelector('.office-loading');
  if (!loadingEl) {
    loadingEl = document.createElement('div');
    loadingEl.className = 'office-loading';
    loadingEl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);color:#fff;font-size:14px;z-index:10;';
    loadingEl.textContent = 'Loading Office...';
    container.style.position = 'relative';
    container.appendChild(loadingEl);
  }

  try {
    await officeRenderer.init(canvas);
  } catch (e) {
    console.error('[Office] Init failed:', e);
    if (loadingEl) loadingEl.textContent = 'Failed to load office view';
    return;
  }

  // Load existing agents
  try {
    const res = await fetch('/api/agents');
    const agents = await res.json();
    agents.forEach(function (a) {
      officeCharacters.addCharacter(a);
    });
  } catch (e) {
    console.error('[Office] Failed to fetch agents:', e);
  }

  // Remove loading indicator
  if (loadingEl) loadingEl.remove();

  officeInitialized = true;
}

/** Called from dashboard SSE agent.created handler */
function officeOnAgentCreated(data) {
  if (officeInitialized) officeCharacters.addCharacter(data);
}

/** Called from dashboard SSE agent.updated handler */
function officeOnAgentUpdated(data) {
  if (officeInitialized) officeCharacters.updateCharacter(data);
}

/** Called from dashboard SSE agent.removed handler */
function officeOnAgentRemoved(data) {
  if (officeInitialized) officeCharacters.removeCharacter(data.id);
}

function stopOffice() {
  officeRenderer.stop();
}

function resumeOffice() {
  if (officeInitialized) {
    officeRenderer.resume();
  }
}
