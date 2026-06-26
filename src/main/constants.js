export const APP_USER_MODEL_ID = 'com.example.system-monitor'

export const WINDOW_DEFAULTS = {
  MAIN_WIDTH: 1200,
  MAIN_HEIGHT: 800,
  SETTINGS_WIDTH: 400,
  SETTINGS_HEIGHT: 480
}

export const THEME_DEFAULTS = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
  DEFAULT: 'system'
}

export const LANGUAGE_DEFAULTS = {
  ZH: 'zh',
  EN: 'en',
  DEFAULT: 'zh'
}

export const IPC_CHANNELS = {
  GET_SYSTEM_INFO: 'get-system-info',
  GET_NETWORK_INFO: 'get-network-info',
  GET_SSH_KEY: 'get-ssh-key',
  GET_DISK_USAGE: 'get-disk-usage',
  GET_BATTERY_INFO: 'get-battery-info',
  START_MONITORING: 'start-monitoring',
  STOP_MONITORING: 'stop-monitoring',
  SYSTEM_STATS: 'system-stats',
  COPY_TO_CLIPBOARD: 'copy-to-clipboard',
  GET_APP_VERSION: 'get-app-version',
  CHECK_FOR_UPDATES: 'check-for-updates',
  OPEN_SETTINGS_WINDOW: 'open-settings-window',
  CLOSE_SETTINGS_WINDOW: 'close-settings-window',
  SET_THEME: 'set-theme',
  SET_LANGUAGE: 'set-language',
  THEME_CHANGED: 'theme-changed',
  LANGUAGE_CHANGED: 'language-changed',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  IS_WINDOW_MAXIMIZED: 'is-window-maximized',
  GET_SAVED_THEME: 'get-saved-theme',
  GET_SAVED_LANGUAGE: 'get-saved-language',
  SET_ALWAYS_ON_TOP: 'set-always-on-top',
  GET_ALWAYS_ON_TOP: 'get-always-on-top',
  SET_AUTO_START: 'set-auto-start',
  GET_AUTO_START: 'get-auto-start'
}