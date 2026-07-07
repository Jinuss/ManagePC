import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../main/constants";

contextBridge.exposeInMainWorld("electronAPI", {
  // ==================== 系统信息相关 API ====================
  // 获取系统基本信息（CPU、内存、操作系统等）
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),
  // 获取网络信息（IP地址、MAC地址、网络状态等）
  getNetworkInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NETWORK_INFO),
  // 获取SSH公钥
  getSSHKey: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SSH_KEY),
  // 获取磁盘使用情况
  getDiskUsage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISK_USAGE),
  // 获取电池信息
  getBatteryInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_BATTERY_INFO),

  // ==================== 监控相关 API ====================
  /** 开始系统监控，定期推送系统统计数据
   * @param {number} interval - 监控间隔（毫秒）
   */
  startMonitoring: (interval) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_MONITORING, interval),
  // 停止系统监控
  stopMonitoring: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_MONITORING),
  /** 监听系统统计数据更新事件
   * @param {Function} callback - 回调函数，接收系统统计数据
   * @returns {Function} - 移除监听器的函数
   */
  onSystemStats: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SYSTEM_STATS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },
  /** 移除系统统计数据监听器
   * @param {Function} callback - 要移除的回调函数
   */
  removeSystemStatsListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback);
  },

  // ==================== 剪贴板相关 API ====================
  /** 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   */
  copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),

  // ==================== 版本与平台相关 API ====================
  // 获取运行时版本信息（Node.js、Electron、Chrome）
  getVersions: () => ({
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  }),
  // 获取应用版本号
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  // 获取平台信息
  getPlatform: () => ({
    platform: process.platform,
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
  }),

  // ==================== 更新相关 API ====================
  // 检查应用更新
  checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES),
  // 下载更新包
  downloadUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE),
  // 安装更新并重启应用
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.INSTALL_UPDATE),
  /** 监听发现新版本事件
   * @param {Function} callback - 回调函数，接收更新信息 { version, message, releaseNotes }
   * @returns {Function} - 移除监听器的函数
   */
  onUpdateAvailable: ({ auto = false, callback }) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, (event, data) => {
      if (!auto) {
        callback(data);
      } else {
        // 自动下载更新
        ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE);
      }
    });

    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, callback);
  },

  /** 监听下载进度事件
   * @param {Function} callback - 回调函数，接收进度信息 { percent, bytesPerSecond, total, transferred }
   * @returns {Function} - 移除监听器的函数
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
  /** 监听更新下载完成事件
   * @param {Function} callback - 回调函数
   * @returns {Function} - 移除监听器的函数
   */
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
  },
  /** 监听更新错误事件
   * @param {Function} callback - 回调函数，接收错误信息 { message }
   * @returns {Function} - 移除监听器的函数
   */
  onUpdateError: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, (event, data) => callback(data));
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_ERROR, callback);
  },
  // ==================== 设置窗口相关 API ====================
  // 打开设置窗口
  openSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS_WINDOW),
  // 关闭设置窗口
  closeSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW),

  // ==================== 主题与语言相关 API ====================
  /** 设置应用主题
   * @param {string} theme - 主题名称（light/dark/system）
   */
  setTheme: (theme) => ipcRenderer.invoke(IPC_CHANNELS.SET_THEME, theme),
  /** 设置应用语言
   * @param {string} language - 语言代码（zh/en）
   */
  setLanguage: (language) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_LANGUAGE, language),
  /** 监听主题变更事件
   * @param {Function} callback - 回调函数，接收新主题名称
   * @returns {Function} - 移除监听器的函数
   */
  onThemeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (event, theme) =>
      callback(theme),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, callback);
  },
  /** 监听语言变更事件
   * @param {Function} callback - 回调函数，接收新语言代码
   * @returns {Function} - 移除监听器的函数
   */
  onLanguageChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (event, language) =>
      callback(language),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, callback);
  },

  // ==================== 窗口控制相关 API ====================
  // 最小化窗口
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  // 最大化/还原窗口
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  // 关闭窗口
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  // 检查窗口是否最大化
  isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.IS_WINDOW_MAXIMIZED),
  /** 设置窗口是否始终置顶
   * @param {boolean} onTop - 是否置顶
   */
  setAlwaysOnTop: (onTop) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_ALWAYS_ON_TOP, onTop),
  // 获取窗口是否始终置顶
  getAlwaysOnTop: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALWAYS_ON_TOP),

  // ==================== 开机自启相关 API ====================
  /** 设置开机自启
   * @param {boolean} autoStart - 是否自启
   */
  setAutoStart: (autoStart) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, autoStart),
  // 获取开机自启设置
  getAutoStart: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_START),
  // 设置自动升级
  setAutoUpdate: (autoUpdate) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_UPDATE, autoUpdate),
  // 获取自动升级设置
  getAutoUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_UPDATE),

  // ==================== 持久化设置相关 API ====================
  // 获取保存的主题设置
  getSavedTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_THEME),
  // 获取保存的语言设置
  getSavedLanguage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_LANGUAGE),

  // ==================== 日志相关 API ====================
  // 获取日志文件路径
  getLogPath: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_PATH),
  // 获取日志文件信息
  getLogInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_INFO),
  /** 读取日志内容
   * @param {number} maxLines - 最大行数
   */
  readLogs: (maxLines) => ipcRenderer.invoke(IPC_CHANNELS.READ_LOGS, maxLines),
  // 清空日志文件
  clearLogs: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_LOGS),
  // 打开日志文件路径
  openLogPath: (path) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_LOG_PATH, path),
  // 开始监听日志文件变化
  startLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.START_LOG_WATCHER),
  // 停止监听日志文件变化
  stopLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_LOG_WATCHER),
  /** 监听日志更新事件
   * @param {Function} callback - 回调函数，接收日志数据
   * @returns {Function} - 移除监听器的函数
   */
  onLogUpdated: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LOG_UPDATED, (event, logs) => callback(logs));
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },
  /** 移除日志更新监听器
   * @param {Function} callback - 要移除的回调函数
   */
  removeLogUpdatedListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },

  // ==================== 窗口焦点相关 API ====================
  /** 监听窗口失焦事件
   * @param {Function} callback - 回调函数
   * @returns {Function} - 移除监听器的函数
   */
  onWindowBlur: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_BLUR, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_BLUR, callback);
  },
  /** 监听窗口聚焦事件
   * @param {Function} callback - 回调函数
   * @returns {Function} - 移除监听器的函数
   */
  onWindowFocus: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_FOCUS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_FOCUS, callback);
  },

  notifyUpdateDownloaded: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED),

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

  getHasUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HAS_UPDATE),
});
