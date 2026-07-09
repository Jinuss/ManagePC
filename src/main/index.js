import { app, globalShortcut } from "electron";
import WindowManager from "./modules/window/windowManager.js";
import { registerIpcHandlers } from "./modules/ipc/index.js";
import UpdateManager from "./modules/update/updateManager.js";
import TrayManager from "./modules/window/trayManager.js";
import storeManager from "./store.js";
import { log } from "./modules/log/logManager.js";
import { isMac } from "./utils/helps.js";
import { CUSTOM_PROTOCOL_NAME } from "./constants.js";
import { registerProtocol } from "./modules/ipc/ipcProtocolHandlers.js";
import { initSentry, captureException } from "./sentry.js";
import taskManager from "./modules/task/taskManager.js";

// 初始化日志系统
log.initialize();

// 初始化 Sentry（仅生产环境）
initSentry();

// 请求单实例锁，确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

// 全局管理器实例
let windowManager = null;
let updateManager = null;
let trayManager = null;
let isQuitting = false;

// 如果没有获取到单实例锁，说明已有实例运行，直接退出
if (!gotTheLock) {
  app.quit();
} else {
  const handleProtocolUrl = (url) => {
    log.info(`[Protocol] Received protocol URL: ${url}`);
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow();
      if (!mainWindow.isVisible()) {
        log.info("[Protocol] Window is hidden, showing it");
        mainWindow.show();
      } else if (mainWindow.isMinimized()) {
        log.info("[Protocol] Window is minimized, restoring it");
        mainWindow.restore();
      }
      mainWindow.focus();
      log.info("[Protocol] Window focused successfully");
    }
  };

  const extractProtocolUrl = (argv) => {
    for (const arg of argv) {
      if (arg.startsWith(`${CUSTOM_PROTOCOL_NAME}://`)) {
        return arg;
      }
    }
    return null;
  };

  const registerProtocolOnStartup = () => {
    const customProtocol = storeManager.getStore().get("customProtocol", false);
    if (!customProtocol) {
      return;
    }
    const success = registerProtocol();
    if (success) {
      log.info(
        `[Protocol] Registered custom protocol on startup: ${CUSTOM_PROTOCOL_NAME}`,
      );
    } else {
      log.error(
        `[Protocol] Failed to register custom protocol on startup`,
      );
    }
  };

  async function initApp() {
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

    registerProtocolOnStartup();

    await taskManager.init();

    const initialUrl = extractProtocolUrl(process.argv);
    if (initialUrl) {
      log.info(`[Protocol] App started via protocol: ${initialUrl}`);
      handleProtocolUrl(initialUrl);
    }

    if (app.isPackaged) {
      checkAndUpdate();
    }
  }

  app.on("second-instance", (event, argv) => {
    if (windowManager && windowManager.getMainWindow()) {
      const mainWindow = windowManager.getMainWindow();
      if (!mainWindow.isVisible()) {
        log.info("[Protocol] Window is hidden, showing it");
        mainWindow.show();
      } else if (mainWindow.isMinimized()) {
        log.info("[Protocol] Window is minimized, restoring it");
        mainWindow.restore();
      }
      mainWindow.focus();
    }
    const protocolUrl = extractProtocolUrl(argv);
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl);
    }
  });

  app.whenReady().then(async () => {
    log.info("App whenReady");
    log.info("isPackaged=", app.isPackaged);

    if (isMac()) {
      app.on("open-url", (event, url) => {
        event.preventDefault();
        handleProtocolUrl(url);
      });
    }

    await initApp();

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

process.on("uncaughtException", (err) => {
  log.error("uncaughtException");
  log.error(err);
  captureException(err, { type: "uncaughtException" });
});

process.on("unhandledRejection", (err) => {
  log.error("unhandledRejection");
  log.error(err);
  captureException(err, { type: "unhandledRejection" });
});

export function setIsQuitting(value) {
  isQuitting = value;
}

export function getIsQuitting() {
  return isQuitting;
}

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
    log.info(
      `[Shortcut] Registered showWindow shortcut: ${showWindowShortcut}`,
    );
  } else {
    log.error(
      `[Shortcut] Failed to register showWindow shortcut: ${showWindowShortcut}`,
    );
  }
}

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
