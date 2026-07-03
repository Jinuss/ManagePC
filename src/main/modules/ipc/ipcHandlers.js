import { ipcMain, app } from "electron";
import {
  getSystemInfo,
  getNetworkInfo,
  getDiskUsage,
  getSSHKey,
  getBatteryInfo,
} from "../../utils/systemInfo.js";
import SystemMonitor from "../../utils/SystemMonitor.js";
import { createLogHandler, log } from "../log/logManager.js";
import { IPC_CHANNELS } from "../../constants";

let systemMonitor = null;
let updateManager = null;
const logHandler = createLogHandler();

/** 注册所有 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
export function registerIpcHandlers({ updateManager: updateManagerInstance }) {
  if(!updateManagerInstance){
     log.error('[ipcHandle ] 更新管理器实例为空')
  }
  
  updateManager = updateManagerInstance;
  ipcMain.handle(IPC_CHANNELS.GET_SSH_KEY, () => {
    return getSSHKey();
  });

  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_INFO, () => {
    return getSystemInfo();
  });

  ipcMain.handle(IPC_CHANNELS.GET_NETWORK_INFO, () => {
    return getNetworkInfo();
  });

  ipcMain.handle(IPC_CHANNELS.GET_DISK_USAGE, () => {
    return getDiskUsage();
  });

  ipcMain.handle(IPC_CHANNELS.GET_BATTERY_INFO, () => {
    return getBatteryInfo();
  });

  ipcMain.handle(IPC_CHANNELS.START_MONITORING, (event, intervalMs = 1000) => {
    const window = event.sender.getOwnerBrowserWindow();

    if (systemMonitor) {
      systemMonitor.stop();
    }

    systemMonitor = new SystemMonitor();
    systemMonitor.start(window, intervalMs);

    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.STOP_MONITORING, () => {
    if (systemMonitor) {
      systemMonitor.stop();
      systemMonitor = null;
    }
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, async () => {
    if (!app.isPackaged) {
      log.error("非打包应用不支持检查更新");
      return { success: true, message: "非打包应用不支持检查更新" };
    }

    log.info("检查更新");
    updateManager.checkForUpdates();
  });

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, () => {
    updateManager.downloadUpdate();
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.INSTALL_UPDATE, (event, isSilent = false, isRestart = true) => {
    updateManager.quitAndInstall(isSilent, isRestart);  
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.GET_LOG_PATH, () => {
    return logHandler.getLogPath();
  });

  ipcMain.handle(IPC_CHANNELS.GET_LOG_INFO, () => {
    return logHandler.getLogInfo();
  });

  ipcMain.handle(IPC_CHANNELS.READ_LOGS, (event, maxLines = 500) => {
    return logHandler.readLogs(maxLines);
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_LOGS, () => {
    return logHandler.clearLogs();
  });

  ipcMain.handle(IPC_CHANNELS.START_LOG_WATCHER, (event) => {
    const window = event.sender.getOwnerBrowserWindow();
    logHandler.startWatching(window);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.STOP_LOG_WATCHER, () => {
    logHandler.stopWatching();
    return { success: true };
  });
}

/** 获取系统监控实例
 * @returns {SystemMonitor|null}
 */
export function getSystemMonitor() {
  return systemMonitor;
}
