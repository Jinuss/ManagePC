import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../main/constants'

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),
  getNetworkInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NETWORK_INFO),
  getSSHKey: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SSH_KEY),
  getDiskUsage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISK_USAGE),
  getBatteryInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_BATTERY_INFO),
  startMonitoring: (interval) => ipcRenderer.invoke(IPC_CHANNELS.START_MONITORING, interval),
  stopMonitoring: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_MONITORING),
  onSystemStats: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SYSTEM_STATS, callback)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback)
  },
  removeSystemStatsListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.SYSTEM_STATS, callback)
  },
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  getVersions: () => ({
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }),
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  getPlatform: () => ({
    platform: process.platform,
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux'
  }),
  checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES),
  openSettingsWindow: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS_WINDOW),
  closeSettingsWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW),
  setTheme: (theme) => ipcRenderer.invoke(IPC_CHANNELS.SET_THEME, theme),
  setLanguage: (language) => ipcRenderer.invoke(IPC_CHANNELS.SET_LANGUAGE, language),
  onThemeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (event, theme) => callback(theme))
    return () => ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, callback)
  },
  onLanguageChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (event, language) => callback(language))
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, callback)
  },
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.IS_WINDOW_MAXIMIZED),
  setAlwaysOnTop: (onTop) => ipcRenderer.invoke(IPC_CHANNELS.SET_ALWAYS_ON_TOP, onTop),
  getAlwaysOnTop: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALWAYS_ON_TOP),
  setAutoStart: (autoStart) => ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, autoStart),
  getAutoStart: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_START),
  getSavedTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_THEME),
  getSavedLanguage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_LANGUAGE),
  getLogPath: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_PATH),
  getLogInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_INFO),
  readLogs: (maxLines) => ipcRenderer.invoke(IPC_CHANNELS.READ_LOGS, maxLines),
  clearLogs: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_LOGS),
  startLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.START_LOG_WATCHER),
  stopLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_LOG_WATCHER),
  onLogUpdated: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LOG_UPDATED, (event, logs) => callback(logs))
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback)
  },
  removeLogUpdatedListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback)
  },
  onWindowBlur: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_BLUR, callback)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_BLUR, callback)
  },
  onWindowFocus: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_FOCUS, callback)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_FOCUS, callback)
  }
})