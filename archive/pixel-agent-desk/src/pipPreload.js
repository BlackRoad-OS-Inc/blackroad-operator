/**
 * PiP Preload Script
 * Provides secure IPC bridge for PiP window
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pipAPI', {
  close: () => ipcRenderer.send('pip-close'),
  backToDashboard: () => ipcRenderer.send('pip-back-to-dashboard'),
});
