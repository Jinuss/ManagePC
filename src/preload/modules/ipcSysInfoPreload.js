import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const sysInfoAPI = {
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),
  getNetworkInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NETWORK_INFO),
  getSSHKey: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SSH_KEY),
  getDiskUsage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISK_USAGE),
  getBatteryInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_BATTERY_INFO),
  startMonitoring: (interval) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_MONITORING, interval),
  stopMonitoring: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_MONITORING),
  onSystemStats: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SYSTEM_STATS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },
  removeSystemStatsListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },
};