import { app } from 'electron'
import WindowManager from './windowManager.js'
import { registerIpcHandlers } from './ipcHandlers.js'
import UpdateManager from './updateManager.js'
import TrayManager from './trayManager.js'

let windowManager = null
let updateManager = null
let trayManager = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    windowManager.createMainWindow()
    
    trayManager.init(windowManager.getMainWindow())
    windowManager.setTrayManager(trayManager)
    
    setTimeout(() => {
      updateManager.checkForUpdates()
    }, 3000)
  }

  app.whenReady().then(() => {
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
    if (trayManager) {
      trayManager.show()
    }
  })
}

export { updateManager, trayManager }