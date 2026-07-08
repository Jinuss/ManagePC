import { app, globalShortcut } from "electron";
import WindowManager from "./modules/window/windowManager.js";
import { registerIpcHandlers } from "./modules/ipc/index.js";
import UpdateManager from "./modules/update/updateManager.js";
import TrayManager from "./modules/window/trayManager.js";
import storeManager from "./store.js";
import { log } from "./modules/log/logManager.js";
import { isMac } from "./utils/helps.js";

// 初始化日志系统
log.initialize();

// 请求单实例锁，确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

// 全局管理器实例
let windowManager = null; // 窗口管理器
let updateManager = null; // 更新管理器
let trayManager = null; // 托盘管理器
let isQuitting = false; // 是否正在退出

// 如果没有获取到单实例锁，说明已有实例运行，直接退出
if (!gotTheLock) {
  app.quit();
} else {
  // 监听第二个实例启动事件，激活已有的主窗口
  app.on("second-instance", () => {
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow();
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  /** 初始化应用
   * 创建各管理器实例，注册 IPC 处理器，创建主窗口
   */
  function initApp() {
    windowManager = new WindowManager();
    updateManager = new UpdateManager();
    trayManager = new TrayManager();

    log.info("createMainWindow start");
    windowManager.createMainWindow();
    log.info("createMainWindow end");

    updateManager.setMainWindow(windowManager.getMainWindow());

    trayManager.init(windowManager.getMainWindow());
    trayManager.setWindowManager(windowManager);
    windowManager.setTrayManager(trayManager);

    log.info("registerIpcHandlers start");
    try {
      registerIpcHandlers({ updateManager, windowManager });
    } catch (err) {
      log.error("registerIpcHandlers error=", err.message);
    }
    log.info("registerIpcHandlers end");

    registerShortcuts();

    if (app.isPackaged) {
      checkAndUpdate();
    }
  }

  // 应用就绪后初始化
  app.whenReady().then(() => {
    log.info("App whenReady");
    log.info("isPackaged=", app.isPackaged);
    initApp();

    // macOS 特有：点击 Dock 图标时激活窗口
    app.on("activate", () => {
      if (windowManager && windowManager.getMainWindow() === null) {
        windowManager.createMainWindow();
        trayManager.init(windowManager.getMainWindow());
        trayManager.setWindowManager(windowManager);
        windowManager.setTrayManager(trayManager);
      }
      if (windowManager) {
        windowManager.showWindow();
      }
    });
  });

  // 所有窗口关闭时的处理
  app.on("window-all-closed", () => {
    log.info("window-all-closed start");
    log.info("trayManager exists=", !!trayManager);
    if (trayManager) {
      const tray = trayManager.getTray();
      log.info("tray exists=", !!tray);
      if (tray && !tray.isDestroyed()) {
        log.info("window-all-closed - keep app running with tray");
        return;
      }
    }
    log.info("window-all-closed - quit app");
    app.quit();
  });
}

// ==================== 进程信号处理 ====================

// 处理 SIGTERM 信号（优雅关闭）
process.on("SIGTERM", () => {
  log.info("SIGTERM received, closing app");
  isQuitting = true;
  if (trayManager) {
    const tray = trayManager.getTray();
    if (tray && !tray.isDestroyed()) {
      tray.destroy();
    }
  }
  app.quit();
});

// 处理 SIGINT 信号（Ctrl+C）
process.on("SIGINT", () => {
  log.info("SIGINT received, closing app");
  isQuitting = true;
  if (trayManager) {
    const tray = trayManager.getTray();
    if (tray && !tray.isDestroyed()) {
      tray.destroy();
    }
  }
  app.quit();
});

// 处理未捕获的异常
process.on("uncaughtException", (err) => {
  log.error("uncaughtException");
  log.error(err);
});

// 处理未处理的 Promise 拒绝
process.on("unhandledRejection", (err) => {
  log.error("unhandledRejection");
  log.error(err);
});

/** 设置退出标志
 * @param {boolean} value - 是否正在退出
 */
export function setIsQuitting(value) {
  isQuitting = value;
}

/** 获取退出标志
 * @returns {boolean} - 是否正在退出
 */
export function getIsQuitting() {
  return isQuitting;
}

/** 注册全局快捷键
 * 从配置中读取快捷键设置并注册
 */
function registerShortcuts() {
  log.info("registerShortcuts start");
  const shortcuts = storeManager.getStore().get("shortcuts", {});
  const showWindowShortcut = shortcuts.showWindow || "CommandOrControl+Shift+A";
  
  const success = globalShortcut.register(showWindowShortcut, () => {
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow();
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
  
  if (success) {
    log.info(`[Shortcut] Registered showWindow shortcut: ${showWindowShortcut}`);
  } else {
    log.error(`[Shortcut] Failed to register showWindow shortcut: ${showWindowShortcut}`);
  }
}

/** 检查是否需要主动更新
 * 生产环境下，根据配置检查是否有需要更新的版本
 */
function checkAndUpdate() {
  log.info("生产环境，检查是否需要主动更新：checkAndUpdate start");
  if (isMac()) {
    log.info("macOS 环境，必须要检测更新");
    setTimeout(() => {
      updateManager.checkForUpdates();
    }, 1000);
  } else {
    log.info("Windows 环境，根据配置是否主动检测更新");
    const autoUpdate = storeManager.getStore().get("autoUpdate");
    log.info("是否需要主动更新:", autoUpdate);
    if (!autoUpdate) {
      log.info("未配置主动更新，不检查更新");
      return;
    }
    setTimeout(async () => {
      await updateManager.checkAndDownloadUpdates();
    }, 1000);
  }
}
