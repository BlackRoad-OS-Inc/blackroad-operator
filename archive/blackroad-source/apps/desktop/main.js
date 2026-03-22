const { app, BrowserWindow, Tray, Menu, ipcMain, Notification } = require('electron')
const path = require('path')
const Store = require('electron-store')
const axios = require('axios')

const store = new Store()
let mainWindow
let tray

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile('index.html')

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Create system tray
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'))
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Dashboard', 
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createWindow()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quick Deploy',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('quick-deploy')
        }
      }
    },
    {
      label: 'View Stats',
      click: () => {
        fetchStats()
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        app.quit()
      }
    }
  ])
  
  tray.setToolTip('BlackRoad')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    } else {
      createWindow()
    }
  })
}

// Fetch stats from API
async function fetchStats() {
  const apiKey = store.get('apiKey')
  if (!apiKey) {
    new Notification({
      title: 'BlackRoad',
      body: 'Please login first'
    }).show()
    return
  }

  try {
    const response = await axios.get('https://api.blackroad.io/v1/analytics?range=7d', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    new Notification({
      title: 'BlackRoad Stats',
      body: `Requests: ${response.data.requests.toLocaleString()}\nUptime: ${response.data.uptime}%\nLatency: ${response.data.latency}ms`
    }).show()
  } catch (error) {
    new Notification({
      title: 'Error',
      body: 'Failed to fetch stats'
    }).show()
  }
}

// IPC handlers
ipcMain.handle('login', async (event, apiKey) => {
  store.set('apiKey', apiKey)
  return { success: true }
})

ipcMain.handle('deploy', async (event, config) => {
  const apiKey = store.get('apiKey')
  try {
    const response = await axios.post('https://api.blackroad.io/v1/deployments', config, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    new Notification({
      title: 'Deployment Success!',
      body: `${config.name} deployed successfully`
    }).show()
    
    return response.data
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('get-deployments', async () => {
  const apiKey = store.get('apiKey')
  try {
    const response = await axios.get('https://api.blackroad.io/v1/deployments', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    return response.data
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('get-analytics', async (event, range = '7d') => {
  const apiKey = store.get('apiKey')
  try {
    const response = await axios.get(`https://api.blackroad.io/v1/analytics?range=${range}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    return response.data
  } catch (error) {
    return { error: error.message }
  }
})

// Fleet health monitor — check Pi nodes
ipcMain.handle('get-fleet-health', async () => {
  const nodes = [
    { name: 'alice', ip: '192.168.4.49' },
    { name: 'cecilia', ip: '192.168.4.96' },
    { name: 'octavia', ip: '192.168.4.100' },
    { name: 'lucidia', ip: '192.168.4.38' },
    { name: 'aria', ip: '192.168.4.98' },
  ]
  
  const results = await Promise.allSettled(
    nodes.map(async (node) => {
      try {
        const res = await axios.get(`http://${node.ip}:7890/health`, { timeout: 3000 })
        return { ...node, alive: true, data: res.data }
      } catch {
        return { ...node, alive: false }
      }
    })
  )
  
  return results.map(r => r.status === 'fulfilled' ? r.value : { ...r.reason, alive: false })
})

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  createTray()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Auto-update notifications
setInterval(async () => {
  const apiKey = store.get('apiKey')
  if (apiKey) {
    try {
      const response = await axios.get('https://api.blackroad.io/v1/notifications', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      
      if (response.data.new && response.data.new.length > 0) {
        response.data.new.forEach(notif => {
          new Notification({
            title: notif.title,
            body: notif.message
          }).show()
        })
      }
    } catch (error) {
      // Silent fail
    }
  }
}, 60000)
