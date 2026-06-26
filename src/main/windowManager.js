import { app, BrowserWindow, nativeTheme } from 'electron'
import path from 'path'
import log from 'electron-log'
import { isMac, getIconPath } from './utils/helps'

app.setAppUserModelId('com.example.system-monitor')

const titleBarThemes = {
  light: {
    color: '#ffffff',
    symbolColor: '#333333',
    height: 32
  },
  dark: {
    color: '#2f3241',
    symbolColor: '#74b1be',
    height: 32
  }
}

class WindowManager {
  constructor() {
    this.mainWindow = null
    this.trayManager = null
    this.settingsWindow = null
    this.currentTheme = 'system'
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
      titleBarOverlay: titleBarThemes.dark,
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

    // 监听系统主题变化
    nativeTheme.on('updated', () => {
      if (this.currentTheme === 'system') {
        this.updateTitleBarTheme()
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

  createSettingsWindow() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.focus()
      return
    }

    const parentBounds = this.mainWindow ? this.mainWindow.getBounds() : { x: 0, y: 0 }

    this.settingsWindow = new BrowserWindow({
      width: 400,
      height: 480,
      icon: getIconPath(),
      autoHideMenuBar: true,
      frame: false,
      skipTaskbar: true,
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    })

    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      this.settingsWindow.loadURL('http://localhost:5173/windows/settings/index.html')
    } else {
      this.settingsWindow.loadFile(path.join(__dirname, '../renderer/windows/settings/index.html'))
    }

    this.settingsWindow.on('close', () => {
      this.settingsWindow = null
    })
  }

  closeSettingsWindow() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.close()
      this.settingsWindow = null
    }
  }

  getSettingsWindow() {
    return this.settingsWindow
  }

  setTheme(theme) {
    this.currentTheme = theme
    this.updateTitleBarTheme()
  }

  updateTitleBarTheme() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return
    }

    let themeKey = this.currentTheme
    if (themeKey === 'system') {
      themeKey = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    }

    const overlay = titleBarThemes[themeKey] || titleBarThemes.dark
    this.mainWindow.setTitleBarOverlay(overlay)
  }
}

export default WindowManager