import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const updateAPI = {
  /**
   * 检查更新并自动下载
   * @returns {void}
   */
  checkForUpdatesAndDownload: () => {
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES, { autoDownload: true });
  },

  /**
   * 监听更新自动下载完成事件
   * @param {Function} callback - 回调函数，更新下载完成时触发
   * @returns {Function} - 取消监听的函数
   */
  onUpdateAutoDownload: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AUTO_DOWNLOADED, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AUTO_DOWNLOADED, callback);
  },

  /**
   * 检查更新（不自动下载）
   * @returns {Promise<void>} - 操作完成的Promise
   */
  checkForUpdates: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES, { autoDownload: false }),

  /**
   * 下载更新包
   * @returns {Promise<void>} - 操作完成的Promise
   */
  downloadUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE),

  /**
   * 安装更新并重启应用
   * @returns {Promise<void>} - 操作完成的Promise
   */
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.INSTALL_UPDATE),

  /**
   * 监听更新可用事件
   * @param {Object} options - 配置选项
   * @param {Function} options.callback - 回调函数，有更新可用时触发
   * @returns {Function} - 取消监听的函数
   */
  onUpdateAvailable: ({ callback }) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, callback);
  },

  /**
   * 监听下载进度事件
   * @param {Function} callback - 回调函数，下载进度变化时触发，接收进度数据参数
   * @returns {Function} - 取消监听的函数
   */
  onDownloadProgress: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS, (event, data) =>
      callback(data),
    );
    return () =>
      ipcRenderer.removeListener(
        IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS,
        callback,
      );
  },

  /**
   * 监听更新下载完成事件
   * @param {Function} callback - 回调函数，更新下载完成时触发
   * @returns {Function} - 取消监听的函数
   */
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
  },

  /**
   * 监听更新错误事件
   * @param {Function} callback - 回调函数，更新过程中发生错误时触发，接收错误数据参数
   * @returns {Function} - 取消监听的函数
   */
  onUpdateError: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, (event, data) => callback(data));
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_ERROR, callback);
  },

  /**
   * 通知主进程更新已下载完成
   * @returns {Promise<void>} - 操作完成的Promise
   */
  notifyUpdateDownloaded: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED),

  /**
   * 监听是否有更新事件
   * @param {Function} callback - 回调函数，接收是否有更新的布尔值参数
   * @returns {Function} - 取消监听的函数
   */
  onHasUpdate: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED, (event, hasUpdate) =>
      callback(hasUpdate),
    );
    return () =>
      ipcRenderer.removeListener(
        IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED,
        callback,
      );
  },

  /**
   * 获取是否有可用更新
   * @returns {Promise<boolean>} - 是否有可用更新
   */
  getHasUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HAS_UPDATE),
};
