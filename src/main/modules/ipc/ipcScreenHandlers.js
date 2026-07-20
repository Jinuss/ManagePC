import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";
import { screenManager } from "../screen/screenManager";
import { log } from "../log/logManager";

let resolutionChangeListener = null;
let windowManagerRef = null;

export function registerIpcScreenHandlers({ windowManager } = {}) {
  windowManagerRef = windowManager;
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

  ipcMain.handle(IPC_CHANNELS.START_RESOLUTION_LISTEN, () => {
    log.info("[IPC] START_RESOLUTION_LISTEN requested");
    
    if (resolutionChangeListener) {
      log.info("[IPC] Resolution listener already started");
      return { success: true };
    }

    resolutionChangeListener = (data) => {
      if (!windowManagerRef) return;
      const mainWindow = windowManagerRef.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_CHANNELS.RESOLUTION_CHANGED, {
          width: data.width,
          height: data.height,
        });
      }
    };

    screenManager.on("resolution-changed", resolutionChangeListener);
    
    const result = screenManager.startResolutionListen();
    if (result.success) {
      log.info("[IPC] START_RESOLUTION_LISTEN success");
    } else {
      log.error("[IPC] START_RESOLUTION_LISTEN failed:", result.error);
      screenManager.off("resolution-changed", resolutionChangeListener);
      resolutionChangeListener = null;
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.STOP_RESOLUTION_LISTEN, () => {
    log.info("[IPC] STOP_RESOLUTION_LISTEN requested");
    
    if (resolutionChangeListener) {
      screenManager.off("resolution-changed", resolutionChangeListener);
      resolutionChangeListener = null;
    }
    
    const result = screenManager.stopResolutionListen();
    if (result.success) {
      log.info("[IPC] STOP_RESOLUTION_LISTEN success");
    } else {
      log.error("[IPC] STOP_RESOLUTION_LISTEN failed:", result.error);
    }
    return result;
  });
}