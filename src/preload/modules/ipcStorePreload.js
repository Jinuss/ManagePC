import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const storeAPI = {
  /**
   * 获取应用版本号
   * @returns {Promise<string>} - 应用版本号
   */
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  /**
   * 获取应用是否为打包状态
   * @returns {Promise<boolean>} - 是否为打包状态
   */
  getIsPackaged: () => ipcRenderer.invoke(IPC_CHANNELS.GET_IS_PACKAGED),

  /**
   * 设置主题
   * @param {string} theme - 主题名称
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setTheme: (theme) => ipcRenderer.invoke(IPC_CHANNELS.SET_THEME, theme),

  /**
   * 设置语言
   * @param {string} language - 语言代码，如 'zh' 或 'en'
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setLanguage: (language) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_LANGUAGE, language),

  /**
   * 监听主题变化事件
   * @param {Function} callback - 回调函数，主题变化时触发，接收新主题名称参数
   * @returns {Function} - 取消监听的函数
   */
  onThemeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (event, theme) =>
      callback(theme),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, callback);
  },

  /**
   * 监听语言变化事件
   * @param {Function} callback - 回调函数，语言变化时触发，接收新语言代码参数
   * @returns {Function} - 取消监听的函数
   */
  onLanguageChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (event, language) =>
      callback(language),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, callback);
  },

  /**
   * 设置是否开机自启
   * @param {boolean} autoStart - 是否开机自启
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setAutoStart: (autoStart) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, autoStart),

  /**
   * 获取开机自启设置
   * @returns {Promise<boolean>} - 是否开机自启
   */
  getAutoStart: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_START),

  /**
   * 设置是否自动更新
   * @param {boolean} autoUpdate - 是否自动更新
   * @returns {Promise<void>} - 操作完成的Promise
   */
  setAutoUpdate: (autoUpdate) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_UPDATE, autoUpdate),

  /**
   * 获取自动更新设置
   * @returns {Promise<boolean>} - 是否自动更新
   */
  getAutoUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_UPDATE),

  /**
   * 获取保存的主题设置
   * @returns {Promise<string>} - 主题名称
   */
  getSavedTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_THEME),

  /**
   * 获取保存的语言设置
   * @returns {Promise<string>} - 语言代码
   */
  getSavedLanguage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_LANGUAGE),
};
