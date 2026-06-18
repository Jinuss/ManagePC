const { ipcMain } = require('electron')
const { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey } = require('./utils/systemInfo')
const SystemMonitor = require('./utils/SystemMonitor')

let systemMonitor = null

function registerIpcHandlers() {
  ipcMain.handle('get-ssh-key', () => {
    return getSSHKey()
  })

  ipcMain.handle('get-system-info', () => {
    return getSystemInfo()
  })

  ipcMain.handle('get-network-info', () => {
    return getNetworkInfo()
  })

  ipcMain.handle('get-disk-usage', () => {
    return getDiskUsage()
  })

  ipcMain.handle('start-monitoring', (event, intervalMs = 1000) => {
    const window = event.sender.getOwnerBrowserWindow()
    
    if (systemMonitor) {
      systemMonitor.stop()
    }
    
    systemMonitor = new SystemMonitor()
    systemMonitor.start(window, intervalMs)
    
    return { success: true }
  })

  ipcMain.handle('stop-monitoring', () => {
    if (systemMonitor) {
      systemMonitor.stop()
      systemMonitor = null
    }
    return { success: true }
  })
}

module.exports = {
  registerIpcHandlers,
  getSystemMonitor: () => systemMonitor
}
