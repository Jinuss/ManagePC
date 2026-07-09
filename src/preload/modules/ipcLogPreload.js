import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const logAPI = {
  /**
   * 获取日志文件路径
   * @returns {Promise<string>} - 日志文件路径
   */
  getLogPath: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_PATH),

  /**
   * 获取日志文件信息
   * @returns {Promise<Object>} - 日志文件信息对象
   */
  getLogInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_INFO),

  /**
   * 读取日志内容
   * @param {number} maxLines - 最大读取行数
   * @returns {Promise<string[]>} - 日志行数组
   */
  readLogs: (maxLines) => ipcRenderer.invoke(IPC_CHANNELS.READ_LOGS, maxLines),

  /**
   * 清空日志文件
   * @returns {Promise<void>} - 操作完成的Promise
   */
  clearLogs: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_LOGS),

  /**
   * 打开日志文件所在目录
   * @param {string} path - 日志文件路径
   * @returns {Promise<void>} - 操作完成的Promise
   */
  openLogPath: (path) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_LOG_PATH, path),

  /**
   * 启动日志监听
   * @returns {Promise<void>} - 操作完成的Promise
   */
  startLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.START_LOG_WATCHER),

  /**
   * 停止日志监听
   * @returns {Promise<void>} - 操作完成的Promise
   */
  stopLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_LOG_WATCHER),

  /**
   * 监听日志更新事件
   * @param {Function} callback - 回调函数，日志更新时触发，接收日志数组参数
   * @returns {Function} - 取消监听的函数
   */
  onLogUpdated: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LOG_UPDATED, (event, logs) => callback(logs));
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },

  /**
   * 移除日志更新监听器
   * @param {Function} callback - 要移除的回调函数
   * @returns {void}
   */
  removeLogUpdatedListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },
};
