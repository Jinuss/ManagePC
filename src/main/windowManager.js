import { app, BrowserWindow } from 'electron'
import path from 'path'
import log from 'electron-log'
import { isMac, getIconPath } from './utils/helps'
import storeManager from './store'
import { APP_USER_MODEL_ID, WINDOW_DEFAULTS, THEME_DEFAULTS } from './constants'

app.setAppUserModelId(APP_USER_MODEL_ID)

class WindowManager {
  constructor() {
    this.mainWindow = null
    this.trayManager = null
    this.settingsWindow = null
    this.currentTheme = THEME_DEFAULTS.DEFAULT
    this.isAlwaysOnTop = false
    this.autoStart = false
  }

  setTrayManager(trayManager) {
    this.trayManager = trayManager
  }

  createMainWindow() {
    const savedBounds = storeManager.getWindowBounds()
    this.isAlwaysOnTop = storeManager.getAlwaysOnTop()
    
    const windowOptions = {
      width: savedBounds.width || WINDOW_DEFAULTS.MAIN_WIDTH,
      height: savedBounds.height || WINDOW_DEFAULTS.MAIN_HEIGHT,
      icon: getIconPath(),
      autoHideMenuBar: true,
      frame: false,
      alwaysOnTop: this.isAlwaysOnTop,
      webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    }

    if (savedBounds.x !== null && savedBounds.y !== null) {
      windowOptions.x = savedBounds.x
      windowOptions.y = savedBounds.y
    }

    this.mainWindow = new BrowserWindow(windowOptions)

    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.on('resize', () => {
      if (!this.mainWindow.isMaximized()) {
        const bounds = this.mainWindow.getBounds()
        storeManager.saveWindowBounds(bounds)
      }
    })

    this.mainWindow.on('move', () => {
      if (!this.mainWindow.isMaximized()) {
        const bounds = this.mainWindow.getBounds()
        storeManager.saveWindowBounds(bounds)
      }
    })

    this.mainWindow.on('close', (event) => {
      log.info('mainWindow close');

      const bounds = this.mainWindow.getBounds()
      storeManager.saveWindowBounds(bounds)

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

  createSettingsWindow() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.focus()
      return
    }

    this.settingsWindow = new BrowserWindow({
      width: WINDOW_DEFAULTS.SETTINGS_WIDTH,
      height: WINDOW_DEFAULTS.SETTINGS_HEIGHT,
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
  }

  minimizeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.minimize()
    }
  }

  maximizeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    }
  }

  closeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close()
    }
  }

  setAlwaysOnTop(onTop) {
    this.isAlwaysOnTop = onTop
    storeManager.setAlwaysOnTop(onTop)
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setAlwaysOnTop(onTop)
    }
    return { success: true }
  }

  getAlwaysOnTop() {
    return this.isAlwaysOnTop
  }

  setAutoStart(autoStart) {
    this.autoStart = autoStart
    storeManager.setAutoStart(autoStart)
    app.setLoginItemSettings({
      openAtLogin: autoStart
    })
    return { success: true }
  }

  getAutoStart() {
    return this.autoStart
  }
}

export default WindowManager
