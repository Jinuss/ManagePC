import { app, ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";
import { broadcast } from "../../utils/helps";
import storeManager from "../../store/index";
import { log } from "../log/logManager";

/** 注册 IPC 事件处理Store读取函数
 * @param {WindowManager} windowManager - 窗口管理器
 */

export function registerIpcStoreHandlers({ windowManager }) {
  // 获取应用版本号
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
    return app.getVersion();
  });

  // 获取应用是否为打包状态
  ipcMain.handle(IPC_CHANNELS.GET_IS_PACKAGED, () => {
    return app.isPackaged;
  });

  // ============ 通用设置 IPC ============
  // 设置通用配置项
  const setStoreValue = (key, value) => {
    storeManager.getStore().set(key, value);
  };
  // 获取通用配置项
  const getStoreValue = (key) => {
    return storeManager.getStore().get(key);
  };

  // 设置应用主题，保存到配置并通知所有窗口
  ipcMain.handle(IPC_CHANNELS.SET_THEME, (event, theme) => {
    setStoreValue("theme", theme);
    windowManager.setTheme(theme);
    broadcast(IPC_CHANNELS.THEME_CHANGED, theme);
    return { success: true };
  });

  // 设置自动升级
  ipcMain.handle(IPC_CHANNELS.SET_AUTO_UPDATE, (event, autoUpdate) => {
    setStoreValue("autoUpdate", autoUpdate);
  });

  // 获取自动升级设置
  ipcMain.handle(IPC_CHANNELS.GET_AUTO_UPDATE, () => {
    log.info("[ipcHandle ] 获取自动升级设置", getStoreValue("autoUpdate"));
    return { autoUpdate: getStoreValue("autoUpdate") };
  });

  // 设置应用语言，保存到配置并通知所有窗口
  ipcMain.handle(IPC_CHANNELS.SET_LANGUAGE, (event, language) => {
    setStoreValue("language", language);
    broadcast(IPC_CHANNELS.LANGUAGE_CHANGED, language);
    return { success: true };
  });

  // 获取保存的主题设置
  ipcMain.handle(IPC_CHANNELS.GET_SAVED_THEME, () => {
    return { theme: getStoreValue("theme") };
  });

  // 获取保存的语言设置
  ipcMain.handle(IPC_CHANNELS.GET_SAVED_LANGUAGE, () => {
    return { language: getStoreValue("language") };
  });

  // 设置应用是否开机自启
  ipcMain.handle(IPC_CHANNELS.SET_AUTO_START, (event, autoStart) => {
    setStoreValue("autoStart", autoStart);
    app.setLoginItemSettings({
      openAtLogin: autoStart,
    });
    return { success: true };
  });

  // 获取应用是否开机自启
  ipcMain.handle(IPC_CHANNELS.GET_AUTO_START, () => {
    return { autoStart: getStoreValue("autoStart") };
  });

  // 获取是否有更新
  ipcMain.handle(IPC_CHANNELS.GET_HAS_UPDATE, () => {
    const hasUpdate = getStoreValue("hasUpdate");
    log.info("[ipcHandle ] 获取是否有更新", hasUpdate);
    return hasUpdate;
  });
}
