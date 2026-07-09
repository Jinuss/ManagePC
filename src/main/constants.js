// 应用配置常量

// Windows 应用程序用户模型 ID
export const APP_USER_MODEL_ID = 'com.example.system-monitor';

// GitHub 仓库配置
export const GITHUB_REPO = {
  OWNER: 'Jinuss',
  NAME: 'ManagePC',
  RELEASE_API: 'https://api.github.com/repos/Jinuss/ManagePC/releases/latest',
};

// 窗口默认配置
export const WINDOW_DEFAULTS = {
  MIN_WIDTH: 800,
  MIN_HEIGHT: 400,
  MAIN_WIDTH: 800,
  MAIN_HEIGHT: 550,
  SETTINGS_WIDTH: 600,
  SETTINGS_HEIGHT: 480,
};

// 主题默认配置
export const THEME_DEFAULTS = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
  DEFAULT: 'system',
};

// 语言默认配置
export const LANGUAGE_DEFAULTS = {
  ZH: 'zh',
  EN: 'en',
  DEFAULT: 'zh',
};

// 自定义协议名称
export const CUSTOM_PROTOCOL_NAME = 'managepc';

// Sentry DSN
export const SENTRY_DSN = 'https://c5d17667a8e391eeb6f84cc9f8dbc4c6@o4511704216895488.ingest.us.sentry.io/4511704225284096';

// IPC 通道名称常量
export const IPC_CHANNELS = {
  // ========== 系统信息 ==========
  GET_SYSTEM_INFO: 'get-system-info', // 获取系统基础信息
  GET_NETWORK_INFO: 'get-network-info', // 获取网络信息
  GET_SSH_KEY: 'get-ssh-key', // 获取SSH密钥
  GET_DISK_USAGE: 'get-disk-usage', // 获取磁盘使用情况
  GET_BATTERY_INFO: 'get-battery-info', // 获取电池信息

  // ========== 系统监控 ==========
  START_MONITORING: 'start-monitoring', // 开始监控系统状态
  STOP_MONITORING: 'stop-monitoring', // 停止监控
  SYSTEM_STATS: 'system-stats', // 推送系统监控数据

  // ========== 工具 ==========
  GET_APP_VERSION: 'get-app-version', // 获取应用版本号
  GET_IS_PACKAGED: 'get-is-packaged', // 获取应用是否为打包状态

  // ========== 设置窗口 ==========
  OPEN_SETTINGS_WINDOW: 'open-settings-window', // 打开设置窗口
  CLOSE_SETTINGS_WINDOW: 'close-settings-window', // 关闭设置窗口
  OPEN_SETTINGS_DEVTOOLS: 'open-settings-devtools', // 打开设置窗口DevTools

  // ========== 主题与语言 ==========
  SET_THEME: 'set-theme', // 设置主题
  SET_LANGUAGE: 'set-language', // 设置语言
  THEME_CHANGED: 'theme-changed', // 主题变更通知
  LANGUAGE_CHANGED: 'language-changed', // 语言变更通知

  // ========== 窗口控制 ==========
  MINIMIZE_WINDOW: 'minimize-window', // 最小化窗口
  MAXIMIZE_WINDOW: 'maximize-window', // 最大化窗口
  CLOSE_WINDOW: 'close-window', // 关闭窗口
  IS_WINDOW_MAXIMIZED: 'is-window-maximized', // 查询窗口是否最大化
  SET_ALWAYS_ON_TOP: 'set-always-on-top', // 设置窗口置顶
  GET_ALWAYS_ON_TOP: 'get-always-on-top', // 查询窗口置顶状态

  // ========== 开机自启 ==========
  SET_AUTO_START: 'set-auto-start', // 设置开机自启
  GET_AUTO_START: 'get-auto-start', // 查询开机自启状态

  // ========== 自定义协议 ==========
  SET_CUSTOM_PROTOCOL: 'set-custom-protocol', // 设置自定义协议
  GET_CUSTOM_PROTOCOL: 'get-custom-protocol', // 查询自定义协议状态

  // ========== 快捷键设置 ==========
  SET_SHORTCUT: 'set-shortcut', // 设置快捷键
  GET_SHORTCUT: 'get-shortcut', // 获取快捷键设置
  REGISTER_SHORTCUT: 'register-shortcut', // 注册快捷键
  
  // ========== 自动升级 ==========
  SET_AUTO_UPDATE: 'set-auto-update', // 设置自动升级
  GET_AUTO_UPDATE: 'get-auto-update', // 查询自动升级状态

  // ========== 持久化设置 ==========
  GET_SAVED_THEME: 'get-saved-theme', // 获取保存的主题
  GET_SAVED_LANGUAGE: 'get-saved-language', // 获取保存的语言

  // ========== 日志管理 ==========
  GET_LOG_PATH: 'get-log-path', // 获取日志文件路径
  GET_LOG_INFO: 'get-log-info', // 获取日志信息
  READ_LOGS: 'read-logs', // 读取日志内容
  CLEAR_LOGS: 'clear-logs', // 清除日志
  START_LOG_WATCHER: 'start-log-watcher', // 开始监控日志文件
  STOP_LOG_WATCHER: 'stop-log-watcher', // 停止监控日志文件
  LOG_UPDATED: 'log-updated', // 日志更新通知
  OPEN_LOG_PATH: 'open-log-path', // 打开日志文件路径

  // ========== 窗口事件 ==========
  WINDOW_BLUR: 'window-blur', // 窗口失焦事件
  WINDOW_FOCUS: 'window-focus', // 窗口聚焦事件

  // ========== 自动更新 ==========
  CHECK_FOR_UPDATES: 'check-for-updates', // 检查更新
  UPDATE_AVAILABLE: 'update-available', // 发现新版本通知
  UPDATE_INVALID: 'update-invalid', // 更新无效通知
  UPDATE_DOWNLOAD_PROGRESS: 'update-download-progress', // 下载进度通知
  UPDATE_DOWNLOADED: 'update-downloaded', // 下载完成通知
  UPDATE_AUTO_DOWNLOADED: 'update-auto-downloaded', // 自动下载完成通知
  UPDATE_ERROR: 'update-error', // 更新错误通知
  DOWNLOAD_UPDATE: 'download-update', // 开始下载更新
  INSTALL_UPDATE: 'install-update', // 安装更新并重启
  NOTIFY_UPDATE_DOWNLOADED: 'notify-update-downloaded', // 通知更新下载完成
  GET_HAS_UPDATE: 'get-has-update', // 获取是否有更新
  CHECK_FOR_UPDATES_AND_DOWNLOAD: 'check-for-updates-and-download', // 检查更新并下载

  // ========== 定时任务 ==========
  TASK_GET_ALL: 'task-get-all', // 获取所有任务
  TASK_GET_BY_ID: 'task-get-by-id', // 根据ID获取任务
  TASK_ADD: 'task-add', // 添加任务
  TASK_UPDATE: 'task-update', // 更新任务
  TASK_DELETE: 'task-delete', // 删除任务
  TASK_TOGGLE: 'task-toggle', // 启用/禁用任务
};

