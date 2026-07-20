import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const screenAPI = {
  /**
   * 获取当前屏幕分辨率
   * @returns {Promise<Object>} - { success: boolean, data?: { width: number, height: number }, error?: string }
   */
  getScreenResolution: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SCREEN_RESOLUTION),

  /**
   * 获取所有支持的屏幕分辨率
   * @returns {Promise<Object>} - { success: boolean, data?: Array<{ width: number, height: number }>, error?: string }
   */
  getAllScreenResolutions: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALL_SCREEN_RESOLUTIONS),

  /**
   * 设置屏幕分辨率
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  setScreenResolution: (width, height) => ipcRenderer.invoke(IPC_CHANNELS.SET_SCREEN_RESOLUTION, width, height),

  /**
   * 开始监听分辨率变化
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  startResolutionListen: () => ipcRenderer.invoke(IPC_CHANNELS.START_RESOLUTION_LISTEN),

  /**
   * 停止监听分辨率变化
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  stopResolutionListen: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_RESOLUTION_LISTEN),

  /**
   * 注册分辨率变化事件监听器
   * @param {Function} callback - 回调函数，接收参数 { width: number, height: number }
   */
  onResolutionChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.RESOLUTION_CHANGED, (event, data) => {
      callback(data);
    });
  },

  /**
   * 移除分辨率变化事件监听器
   */
  removeResolutionChangedListener: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.RESOLUTION_CHANGED);
  },
};