import { app, ipcMain, BrowserWindow } from 'electron'
import WindowManager from './modules/window/windowManager.js'
import { registerIpcHandlers } from './modules/ipc/ipcHandlers.js'
import UpdateManager from './modules/update/updateManager.js'
import TrayManager from './modules/window/trayManager.js'
import storeManager from './store.js'
import { log } from './modules/log/logManager.js'
import { IPC_CHANNELS } from './constants'
import { isMac } from './utils/helps.js'

// 初始化日志系统
log.initialize()


// 请求单实例锁，确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock()


// 全局管理器实例
let windowManager = null  // 窗口管理器
let updateManager = null  // 更新管理器
let trayManager = null    // 托盘管理器
let isQuitting = false    // 是否正在退出


// 如果没有获取到单实例锁，说明已有实例运行，直接退出
if (!gotTheLock) {
  app.quit()
} else {
  // 监听第二个实例启动事件，激活已有的主窗口
  app.on('second-instance', () => {
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow()
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })


  /** 初始化应用
   * 创建各管理器实例，注册 IPC 处理器，创建主窗口
   */
  function initApp() {
    windowManager = new WindowManager()
    updateManager = new UpdateManager()
    trayManager = new TrayManager()

    registerIpcHandlers({updateManager})

    
    // ============ 设置窗口相关 IPC ============
    // 打开设置窗口
    ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS_WINDOW, () => {
      windowManager.createSettingsWindow()
      return { success: true }
    })

    
    // 关闭设置窗口
    ipcMain.handle(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW, () => {
      windowManager.closeSettingsWindow()
      return { success: true }
    })

    
    // ============ 版本信息 IPC ============
    // 获取应用版本号
    ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
      return app.getVersion()
    })

    
    // ============ 主题设置 IPC ============
    // 设置应用主题，保存到配置并通知所有窗口
    ipcMain.handle(IPC_CHANNELS.SET_THEME, (event, theme) => {
      storeManager.setTheme(theme)
      windowManager.setTheme(theme)
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.THEME_CHANGED, theme)
        }
      })
      return { success: true }
    })
   
    // ============ 自动升级设置 IPC ============
    // 设置自动升级
    ipcMain.handle(IPC_CHANNELS.SET_AUTO_UPDATE, (event, autoUpdate) => {
      storeManager.setAutoUpdate(autoUpdate)
    })
    
    // 获取自动升级设置
    ipcMain.handle(IPC_CHANNELS.GET_AUTO_UPDATE, () => {
      return storeManager.getAutoUpdate()
    })
    
    // ============ 语言设置 IPC ============
    // 设置应用语言，保存到配置并通知所有窗口
    ipcMain.handle(IPC_CHANNELS.SET_LANGUAGE, (event, language) => {
      storeManager.setLanguage(language)
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.LANGUAGE_CHANGED, language)
        }
      })
      return { success: true }
    })

    
    // ============ 持久化设置读取 IPC ============
    // 获取保存的主题设置
    ipcMain.handle(IPC_CHANNELS.GET_SAVED_THEME, () => {
      return { theme: storeManager.getTheme() }
    })

    
    // 获取保存的语言设置
    ipcMain.handle(IPC_CHANNELS.GET_SAVED_LANGUAGE, () => {
      return { language: storeManager.getLanguage() }
    })

    
    // ============ 窗口控制 IPC ============
    // 最小化主窗口
    ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          window.minimize()
        }
      }
      return { success: true }
    })

    
    // 最大化/还原主窗口（切换状态）
    ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          if (window.isMaximized()) {
            window.unmaximize()
          } else {
            window.maximize()
          }
        }
      }
      return { success: true }
    })

    
    // 关闭主窗口（会触发 close 事件处理）
    ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          window.close()
        }
      }
      return { success: true }
    })

    
    // 检查主窗口是否最大化
    ipcMain.handle(IPC_CHANNELS.IS_WINDOW_MAXIMIZED, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          return { maximized: window.isMaximized() }
        }
      }
      return { maximized: false }
    })

    
    // ============ 窗口置顶 IPC ============
    // 设置主窗口是否始终置顶
    ipcMain.handle(IPC_CHANNELS.SET_ALWAYS_ON_TOP, (event, onTop) => {
      if (windowManager) {
        return windowManager.setAlwaysOnTop(onTop)
      }
      return { success: false }
    })

    
    // 获取主窗口是否始终置顶
    ipcMain.handle(IPC_CHANNELS.GET_ALWAYS_ON_TOP, () => {
      if (windowManager) {
        return { alwaysOnTop: windowManager.getAlwaysOnTop() }
      }
      return { alwaysOnTop: false }
    })

    
    // ============ 开机自启 IPC ============
    // 设置应用是否开机自启
    ipcMain.handle(IPC_CHANNELS.SET_AUTO_START, (event, autoStart) => {
      if (windowManager) {
        return windowManager.setAutoStart(autoStart)
      }
      return { success: false }
    })

    
    // 获取应用是否开机自启
    ipcMain.handle(IPC_CHANNELS.GET_AUTO_START, () => {
      if (windowManager) {
        return { autoStart: windowManager.getAutoStart() }
      }
      return { autoStart: false }
    })

    log.info('createMainWindow start')
    windowManager.createMainWindow()
    log.info('createMainWindow end')

    updateManager.setMainWindow(windowManager.getMainWindow())

    trayManager.init(windowManager.getMainWindow())
    trayManager.setWindowManager(windowManager)
    windowManager.setTrayManager(trayManager)

    if (app.isPackaged && isMac()) {
      // macos 平台在主线程中监听更新事件
      log.info('主动更新：checkForUpdates start')
      setTimeout(() => {
        updateManager.checkForUpdates()
      }, 3000)
    }
  }


  // 应用就绪后初始化
  app.whenReady().then(() => {
    log.info('App whenReady');
    log.info('isPackaged=', app.isPackaged)
    initApp()

    // macOS 特有：点击 Dock 图标时激活窗口
    app.on('activate', () => {
      if (windowManager && windowManager.getMainWindow() === null) {
        windowManager.createMainWindow()
        trayManager.init(windowManager.getMainWindow())
        trayManager.setWindowManager(windowManager)
        windowManager.setTrayManager(trayManager)
      }
      if (windowManager) {
        windowManager.showWindow()
      }
    })
  })


  // 所有窗口关闭时的处理
  app.on('window-all-closed', () => {
    log.info('window-all-closed start')
    log.info('trayManager exists=', !!trayManager);
    if (trayManager) {
      const tray = trayManager.getTray();
      log.info('tray exists=', !!tray);
      if (tray && !tray.isDestroyed()) {
        log.info('window-all-closed - keep app running with tray')
        return
      }
    }
    log.info('window-all-closed - quit app')
    app.quit()
  })
}



// ==================== 进程信号处理 ====================

// 处理 SIGTERM 信号（优雅关闭）
process.on('SIGTERM', () => {
  log.info('SIGTERM received, closing app')
  isQuitting = true
  if (trayManager) {
    const tray = trayManager.getTray()
    if (tray && !tray.isDestroyed()) {
      tray.destroy()
    }
  }
  app.quit()
})


// 处理 SIGINT 信号（Ctrl+C）
process.on('SIGINT', () => {
  log.info('SIGINT received, closing app')
  isQuitting = true
  if (trayManager) {
    const tray = trayManager.getTray()
    if (tray && !tray.isDestroyed()) {
      tray.destroy()
    }
  }
  app.quit()
})


// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  log.error('uncaughtException')
  log.error(err)
})


// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (err) => {
  log.error('unhandledRejection')
  log.error(err)
})


// ==================== 导出函数 ====================

/** 获取窗口管理器实例
 * @returns {WindowManager}
 */
export function getWindowManager() {
  return windowManager
}

/** 获取更新管理器实例
 * @returns {UpdateManager}
 */
export function getUpdateManager() {
  return updateManager
}

/** 获取托盘管理器实例
 * @returns {TrayManager}
 */
export function getTrayManager() {
  return trayManager
}

/** 设置退出标志
 * @param {boolean} value - 是否正在退出
 */
export function setIsQuitting(value) {
  isQuitting = value
}

/** 获取退出标志
 * @returns {boolean} - 是否正在退出
 */
export function getIsQuitting() {
  return isQuitting
}