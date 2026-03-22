module.exports = {
  app: {
    getPath: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    isReady: jest.fn(),
    whenReady: jest.fn()
  },
  BrowserWindow: jest.fn(),
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    invoke: jest.fn(),
    removeListener: jest.fn()
  },
  screen: {
    getPrimaryDisplay: jest.fn()
  },
  contextBridge: {
    exposeInMainWorld: jest.fn()
  }
};
