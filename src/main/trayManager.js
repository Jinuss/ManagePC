import { app, Tray, Menu } from 'electron'
import { getIconPath, isMac } from './utils/helps'
import log from 'electron-log'
import fs from 'fs'

class TrayManager {
  constructor() {
    this.tray = null
    this.mainWindow = null
  }

  init(mainWindow) {
    this.mainWindow = mainWindow
    this.createTray()
  }

  createTray() {
    try {
      log.info('createTray start')

      const iconPath = getIconPath()

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
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  hideWindow() {
    if (this.mainWindow) {
      this.mainWindow.hide()
    }
  }

  quitApp() {
    if (this.tray) {
      this.tray.destroy()
    }
    if (this.mainWindow) {
      this.mainWindow.close()
    }
    app.quit()
  }

  getTray() {
    return this.tray
  }
}

export default TrayManager