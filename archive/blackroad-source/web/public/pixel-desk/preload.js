const { contextBridge, ipcRenderer } = require('electron');

// Define formatTime function directly
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Prevent listener accumulation — remove existing handlers before registering
function safeOn(channel, callback) {
  ipcRenderer.removeAllListeners(channel);
  ipcRenderer.on(channel, (event, data) => callback(data));
}

contextBridge.exposeInMainWorld('electronAPI', {
  formatTime: formatTime,
  resizeWindow: (size) => ipcRenderer.send('resize-window', size),
  rendererReady: () => ipcRenderer.send('renderer-ready'),

  // Agent events
  onAgentAdded: (cb) => safeOn('agent-added', cb),
  onAgentUpdated: (cb) => safeOn('agent-updated', cb),
  onAgentRemoved: (cb) => safeOn('agent-removed', cb),
  onAgentsCleaned: (cb) => safeOn('agents-cleaned', cb),

  // Error events
  onErrorOccurred: (cb) => safeOn('error-occurred', cb),

  // Agent queries
  getAllAgents: () => {
    ipcRenderer.send('get-all-agents');
    return new Promise(resolve => ipcRenderer.once('all-agents-response', (_, d) => resolve(d)));
  },
  getAvatars: () => {
    ipcRenderer.send('get-avatars');
    return new Promise(resolve => ipcRenderer.once('avatars-response', (_, d) => resolve(d)));
  },

  // Terminal focus (on agent click) - uses actual PID via agentId, returns success/failure
  focusTerminal: (agentId) => ipcRenderer.invoke('focus-terminal', agentId),

  // Mission Control Dashboard methods
  openWebDashboard: () => ipcRenderer.invoke('open-web-dashboard'),

  // Error Recovery methods
  executeRecoveryAction: (errorId, action) => ipcRenderer.invoke('execute-recovery-action', errorId, action)
});
