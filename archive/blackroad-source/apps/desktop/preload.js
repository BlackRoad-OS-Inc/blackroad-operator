const { contextBridge, ipcRenderer } = require('electron')

// Expose secure API to renderer
contextBridge.exposeInMainWorld('blackroad', {
  login: (apiKey) => ipcRenderer.invoke('login', apiKey),
  deploy: (config) => ipcRenderer.invoke('deploy', config),
  getDeployments: () => ipcRenderer.invoke('get-deployments'),
  getAnalytics: (range) => ipcRenderer.invoke('get-analytics', range),
  onQuickDeploy: (callback) => ipcRenderer.on('quick-deploy', callback),
  onNotification: (callback) => ipcRenderer.on('notification', callback),
})
