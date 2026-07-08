import { contextBridge } from "electron";
import { sysInfoAPI } from "./modules/ipcSysInfoPreload";
import { updateAPI } from "./modules/ipcUpdatePreload";
import { windowAPI } from "./modules/ipcWindowPreload";
import { storeAPI } from "./modules/ipcStorePreload";
import { logAPI } from "./modules/ipcLogPreload";
import { commonAPI } from "./modules/ipcCommonPreload";
import { shortcutAPI } from "./modules/ipcShortcutPreload";

contextBridge.exposeInMainWorld("electronAPI", {
  // 系统信息
  ...sysInfoAPI,
  // 更新
  ...updateAPI,
  // 窗口
  ...windowAPI,
  // 存储
  ...storeAPI,
  // 日志
  ...logAPI,
  // 通用
  ...commonAPI,
  // 快捷键
  ...shortcutAPI,
});
