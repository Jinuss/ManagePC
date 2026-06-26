import { app, ipcMain, BrowserWindow } from 'electron'
import WindowManager from './windowManager.js'
import { registerIpcHandlers } from './ipcHandlers.js'
import UpdateManager from './updateManager.js'
import TrayManager from './trayManager.js'
import log from 'electron-log'

log.initialize()

const gotTheLock = app.requestSingleInstanceLock()

let windowManager = null
let updateManager = null
let trayManager = null

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
    
    ipcMain.handle('open-settings-window', () => {
      windowManager.createSettingsWindow()
      return { success: true }
    })
    
    ipcMain.handle('close-settings-window', () => {
      windowManager.closeSettingsWindow()
      return { success: true }
    })
    
    ipcMain.handle('get-app-version', () => {
      const pkg = require('../package.json')
      return pkg.version || '1.0.0'
    })

    ipcMain.handle('set-theme', (event, theme) => {
      windowManager.setTheme(theme)
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('theme-changed', theme)
        }
      })
      return { success: true }
    })

    ipcMain.handle('set-language', (event, language) => {
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('language-changed', language)
        }
      })
      return { success: true }
    })

    log.info('createMainWindow start')
    windowManager.createMainWindow()
    log.info('createMainWindow end')

    trayManager.init(windowManager.getMainWindow())
    windowManager.setTrayManager(trayManager)

    setTimeout(() => {
      updateManager.checkForUpdates()
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
        windowManager.setTrayManager(trayManager)
      }
      if (windowManager) {
        windowManager.showWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    log.info('window-all-closed start')
    if (process.platform !== 'darwin') {
      log.info('trayManager exists=', !!trayManager);
      if (trayManager) {
        const tray = trayManager.getTray();
        log.info('tray exists=', !!tray);
        if (tray && !tray.isDestroyed()) {
          log.info('window-all-closed fail')
          return
        }
      }
      log.info('window-all-closed end')
      app.quit()
    }
  })
}


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