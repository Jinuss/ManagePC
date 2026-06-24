import { app } from 'electron'
import WindowManager from './windowManager.js'
import { registerIpcHandlers } from './ipcHandlers.js'
import UpdateManager from './updateManager.js'
import TrayManager from './trayManager.js'

const windowManager = new WindowManager()
const updateManager = new UpdateManager()
const trayManager = new TrayManager()

function initApp() {
  registerIpcHandlers()
  windowManager.createMainWindow()
  
  // 初始化托盘管理器
  trayManager.init(windowManager.getMainWindow())
  windowManager.setTrayManager(trayManager)
  
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
      trayManager.init(windowManager.getMainWindow())
      windowManager.setTrayManager(trayManager)
    }
    windowManager.showWindow()
  })
})

app.on('window-all-closed', () => {
  // 在有托盘的情况下，不自动退出应用
  // 退出由托盘菜单的"退出"选项处理
  if (trayManager) {
    trayManager.show()
  }
})

export { updateManager, trayManager }