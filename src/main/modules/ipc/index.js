import { app } from "electron";
import { log } from "../log/logManager";
import { registerIpcSysInfoHandlers } from "./ipcSysInfoHandlers";
import { registerIpcUpdateHandlers } from "./ipcUpdateHandlers";
import { registerIpcLogHandlers } from "./ipcLogHandlers";
import { registerIpcStoreHandlers } from "./ipcStoreHandlers";
import { registerIpcWindowHandlers } from "./ipcWindowHandlers";

/** 注册所有 IPC 处理器
 * 将渲染进程的请求转发到对应的服务模块
 */
export function registerIpcHandlers({
  updateManager,
  windowManager,
}) {
  log.info("[ipcRegister ] 注册应用配置 IPC 处理器");
  registerIpcStoreHandlers({
    windowManager,
  });

  log.info("[ipcRegister ] 注册窗口相关 IPC 处理器");
  registerIpcWindowHandlers({
    windowManager,
  });

  log.info("[ipcRegister ] 注册系统信息 IPC 处理器");
  registerIpcSysInfoHandlers();

  log.info("[ipcRegister ] 注册日志 IPC 处理器");
  registerIpcLogHandlers();

  log.info("[ipcRegister ] 注册更新相关 IPC 处理器");
  if (app.isPackaged) {
    log.info("[ipcRegister ] 打包应用注册更新相关 IPC 处理器");
    registerIpcUpdateHandlers({
      updateManager,
    });
  } else {
    log.info("[ipcRegister ] 非打包应用不注册更新相关 IPC 处理器");
  }
}
