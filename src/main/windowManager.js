import { BrowserWindow } from 'electron'
import path from 'path'

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
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    })

    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // this.mainWindow.webContents.openDevTools()

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  getMainWindow() {
    return this.mainWindow
  }
}

export default WindowManager
