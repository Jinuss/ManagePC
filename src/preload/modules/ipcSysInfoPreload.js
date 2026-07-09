import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const sysInfoAPI = {
  /**
   * 获取系统信息
   * @returns {Promise<Object>} - 系统信息对象
   */
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),

  /**
   * 获取网络信息
   * @returns {Promise<Object>} - 网络信息对象
   */
  getNetworkInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NETWORK_INFO),

  /**
   * 获取SSH密钥信息
   * @returns {Promise<Object>} - SSH密钥信息对象
   */
  getSSHKey: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SSH_KEY),

  /**
   * 获取磁盘使用情况
   * @returns {Promise<Object>} - 磁盘使用信息对象
   */
  getDiskUsage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISK_USAGE),

  /**
   * 获取电池信息
   * @returns {Promise<Object>} - 电池信息对象
   */
  getBatteryInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_BATTERY_INFO),

  /**
   * 启动系统监控
   * @param {number} interval - 监控间隔时间（毫秒）
   * @returns {Promise<void>} - 操作完成的Promise
   */
  startMonitoring: (interval) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_MONITORING, interval),

  /**
   * 停止系统监控
   * @returns {Promise<void>} - 操作完成的Promise
   */
  stopMonitoring: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_MONITORING),

  /**
   * 监听系统统计数据更新事件
   * @param {Function} callback - 回调函数，系统统计数据更新时触发
   * @returns {Function} - 取消监听的函数
   */
  onSystemStats: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SYSTEM_STATS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },

  /**
   * 移除系统统计数据监听器
   * @param {Function} callback - 要移除的回调函数
   * @returns {void}
   */
  removeSystemStatsListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },
};
