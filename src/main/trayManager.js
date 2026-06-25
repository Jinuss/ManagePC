import { app, Tray, Menu } from 'electron'
import { getIconPath } from './utils/helps'

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
    this.tray = new Tray(getIconPath())

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

    // 点击托盘图标显示/隐藏窗口
    this.tray.on('click', () => {
      // if (!this.mainWindow.isVisible()) {
      this.showWindow()
      // }
    })
  }

  showWindow() {
    if (this.mainWindow) {
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