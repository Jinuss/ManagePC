import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const windowAPI = {
  /**
   * 打开设置窗口
   * @returns {Promise<void>} - 操作完成的Promise
   */
  openSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS_WINDOW),

  /**
   * 关闭设置窗口
   * @returns {Promise<void>} - 操作完成的Promise
   */
  closeSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW),

  /**
   * 最小化主窗口
   * @returns {Promise<void>} - 操作完成的Promise
   */
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),

  /**
   * 最大化主窗口
   * @returns {Promise<void>} - 操作完成的Promise
   */
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),

  /**
   * 关闭主窗口
   * @returns {Promise<void>} - 操作完成的Promise
   */
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),

  /**
   * 获取主窗口是否处于最大化状态
   * @returns {Promise<boolean>} - 是否最大化
   */
  isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.IS_WINDOW_MAXIMIZED),

  /**
   * 设置主窗口是否置顶
   * @param {boolean} onTop - 是否置顶
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setAlwaysOnTop: (onTop) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_ALWAYS_ON_TOP, onTop),

  /**
   * 获取主窗口置顶状态
   * @returns {Promise<boolean>} - 是否置顶
   */
  getAlwaysOnTop: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALWAYS_ON_TOP),

  /**
   * 监听窗口失去焦点事件
   * @param {Function} callback - 回调函数，窗口失去焦点时触发
   * @returns {Function} - 取消监听的函数
   */
  onWindowBlur: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_BLUR, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_BLUR, callback);
  },

  /**
   * 监听窗口获得焦点事件
   * @param {Function} callback - 回调函数，窗口获得焦点时触发
   * @returns {Function} - 取消监听的函数
   */
  onWindowFocus: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_FOCUS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_FOCUS, callback);
  },
};
