import { ipcMain } from "electron";
import {
  getSystemInfo,
  getNetworkInfo,
  getDiskUsage,
  getSSHKey,
  getBatteryInfo,
} from "../../utils/systemInfo.js";
import SystemMonitor from "../../utils/SystemMonitor.js";
import { IPC_CHANNELS } from "../../constants.js";

let systemMonitor = null;

/** 注册系统信息相关 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
export function registerIpcSysInfoHandlers() {
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
}

/** 获取系统监控实例
 * @returns {SystemMonitor|null}
 */
export function getSystemMonitor() {
  return systemMonitor;
}
