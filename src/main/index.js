import { app, ipcMain, BrowserWindow } from 'electron'
import WindowManager from './modules/window/windowManager.js'
import { registerIpcHandlers } from './modules/ipc/ipcHandlers.js'
import UpdateManager from './modules/update/updateManager.js'
import TrayManager from './modules/window/trayManager.js'
import storeManager from './store.js'
import logManager, { log } from './modules/log/logManager.js'
import { IPC_CHANNELS } from './constants'

log.initialize()

const gotTheLock = app.requestSingleInstanceLock()

let windowManager = null
let updateManager = null
let trayManager = null
let isQuitting = false

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow()
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  function initApp() {
    windowManager = new WindowManager()
    updateManager = new UpdateManager()
    trayManager = new TrayManager()

    registerIpcHandlers()
    
    ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS_WINDOW, () => {
      windowManager.createSettingsWindow()
      return { success: true }
    })
    
    ipcMain.handle(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW, () => {
      windowManager.closeSettingsWindow()
      return { success: true }
    })
    
    ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
      return app.getVersion()
    })

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

    ipcMain.handle(IPC_CHANNELS.GET_SAVED_THEME, () => {
      return { theme: storeManager.getTheme() }
    })

    ipcMain.handle(IPC_CHANNELS.GET_SAVED_LANGUAGE, () => {
      return { language: storeManager.getLanguage() }
    })

    ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          window.minimize()
        }
      }
      return { success: true }
    })

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

    ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          window.close()
        }
      }
      return { success: true }
    })

    ipcMain.handle(IPC_CHANNELS.IS_WINDOW_MAXIMIZED, () => {
      if (windowManager) {
        const window = windowManager.getMainWindow()
        if (window && !window.isDestroyed()) {
          return { maximized: window.isMaximized() }
        }
      }
      return { maximized: false }
    })

    ipcMain.handle(IPC_CHANNELS.SET_ALWAYS_ON_TOP, (event, onTop) => {
      if (windowManager) {
        return windowManager.setAlwaysOnTop(onTop)
      }
      return { success: false }
    })

    ipcMain.handle(IPC_CHANNELS.GET_ALWAYS_ON_TOP, () => {
  if (windowManager) {
    return { alwaysOnTop: windowManager.getAlwaysOnTop() }
  }
  return { alwaysOnTop: false }
})

ipcMain.handle(IPC_CHANNELS.SET_AUTO_START, (event, autoStart) => {
  if (windowManager) {
    return windowManager.setAutoStart(autoStart)
  }
  return { success: false }
})

ipcMain.handle(IPC_CHANNELS.GET_AUTO_START, () => {
  if (windowManager) {
    return { autoStart: windowManager.getAutoStart() }
  }
  return { autoStart: false }
})

    log.info('createMainWindow start')
    windowManager.createMainWindow()
    log.info('createMainWindow end')

    trayManager.init(windowManager.getMainWindow())
    trayManager.setWindowManager(windowManager)
    windowManager.setTrayManager(trayManager)

    setTimeout(() => {
      updateManager.checkForUpdatesAndNotify()
    }, 3000)
  }

  app.whenReady().then(() => {
    log.info('App whenReady');
    log.info('isPackaged=', app.isPackaged)
    initApp()

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

process.on('uncaughtException', (err) => {
  log.error('uncaughtException')
  log.error(err)
})

process.on('unhandledRejection', (err) => {
  log.error('unhandledRejection')
  log.error(err)
})

export function getWindowManager() {
  return windowManager
}

export function getUpdateManager() {
  return updateManager
}

export function getTrayManager() {
  return trayManager
}

export function setIsQuitting(value) {
  isQuitting = value
}

export function getIsQuitting() {
  return isQuitting
}