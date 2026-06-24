import { app, Tray, Menu, nativeImage } from 'electron'

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
    // 创建一个简单的图标（使用 base64 编码的简单图标）
    const icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAiklEQVRYR+2W0Q6AIAhEe7/1uYWFhYWFhYWFhYWFhYeHh4eHh4eHh4eHh4eHh4eHh4uLj4uLj4uLj4uLj4eHh4eHh4eHh4eHh4eHhYWFhYWFhYWFhYWFhYWBw=='.repeat(20)
    )

    this.tray = new Tray(icon)

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