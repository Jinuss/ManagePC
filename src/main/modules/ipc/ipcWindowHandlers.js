import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";

/** 注册 IPC 事件处理窗口函数
 * @param {WindowManager} windowManager - 窗口管理器
 */

export function registerIpcWindowHandlers({ windowManager }) {
  // 打开设置窗口
  ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS_WINDOW, () => {
    windowManager.createSettingsWindow();
    return { success: true };
  });

  // 关闭设置窗口
  ipcMain.handle(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW, () => {
    windowManager.closeSettingsWindow();
    return { success: true };
  });

  // 最小化主窗口
  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    if (windowManager) {
      const window = windowManager.getMainWindow();
      if (window && !window.isDestroyed()) {
        window.minimize();
      }
    }
    return { success: true };
  });

  // 最大化/还原主窗口（切换状态）
  ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
    if (windowManager) {
      const window = windowManager.getMainWindow();
      if (window && !window.isDestroyed()) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      }
    }
    return { success: true };
  });

  // 关闭主窗口（会触发 close 事件处理）
  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
    if (windowManager) {
      const window = windowManager.getMainWindow();
      if (window && !window.isDestroyed()) {
        window.close();
      }
    }
    return { success: true };
  });

  // 检查主窗口是否最大化
  ipcMain.handle(IPC_CHANNELS.IS_WINDOW_MAXIMIZED, () => {
    if (windowManager) {
      const window = windowManager.getMainWindow();
      if (window && !window.isDestroyed()) {
        return { maximized: window.isMaximized() };
      }
    }
    return { maximized: false };
  });

  // ============ 窗口置顶 IPC ============
  // 设置主窗口是否始终置顶
  ipcMain.handle(IPC_CHANNELS.SET_ALWAYS_ON_TOP, (event, onTop) => {
    if (windowManager) {
      return windowManager.setAlwaysOnTop(onTop);
    }
    return { success: false };
  });

  // 获取主窗口是否始终置顶
  ipcMain.handle(IPC_CHANNELS.GET_ALWAYS_ON_TOP, () => {
    if (windowManager) {
      return { alwaysOnTop: windowManager.getAlwaysOnTop() };
    }
    return { alwaysOnTop: false };
  });
}
