import { app, Tray, Menu } from 'electron'
import { getTrayIconPath, isMac } from '../../utils/helps'
import { log } from '../log/logManager.js'
import { setIsQuitting } from '../../index.js'
import fs from 'fs'

/** 托盘管理器类
 * 负责系统托盘图标的创建和菜单管理
 */
class TrayManager {
  constructor() {
    this.tray = null
    this.mainWindow = null
    this.windowManager = null
  }

    /** 设置窗口管理器引用
   * @param {WindowManager} windowManager - 窗口管理器实例
   */
  setWindowManager(windowManager) {
    this.windowManager = windowManager
  }

    /** 初始化托盘
   * @param {BrowserWindow} mainWindow - 主窗口实例
   */
  init(mainWindow) {
    this.mainWindow = mainWindow
    this.createTray()
  }

    /** 创建托盘图标和菜单
   */
  createTray() {
    try {
      log.info('createTray start')

      const iconPath = getTrayIconPath()

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

    /** 显示主窗口
   * 如果主窗口已销毁，重新创建
   */
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

    /** 隐藏主窗口
   */
  hideWindow() {
    log.info('[TrayManager] hideWindow called')
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide()
      log.info('[TrayManager] mainWindow hidden')
    }
  }

    /** 退出应用
   * 设置退出标志，销毁托盘，退出应用
   */
  quitApp() {
    log.info('[TrayManager] quitApp called')
    setIsQuitting(true)
    if (this.tray) {
      this.tray.destroy()
      log.info('[TrayManager] tray destroyed')
    }
    app.quit()
  }

    /** 获取托盘实例
   * @returns {Tray|null}
   */
  getTray() {
    return this.tray
  }
}

export default TrayManager