import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";
import { screenManager } from "../screen/screenManager";
import { log } from "../log/logManager";

export function registerIpcScreenHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_SCREEN_RESOLUTION, () => {
    log.info("[IPC] GET_SCREEN_RESOLUTION requested");
    const result = screenManager.getScreenResolution();
    if (result.success) {
      log.info(`[IPC] GET_SCREEN_RESOLUTION success: ${result.data.width}x${result.data.height}`);
    } else {
      log.error(`[IPC] GET_SCREEN_RESOLUTION failed: ${result.error}`);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.GET_ALL_SCREEN_RESOLUTIONS, () => {
    log.info("[IPC] GET_ALL_SCREEN_RESOLUTIONS requested");
    const result = screenManager.getAllScreenResolutions();
    if (result.success) {
      log.info(`[IPC] GET_ALL_SCREEN_RESOLUTIONS success: ${result.data.length} resolutions`);
    } else {
      log.error(`[IPC] GET_ALL_SCREEN_RESOLUTIONS failed: ${result.error}`);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.SET_SCREEN_RESOLUTION, (event, width, height) => {
    log.info(`[IPC] SET_SCREEN_RESOLUTION requested: ${width}x${height}`);
    const result = screenManager.setScreenResolution(width, height);
    if (result.success) {
      log.info(`[IPC] SET_SCREEN_RESOLUTION success: ${width}x${height}`);
    } else {
      log.error(`[IPC] SET_SCREEN_RESOLUTION failed: ${result.error}`);
    }
    return result;
  });
}