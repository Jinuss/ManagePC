import { autoUpdater } from "electron-updater";
import BaseUpdater from "./BaseUpdater.js";
import { IPC_CHANNELS } from "../../constants.js";
import { log } from "../log/logManager.js";
import storeManager from "../../store";

/** Windows 平台更新管理器
 * 使用 electron-updater 实现自动更新
 */
export default class WindowsUpdater extends BaseUpdater {
  constructor() {
    super();
    this.autoUpdater = autoUpdater;

    this.autoUpdater.logger = log;
    log.transports.file.level = "debug";

    this.mainWindow = null;
    this.initUpdater();
  }

  /** 设置主窗口引用
   * @param {BrowserWindow} mainWindow - 主窗口实例
   */
  setMainWindow(mainWindow) {
    log.info("[WindowsUpdater] setMainWindow called");
    this.mainWindow = mainWindow;
  }

  /** 初始化更新器
   * 配置自动下载选项，注册更新相关事件监听
   */
  initUpdater() {
    this.autoUpdater.autoDownload = false;
    this.autoUpdater.on("error", (error) => {
      log.error("[WindowsUpdater] Update error:", error);
      this.sendEvent(IPC_CHANNELS.UPDATE_ERROR, { message: error.message });
    });
  }

  /** 发送事件到渲染进程
   * @param {string} channel - IPC 通道名称
   * @param {Object} data - 事件数据
   */
  sendEvent(channel, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      log.info(`[WindowsUpdater] Sending event to ${channel} Start!`);
      this.mainWindow.webContents.send(channel, data);
    } else {
      log.error("[WindowsUpdater] 主窗口已销毁，无法发送事件", channel, data);
    }
  }

  /** 检查更新
   * 通过 electron-updater 检查 GitHub Releases
   * @returns {Promise<Object>} - 更新检查结果
   */
  async checkForUpdates() {
    log.info("[WindowsUpdater] checkForUpdates called");
    log.info("[WindowsUpdater] Current version:", this.currentVersion);

    const cleanup = () => {
      this.autoUpdater.removeListener("update-not-available", onNotAvailable);
      this.autoUpdater.removeListener("update-available", onAvailable);
      this.autoUpdater.removeListener("error", onError);
    };

    const onNotAvailable = () => {
      cleanup();
      log.info("[WindowsUpdater] No update available");
      this.sendEvent(IPC_CHANNELS.UPDATE_INVALID, {
        status: "no-update",
        message: "当前已是最新版本",
      });
    };

    const onAvailable = (info) => {
      cleanup();
      log.info("[WindowsUpdater] Update available:", info);
      const updateInfo = {
        status: "update-available",
        version: info.version,
        message: `发现新版本 ${info.version}`,
        releaseNotes: info.releaseNotes || "",
      };
      this.sendEvent(IPC_CHANNELS.UPDATE_AVAILABLE, updateInfo);
    };

    const onError = (error) => {
      cleanup();
      log.error("[WindowsUpdater] Check update failed:", error);
      const errorInfo = {
        status: "error",
        message: "检查更新失败，请稍后重试",
      };
      this.sendEvent(IPC_CHANNELS.UPDATE_ERROR, errorInfo);
    };

    this.autoUpdater.once("update-not-available", onNotAvailable);
    this.autoUpdater.once("update-available", onAvailable);
    this.autoUpdater.once("error", onError);
    this.autoUpdater.once("checking-for-update", () => {
      log.info("[WindowsUpdater] Checking for update...");
    });

    try {
      await this.autoUpdater.checkForUpdates();
    } catch (error) {
      log.error("[WindowsUpdater] Check update failed:", error);
    }
  }

  /** 检查更新并自动下载更新
   * 通过 electron-updater 检查 GitHub Releases
   * @returns {Promise<Object>} - 更新检查结果
   */
  async checkAndDownload() {
    log.info("[WindowsUpdater-checkAndDownload] checkForUpdates called");
    log.info(
      "[WindowsUpdater-checkAndDownload] Current version:",
      this.currentVersion,
    );

    const cleanup = () => {
      this.autoUpdater.removeListener("update-not-available", onNotAvailable);
      this.autoUpdater.removeListener("update-available", onAvailable);
      this.autoUpdater.removeListener("error", onError);
    };

    const onNotAvailable = () => {
      cleanup();
      log.info(
        "[WindowsUpdater-checkAndDownload] No update available，已经是最新版本",
      );
      storeManager.getStore().set("hasUpdate", false);
    };

    const onAvailable = (info) => {
      cleanup();
      log.info("[WindowsUpdater-checkAndDownload] Update available:", info);
      this.autoDownloadUpdate();
    };

    const onError = (error) => {
      cleanup();
      log.error(
        "[WindowsUpdater-checkAndDownload] Check update failed:",
        error,
      );
    };

    this.autoUpdater.once("update-not-available", onNotAvailable);
    this.autoUpdater.once("update-available", onAvailable);
    this.autoUpdater.once("error", onError);
    this.autoUpdater.once("checking-for-update", () => {
      log.info("[WindowsUpdater-checkAndDownload] Checking for update...");
    });

    try {
      await this.autoUpdater.checkForUpdates();
    } catch (error) {
      log.error("[WindowsUpdater-OnlyCheck] Check update failed:", error);
    }
  }

  // 自动下载更新包
  autoDownloadUpdate() {
    log.info("[WindowsUpdater-autoDownloadUpdate] autoDownloadUpdate called");

    this.autoUpdater.once("update-auto-downloaded", () => {
      log.info(
        "[WindowsUpdater-autoDownloadUpdate] Update downloaded，下载完成",
      );
      storeManager.getStore().set("hasUpdate", true);
      this.sendEvent(IPC_CHANNELS.UPDATE_AUTO_DOWNLOADED);
    });

    this.autoUpdater.downloadUpdate();
  }

  /** 下载更新包
   */
  downloadUpdate() {
    log.info("[WindowsUpdater-downloadUpdate] downloadUpdate called");

    this.autoUpdater.on("update-downloaded", () => {
      log.info("[WindowsUpdater-downloadUpdate] Update downloaded");
      this.sendEvent(IPC_CHANNELS.UPDATE_DOWNLOADED);
    });

    this.autoUpdater.on("download-progress", (progress) => {
      log.info(
        `[WindowsUpdater] Download progress: ${progress.percent.toFixed(1)}%`,
      );
      this.sendEvent(IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS, {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred,
      });
    });
    this.autoUpdater.downloadUpdate();
  }

  /** 退出应用并安装更新
   * @param {boolean} isSilent - 是否静默安装（不显示安装进度窗口，默认显示）
   * @param {boolean} isRestart - 是否重启应用（默认重启）
   */
  quitAndInstall(isSilent = false, isRestart = true) {
    log.info("[WindowsUpdater] quitAndInstall called");
    this.autoUpdater.quitAndInstall(isSilent, isRestart);
  }
}
