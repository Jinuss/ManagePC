import { app, BrowserWindow } from 'electron'
import path from 'path'
import log from 'electron-log'
import { isMac, getIconPath } from './utils/helps'

app.setAppUserModelId('com.example.system-monitor')

class WindowManager {
  constructor() {
    this.mainWindow = null
    this.trayManager = null
  }

  setTrayManager(trayManager) {
    this.trayManager = trayManager
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      icon: getIconPath(),
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#2f3241',        // 标题栏按钮区背景（Win/Linux）
        symbolColor: '#74b1be',  // 按钮符号颜色（Win）
        height: 32               // 标题栏高度
      },
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

    // 拦截关闭事件，最小化到托盘
    this.mainWindow.on('close', (event) => {
      log.info('mainWindow close');

      log.info('trayManager exists=', !!this.trayManager);
      log.info('tray exists=', !!this.trayManager.getTray());
      if (this.trayManager && !isMac()) {
        log.info('isDestroyed=', this.mainWindow.isDestroyed());
        if (!this.mainWindow.isDestroyed()) {
          log.info('close')
          event.preventDefault()
          this.mainWindow.hide()
        }
      }
    })
  }

  getMainWindow() {
    return this.mainWindow
  }

  showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }
}

export default WindowManager