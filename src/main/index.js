import { app } from 'electron'
import WindowManager from './windowManager.js'
import { registerIpcHandlers } from './ipcHandlers.js'
import UpdateManager from './updateManager.js'

const windowManager = new WindowManager()
const updateManager = new UpdateManager()

function initApp() {
  registerIpcHandlers()
  windowManager.createMainWindow()
  
  // 启动后3秒自动检查更新
  setTimeout(() => {
    updateManager.checkForUpdates()
  }, 3000)
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

export { updateManager }