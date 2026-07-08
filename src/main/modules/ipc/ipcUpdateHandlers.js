import { ipcMain, app } from "electron";
import { log } from "../log/logManager";
import { IPC_CHANNELS } from "../../constants";
import { broadcast } from "../../utils/helps";

/** 注册更新相关 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
export function registerIpcUpdateHandlers({
  updateManager,
}) {

  /** 检查更新：
   * 是否自动下载更新
   * 如果自动下载更新，检查完成后会自动下载更新
   */
  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, async (event, options) => {
    if (!app.isPackaged) {
      log.warn("[ipcHandle ] 非打包应用不支持检查更新");
      return;
    }
    const { autoDownload = false } = options;
    log.info("[ipcHandle ] 检查更新，是否自动下载更新", { autoDownload });
    if (!autoDownload) {
      updateManager.checkForUpdates();
    } else {
      
      await updateManager.checkAndDownload();
    }
  });

  /** 下载更新
   */
  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, (event, options) => {
    updateManager.downloadUpdate(options);
    return { success: true };
  });

  /** 安装更新
   */
  ipcMain.handle(
    IPC_CHANNELS.INSTALL_UPDATE,
    (event, isSilent = false, isRestart = true) => {
      updateManager.quitAndInstall(isSilent, isRestart);
      return { success: true };
    },
  );

  /** 通知更新下载完成
   */
  ipcMain.handle(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED, () => {
    broadcast(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED, { hasUpdate: true });
  });
}
