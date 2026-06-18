const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
  constructor() {
    this.mainWindow = null
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5500')
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
    }
    
    this.mainWindow.webContents.openDevTools()

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  getMainWindow() {
    return this.mainWindow
  }
}

module.exports = WindowManager
