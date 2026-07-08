import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const storeAPI = {
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  setTheme: (theme) => ipcRenderer.invoke(IPC_CHANNELS.SET_THEME, theme),
  setLanguage: (language) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_LANGUAGE, language),
  onThemeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (event, theme) =>
      callback(theme),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, callback);
  },
  onLanguageChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (event, language) =>
      callback(language),
    );
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, callback);
  },
  setAutoStart: (autoStart) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, autoStart),
  getAutoStart: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_START),
  setAutoUpdate: (autoUpdate) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_UPDATE, autoUpdate),
  getAutoUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_UPDATE),
  getSavedTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_THEME),
  getSavedLanguage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SAVED_LANGUAGE),
};
