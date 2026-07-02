import { ipcMain, app } from 'electron'
import { getSystemInfo, getNetworkInfo, getDiskUsage, getSSHKey, getBatteryInfo } from '../../utils/systemInfo.js'
import SystemMonitor from '../../utils/SystemMonitor.js'
import UpdateManager from '../update/updateManager.js'
import { createLogHandler, log } from '../log/logManager.js'
import { IPC_CHANNELS } from '../../constants'

let systemMonitor = null
let updateManager = null
const logHandler = createLogHandler()

/** 注册所有 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
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
    if (!app.isPackaged) {
      log.error('非打包应用不支持检查更新')
      return { success: true, message: '非打包应用不支持检查更新' }
    }

    if (!updateManager) {
      updateManager = new UpdateManager()
    }
    log.info('检查更新')
    const checkPromise = updateManager.checkForUpdates()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 30000)
    )

    return await Promise.race([checkPromise, timeoutPromise])
  })

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, () => {
    if (updateManager) {
      updateManager.downloadUpdate()
    }
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.INSTALL_UPDATE, () => {
    if (updateManager) {
      updateManager.quitAndInstall()
    }
    return { success: true }
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

/** 获取系统监控实例
 * @returns {SystemMonitor|null}
 */
export function getSystemMonitor() {
  return systemMonitor
}

/** 获取更新管理器实例
 * @returns {UpdateManager|null}
 */
export function getUpdateManager() {
  return updateManager
}
