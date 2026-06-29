import { ipcMain } from 'electron'
import { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey, getBatteryInfo } from '../../utils/systemInfo.js'
import SystemMonitor from '../../utils/SystemMonitor.js'
import UpdateManager from '../update/updateManager.js'
import { createLogHandler } from '../log/logManager.js'
import { IPC_CHANNELS } from '../../constants'

let systemMonitor = null
let updateManager = null
const logHandler = createLogHandler()

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

  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, async () => {
    if (!updateManager) {
      updateManager = new UpdateManager()
    }

    const checkPromise = updateManager.checkForUpdates()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 30000)
    )

    await Promise.race([checkPromise, timeoutPromise])

  })

  ipcMain.handle(IPC_CHANNELS.GET_LOG_PATH, () => {
    return logHandler.getLogPath()
  })

  ipcMain.handle(IPC_CHANNELS.GET_LOG_INFO, () => {
    return logHandler.getLogInfo()
  })

  ipcMain.handle(IPC_CHANNELS.READ_LOGS, (event, maxLines = 500) => {
    return logHandler.readLogs(maxLines)
  })

  ipcMain.handle(IPC_CHANNELS.CLEAR_LOGS, () => {
    return logHandler.clearLogs()
  })

  ipcMain.handle(IPC_CHANNELS.START_LOG_WATCHER, (event) => {
    const window = event.sender.getOwnerBrowserWindow()
    logHandler.startWatching(window)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.STOP_LOG_WATCHER, () => {
    logHandler.stopWatching()
    return { success: true }
  })
}

export function getSystemMonitor() {
  return systemMonitor
}

export function getUpdateManager() {
  return updateManager
}
