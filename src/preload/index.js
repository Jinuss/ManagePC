import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 获取系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // 获取网络信息
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
  
  // 获取 SSH 密钥
  getSSHKey: () => ipcRenderer.invoke('get-ssh-key'),
  
  // 获取磁盘使用情况
  getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
  
  // 获取电池信息
  getBatteryInfo: () => ipcRenderer.invoke('get-battery-info'),
  
  // 启动监控
  startMonitoring: (interval) => ipcRenderer.invoke('start-monitoring', interval),
  
  // 停止监控
  stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
  
  // 监听系统统计数据
  onSystemStats: (callback) => {
    ipcRenderer.on('system-stats', callback)
    return () => ipcRenderer.removeListener('system-stats', callback)
  },
  
  // 移除系统统计监听
  removeSystemStatsListener: (callback) => {
    ipcRenderer.removeListener('system-stats', callback)
  },
  
  // 复制到剪贴板
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  // 获取版本信息
  getVersions: () => ({
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }),
  
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 获取平台信息
  getPlatform: () => ({
    platform: process.platform,
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux'
  }),
  
  // 检查更新
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // 打开设置窗口
  openSettingsWindow: () => ipcRenderer.invoke('open-settings-window'),
  
  // 关闭设置窗口
  closeSettingsWindow: () => ipcRenderer.invoke('close-settings-window'),
  
  // 设置主题
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  
  // 设置语言
  setLanguage: (language) => ipcRenderer.invoke('set-language', language),
  
  // 监听主题变更
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme))
    return () => ipcRenderer.removeListener('theme-changed', callback)
  },
  
  // 监听语言变更
  onLanguageChanged: (callback) => {
    ipcRenderer.on('language-changed', (event, language) => callback(language))
    return () => ipcRenderer.removeListener('language-changed', callback)
  },
})