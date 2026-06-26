import { ipcMain } from 'electron'
import { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey, getBatteryInfo } from './utils/systemInfo.js'
import SystemMonitor from './utils/SystemMonitor.js'
import UpdateManager from './updateManager.js'
import { IPC_CHANNELS } from './constants'

let systemMonitor = null
let updateManager = null

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_SSH_KEY, () => {
    return getSSHKey()
  })

  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_INFO, () => {
    return getSystemInfo()
  })

  ipcMain.handle(IPC_CHANNELS.GET_NETWORK_INFO, () => {
    return getNetworkInfo()
  })

  ipcMain.handle(IPC_CHANNELS.GET_DISK_USAGE, () => {
    return getDiskUsage()
  })

  ipcMain.handle(IPC_CHANNELS.GET_BATTERY_INFO, () => {
    return getBatteryInfo()
  })

  ipcMain.handle(IPC_CHANNELS.START_MONITORING, (event, intervalMs = 1000) => {
    const window = event.sender.getOwnerBrowserWindow()

    if (systemMonitor) {
      systemMonitor.stop()
    }

    systemMonitor = new SystemMonitor()
    systemMonitor.start(window, intervalMs)

    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.STOP_MONITORING, () => {
    if (systemMonitor) {
      systemMonitor.stop()
      systemMonitor = null
    }
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, () => {
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
