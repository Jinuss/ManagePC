const { app } = require('electron')
const WindowManager = require('./src/main/windowManager')
const { registerIpcHandlers } = require('./src/main/ipcHandlers')

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
