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
};