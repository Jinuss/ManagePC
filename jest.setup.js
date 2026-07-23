globalThis.electronAPI = {
  getDiskUsage: jest.fn(() => Promise.resolve([])),
  getSystemInfo: jest.fn(() => Promise.resolve({})),
  getNetworkInfo: jest.fn(() => Promise.resolve({})),
  getBatteryInfo: jest.fn(() => Promise.resolve({})),
  getSSHKey: jest.fn(() => Promise.resolve("")),
  getPlatform: jest.fn(() => ({ platform: "win32" })),
  getSavedTheme: jest.fn(() => Promise.resolve({ theme: "system" })),
  onThemeChanged: jest.fn(() => () => {}),
  setTheme: jest.fn(() => Promise.resolve()),
  
  getScreenResolution: jest.fn(() => Promise.resolve({ success: true, data: { width: 1920, height: 1080 } })),
  getAllScreenResolutions: jest.fn(() => Promise.resolve({ success: true, data: [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }] })),
  setScreenResolution: jest.fn(() => Promise.resolve({ success: true })),
  startResolutionListen: jest.fn(() => Promise.resolve({ success: true })),
  stopResolutionListen: jest.fn(() => Promise.resolve({ success: true })),
  onResolutionChanged: jest.fn(() => {}),
  removeResolutionChangedListener: jest.fn(() => {}),
  
  getSpeakerVolume: jest.fn(() => Promise.resolve({ success: true, data: { volume: 50, isMuted: false } })),
  getMicrophoneVolume: jest.fn(() => Promise.resolve({ success: true, data: { volume: 50, isMuted: false } })),
  setSpeakerVolume: jest.fn(() => Promise.resolve({ success: true })),
  setMicrophoneVolume: jest.fn(() => Promise.resolve({ success: true })),
  startVolumeListen: jest.fn(() => Promise.resolve({ success: true })),
  stopVolumeListen: jest.fn(() => Promise.resolve({ success: true })),
  onVolumeChanged: jest.fn(() => {}),
  removeVolumeChangedListener: jest.fn(() => {}),
  
  readLogs: jest.fn(() => Promise.resolve([])),
  getLogInfo: jest.fn(() => Promise.resolve({ lineCount: 0, size: 0, isDev: false })),
  getLogPath: jest.fn(() => Promise.resolve("C:\\logs\\app.log")),
  openLogPath: jest.fn(() => {}),
  clearLogs: jest.fn(() => Promise.resolve({ success: true })),
  startLogWatcher: jest.fn(() => Promise.resolve()),
  stopLogWatcher: jest.fn(() => {}),
  onLogUpdated: jest.fn(() => () => {}),
  
  onSystemStats: jest.fn(() => () => {}),
  startMonitoring: jest.fn(() => Promise.resolve()),
  stopMonitoring: jest.fn(() => Promise.resolve()),
  
  getProcessList: jest.fn(() => Promise.resolve([])),
  killProcess: jest.fn(() => Promise.resolve({ success: true })),
  
  closeSettingsWindow: jest.fn(() => {}),
  openSettingsWindow: jest.fn(() => {}),
  onWindowBlur: jest.fn(() => () => {}),
  onWindowFocus: jest.fn(() => () => {}),
  onHasUpdate: jest.fn(() => () => {}),
  getHasUpdate: jest.fn(() => Promise.resolve(false)),
  
  setLanguage: jest.fn(() => Promise.resolve()),
  getSavedLanguage: jest.fn(() => Promise.resolve({ language: "zh" })),
  onLanguageChanged: jest.fn(() => () => {}),
  
  setCustomProtocol: jest.fn(() => Promise.resolve({ success: true })),
  getCustomProtocol: jest.fn(() => Promise.resolve({ customProtocol: false })),
  
  setAutoUpdate: jest.fn(() => Promise.resolve()),
  getAutoUpdate: jest.fn(() => Promise.resolve({ autoUpdate: false })),
  
  setAutoStart: jest.fn(() => Promise.resolve()),
  getAutoStart: jest.fn(() => Promise.resolve({ autoStart: false })),
  
  checkForUpdates: jest.fn(() => Promise.resolve()),
  installUpdate: jest.fn(() => {}),
  onUpdateAutoDownload: jest.fn(() => () => {}),
  
  getAppVersion: jest.fn(() => Promise.resolve("1.0.0")),
  
  getShortcut: jest.fn(() => Promise.resolve({ shortcut: "CommandOrControl+Shift+A" })),
  setShortcut: jest.fn(() => Promise.resolve({ success: true })),
  registerShortcut: jest.fn(() => Promise.resolve()),
  
  getAll: jest.fn(() => Promise.resolve({ success: true, data: [] })),
  add: jest.fn(() => Promise.resolve({ success: true })),
  update: jest.fn(() => Promise.resolve({ success: true })),
  delete: jest.fn(() => Promise.resolve({ success: true })),
  toggle: jest.fn(() => Promise.resolve({ success: true }))
}

globalThis.matchMedia = jest.fn(() => ({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn()
}))
