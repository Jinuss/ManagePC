import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const shortcutAPI = {
  /**
   * 设置快捷键配置
   * @param {string} key - 快捷键标识键名
   * @param {string} accelerator - 快捷键组合字符串，如 'Ctrl+Shift+P'
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setShortcut: (key, accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_SHORTCUT, { key, accelerator }),

  /**
   * 获取指定快捷键的配置
   * @param {string} key - 快捷键标识键名
   * @returns {Promise<string>} - 返回快捷键组合字符串
   */
  getShortcut: (key) => ipcRenderer.invoke(IPC_CHANNELS.GET_SHORTCUT, key),

  /**
   * 注册并启用快捷键
   * @param {string} key - 快捷键标识键名
   * @param {string} accelerator - 快捷键组合字符串，如 'Ctrl+Shift+P'
   * @returns {Promise<void>} - 操作完成的Promise
   */
  registerShortcut: (key, accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.REGISTER_SHORTCUT, { key, accelerator }),
};
