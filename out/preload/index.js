"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 获取系统信息
  getSystemInfo: () => electron.ipcRenderer.invoke("get-system-info"),
  // 获取网络信息
  getNetworkInfo: () => electron.ipcRenderer.invoke("get-network-info"),
  // 获取 SSH 密钥
  getSSHKey: () => electron.ipcRenderer.invoke("get-ssh-key"),
  // 获取磁盘使用情况
  getDiskUsage: () => electron.ipcRenderer.invoke("get-disk-usage"),
  // 获取电池信息
  getBatteryInfo: () => electron.ipcRenderer.invoke("get-battery-info"),
  // 启动监控
  startMonitoring: (interval) => electron.ipcRenderer.invoke("start-monitoring", interval),
  // 停止监控
  stopMonitoring: () => electron.ipcRenderer.invoke("stop-monitoring"),
  // 监听系统统计数据
  onSystemStats: (callback) => {
    electron.ipcRenderer.on("system-stats", callback);
    return () => electron.ipcRenderer.removeListener("system-stats", callback);
  },
  // 移除系统统计监听
  removeSystemStatsListener: (callback) => {
    electron.ipcRenderer.removeListener("system-stats", callback);
  },
  // 复制到剪贴板
  copyToClipboard: (text) => electron.ipcRenderer.invoke("copy-to-clipboard", text),
  // 获取版本信息
  getVersions: () => ({
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  })
});
