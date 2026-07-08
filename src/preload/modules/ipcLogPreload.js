import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const logAPI = {
  getLogPath: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_PATH),
  getLogInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_INFO),
  readLogs: (maxLines) => ipcRenderer.invoke(IPC_CHANNELS.READ_LOGS, maxLines),
  clearLogs: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_LOGS),
  openLogPath: (path) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_LOG_PATH, path),
  startLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.START_LOG_WATCHER),
  stopLogWatcher: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_LOG_WATCHER),
  onLogUpdated: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LOG_UPDATED, (event, logs) => callback(logs));
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },
  removeLogUpdatedListener: (callback) => {
    ipcRenderer.removeListener(IPC_CHANNELS.LOG_UPDATED, callback);
  },
};
