import { ipcMain, shell } from "electron";
import { createLogHandler, log } from "../log/logManager.js";
import { IPC_CHANNELS } from "../../constants.js";

/** 注册日志 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
export function registerIpcLogHandlers() {
  const logHandler = createLogHandler();

  /** 获取日志路径
   */
  ipcMain.handle(IPC_CHANNELS.GET_LOG_PATH, () => {
    return logHandler.getLogPath();
  });

  /** 获取日志信息
   */
  ipcMain.handle(IPC_CHANNELS.GET_LOG_INFO, () => {
    return logHandler.getLogInfo();
  });

  /** 读取日志
   */
  ipcMain.handle(IPC_CHANNELS.READ_LOGS, (event, maxLines = 500) => {
    return logHandler.readLogs(maxLines);
  });

  /** 清除日志
   */
  ipcMain.handle(IPC_CHANNELS.CLEAR_LOGS, () => {
    return logHandler.clearLogs();
  });

  /** 开始监听日志
   */
  ipcMain.handle(IPC_CHANNELS.START_LOG_WATCHER, (event) => {
    const window = event.sender.getOwnerBrowserWindow();
    logHandler.startWatching(window);
    return { success: true };
  });

  /** 停止监听日志
   */
  ipcMain.handle(IPC_CHANNELS.STOP_LOG_WATCHER, () => {
    logHandler.stopWatching();
    return { success: true };
  });

  /** 打开日志路径
   */
  ipcMain.handle(IPC_CHANNELS.OPEN_LOG_PATH, (event, path) => {
    if (path) {
      shell.showItemInFolder(path);
    }
    return { success: true };
  });
}
