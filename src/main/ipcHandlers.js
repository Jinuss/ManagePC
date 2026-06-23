import { ipcMain } from 'electron'
import { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey, getBatteryInfo } from './utils/systemInfo.js'
import SystemMonitor from './utils/SystemMonitor.js'

let systemMonitor = null

export function registerIpcHandlers() {
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

  ipcMain.handle('get-battery-info', () => {
    return getBatteryInfo()
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

export function getSystemMonitor() {
  return systemMonitor
}