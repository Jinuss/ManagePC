import { app, BrowserWindow } from 'electron'
import path from 'path'
import { log } from '../log/logManager.js'
import { isMac, getIconPath } from '../../utils/helps'
import storeManager from '../../store'
import { APP_USER_MODEL_ID, WINDOW_DEFAULTS, THEME_DEFAULTS, IPC_CHANNELS } from '../../constants'
import { getIsQuitting } from '../../index.js'

app.setAppUserModelId(APP_USER_MODEL_ID)

class WindowManager {
  constructor() {
    this.mainWindow = null
    this.trayManager = null
    this.settingsWindow = null
    this.currentTheme = THEME_DEFAULTS.DEFAULT
    this.isAlwaysOnTop = false
    this.autoStart = false
    this.baseOptions = {};
    if (isMac()) {
      this.baseOptions = {
        frame: true,
        transparent: true,
        titleBarStyle: 'hidden',
      }
    } else {
      this.baseOptions = {
        frame: false,
      }
    }
  }

  setTrayManager(trayManager) {
    this.trayManager = trayManager
  }

  createMainWindow() {
    log.info('[WindowManager] Creating main window')
    const savedBounds = storeManager.getWindowBounds()
    this.isAlwaysOnTop = storeManager.getAlwaysOnTop()
    log.info('[WindowManager] Saved bounds:', savedBounds)
    log.info('[WindowManager] Always on top:', this.isAlwaysOnTop)

    const windowOptions = {
      ...this.baseOptions,
      width: savedBounds.width || WINDOW_DEFAULTS.MAIN_WIDTH,
      height: savedBounds.height || WINDOW_DEFAULTS.MAIN_HEIGHT,
      icon: getIconPath(),
      autoHideMenuBar: true,
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
    log.info('[WindowManager] Main window created')

    const isDev = process.env.NODE_ENV === 'development'
    log.info('[WindowManager] Is development:', isDev)

    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      log.info('[WindowManager] Loading dev URL')
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
      log.info('[WindowManager] Loading production file')
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

    this.mainWindow.on('minimize', () => {
      log.info('[WindowManager] Main window minimized')
      if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
        log.info('[WindowManager] Closing settings window on main minimize')
        this.settingsWindow.close()
        this.settingsWindow = null
      }
    })

    this.mainWindow.on('close', (event) => {
      log.info('mainWindow close');

      const bounds = this.mainWindow.getBounds()
      storeManager.saveWindowBounds(bounds)

      if (getIsQuitting()) {
        log.info('close - isQuitting=true, allowing close')
      } else {
        log.info('trayManager exists=', !!this.trayManager);
        log.info('tray exists=', !!this.trayManager?.getTray());

        if (this.trayManager && this.trayManager.getTray() && !this.trayManager.getTray().isDestroyed()) {
          log.info('close - hide window instead of quit')
          if (!this.mainWindow.isDestroyed()) {
            event.preventDefault()
            this.mainWindow.hide()
          }
        }
      }

      if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
        log.info('[WindowManager] Closing settings window on main close')
        this.settingsWindow.close()
        this.settingsWindow = null
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
    log.info('[WindowManager] Creating settings window')
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      log.info('[WindowManager] Settings window already exists, focusing')
      this.settingsWindow.focus()
      return
    }
    this.settingsWindow = new BrowserWindow({
      width: WINDOW_DEFAULTS.SETTINGS_WIDTH,
      height: WINDOW_DEFAULTS.SETTINGS_HEIGHT,
      icon: getIconPath(),
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      webPreferences: {
        devTools: true,
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

    this.settingsWindow.on('blur', () => {
      this.settingsWindow.webContents.send(IPC_CHANNELS.WINDOW_BLUR)
    })

    this.settingsWindow.on('focus', () => {
      this.settingsWindow.webContents.send(IPC_CHANNELS.WINDOW_FOCUS)
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
