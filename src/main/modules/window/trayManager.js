import { app, Tray, Menu } from 'electron'
import { getTrayIconPath, isMac } from '../../utils/helps'
import { log } from '../log/logManager.js'
import { setIsQuitting } from '../../index.js'
import fs from 'fs'

class TrayManager {
  constructor() {
    this.tray = null
    this.mainWindow = null
    this.windowManager = null
  }

  setWindowManager(windowManager) {
    this.windowManager = windowManager
  }

  init(mainWindow) {
    this.mainWindow = mainWindow
    this.createTray()
  }

  createTray() {
    try {
      log.info('createTray start')

      const iconPath = getTrayIconPath()

      log.info('iconPath=', iconPath)
      log.info('icon是否存在=', fs.existsSync(iconPath))

      this.tray = new Tray(iconPath)

      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示窗口',
          click: () => {
            this.showWindow()
          }
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          click: () => {
            this.quitApp()
          }
        }
      ])

      this.tray.setContextMenu(contextMenu)
      this.tray.setToolTip('System Monitor')

      if (isMac()) {
        this.tray.on('double-click', () => {
          this.showWindow()
        })
      } else {
        this.tray.on('click', () => {
          this.showWindow()
        })
      }

      log.info('createTray end')
    } catch (error) {
      log.error('createTray error', error)
    }
  }

  showWindow() {
    log.info('[TrayManager] showWindow called')
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      log.info('[TrayManager] mainWindow destroyed, recreating...')
      if (this.windowManager) {
        this.windowManager.createMainWindow()
        this.mainWindow = this.windowManager.getMainWindow()
        this.init(this.mainWindow)
        log.info('[TrayManager] mainWindow recreated')
      }
    }
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show()
      this.mainWindow.focus()
      log.info('[TrayManager] mainWindow shown and focused')
    }
  }

  hideWindow() {
    log.info('[TrayManager] hideWindow called')
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide()
      log.info('[TrayManager] mainWindow hidden')
    }
  }

  quitApp() {
    log.info('[TrayManager] quitApp called')
    setIsQuitting(true)
    if (this.tray) {
      this.tray.destroy()
      log.info('[TrayManager] tray destroyed')
    }
    app.quit()
  }

  getTray() {
    return this.tray
  }
}

export default TrayManager