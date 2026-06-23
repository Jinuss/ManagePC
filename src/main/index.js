import { app } from 'electron'
import WindowManager from './windowManager.js'
import { registerIpcHandlers } from './ipcHandlers.js'

const windowManager = new WindowManager()

function initApp() {
  registerIpcHandlers()
  windowManager.createMainWindow()
}

app.whenReady().then(() => {
  initApp()

  app.on('activate', () => {
    if (windowManager.getMainWindow() === null) {
      windowManager.createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})