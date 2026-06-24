import { ipcMain } from 'electron'
import { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey, getBatteryInfo } from './utils/systemInfo.js'
import SystemMonitor from './utils/SystemMonitor.js'
import UpdateManager from './updateManager.js'

let systemMonitor = null
let updateManager = null

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

  ipcMain.handle('check-for-updates', () => {
    if (!updateManager) {
      updateManager = new UpdateManager()
    }

    return new Promise((resolve) => {
      updateManager.autoUpdater.once('update-not-available', () => {
        resolve({ status: 'no-update', message: '当前已是最新版本' })
      })

      updateManager.autoUpdater.once('update-available', (info) => {
        resolve({
          status: 'update-available',
          version: info.version,
          message: `发现新版本 ${info.version}`
        })
      })

      updateManager.checkForUpdates()
    })
  })
}

export function getSystemMonitor() {
  return systemMonitor
}

export function getUpdateManager() {
  return updateManager
}