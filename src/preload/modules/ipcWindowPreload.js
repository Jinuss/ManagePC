import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const windowAPI = {
  openSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS_WINDOW),
  closeSettingsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETTINGS_WINDOW),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.IS_WINDOW_MAXIMIZED),
  setAlwaysOnTop: (onTop) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_ALWAYS_ON_TOP, onTop),
  getAlwaysOnTop: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALWAYS_ON_TOP),
  onWindowBlur: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_BLUR, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_BLUR, callback);
  },
  onWindowFocus: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_FOCUS, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_FOCUS, callback);
  },
};