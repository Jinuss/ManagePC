import { app, BrowserWindow } from 'electron'
import path from 'path'
import { log } from '../log/logManager.js'
import { isMac, getIconPath } from '../../utils/helps'
import storeManager from '../../store'
import { APP_USER_MODEL_ID, WINDOW_DEFAULTS, THEME_DEFAULTS, IPC_CHANNELS } from '../../constants'
import { getIsQuitting } from '../../index.js'

app.setAppUserModelId(APP_USER_MODEL_ID)

/** 窗口管理器类
 * 负责主窗口和设置窗口的创建、管理和控制
 */
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

  /** 设置托盘管理器引用
 * @param {TrayManager} trayManager - 托盘管理器实例
 */
  setTrayManager(trayManager) {
    this.trayManager = trayManager
  }

  /** 创建主窗口
 * 恢复上次保存的窗口尺寸和位置，加载渲染进程
 */
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
      minWidth: WINDOW_DEFAULTS.MIN_WIDTH,
      minHeight: WINDOW_DEFAULTS.MIN_HEIGHT,
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

    if (!app.isPackaged) {
      this.mainWindow.loadURL('http://localhost:5173')
      log.info('[WindowManager] Loading dev URL')
      this.mainWindow.webContents.openDevTools();
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

  /** 获取主窗口实例
 * @returns {BrowserWindow|null}
 */
  getMainWindow() {
    return this.mainWindow
  }

  /** 显示主窗口
 */
  showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  /** 创建设置窗口
 * 如果设置窗口已存在，则聚焦到该窗口
 */
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
      // resizable: false,
      skipTaskbar: true,
      webPreferences: {
        devTools: true,
        backgroundThrottling: false,
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    })

    if (!app.isPackaged) {
      this.settingsWindow.loadURL('http://localhost:5173/windows/settings/index.html')
      this.settingsWindow.webContents.openDevTools()
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

  /** 打开设置窗口的 DevTools
 */
  openSettingsDevTools() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.webContents.openDevTools()
    }
  }

  /** 关闭设置窗口
 */
  closeSettingsWindow() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.close();
      this.settingsWindow = null
    }
  }

  /** 获取设置窗口实例
 * @returns {BrowserWindow|null}
 */
  getSettingsWindow() {
    return this.settingsWindow
  }

  /** 设置当前主题
 * @param {string} theme - 主题名称
 */
  setTheme(theme) {
    this.currentTheme = theme
  }

  /** 最小化主窗口
 */
  minimizeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.minimize()
    }
  }

  /** 最大化/还原主窗口
 */
  maximizeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    }
  }

  /** 关闭主窗口
 */
  closeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close()
    }
  }

  /** 设置主窗口是否置顶
 * @param {boolean} onTop - 是否置顶
 * @returns {Object} - { success: boolean }
 */
  setAlwaysOnTop(onTop) {
    this.isAlwaysOnTop = onTop
    storeManager.setAlwaysOnTop(onTop)
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setAlwaysOnTop(onTop)
    }
    return { success: true }
  }

  /** 获取主窗口是否置顶
 * @returns {boolean}
 */
  getAlwaysOnTop() {
    return this.isAlwaysOnTop
  }

  /** 设置开机自启
 * @param {boolean} autoStart - 是否自启
 * @returns {Object} - { success: boolean }
 */
  setAutoStart(autoStart) {
    this.autoStart = autoStart
    storeManager.setAutoStart(autoStart)
    app.setLoginItemSettings({
      openAtLogin: autoStart
    })
    return { success: true }
  }

  /** 获取开机自启设置
 * @returns {boolean}
 */
  getAutoStart() {
    return this.autoStart
  }
}

export default WindowManager
