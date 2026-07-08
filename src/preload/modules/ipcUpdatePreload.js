import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const updateAPI = {
  checkForUpdatesAndDownload: () => {
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES, { autoDownload: true });
  },
  onUpdateAutoDownload: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AUTO_DOWNLOADED, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AUTO_DOWNLOADED, callback);
  },
  checkForUpdates: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES, { autoDownload: false }),
  downloadUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE),
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.INSTALL_UPDATE),
  onUpdateAvailable: ({ autoDownload = false, callback }) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, (event, data) => {
      if (!autoDownload) {
        callback(data);
      } else {
        ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE, {
          hasNotifyProgress: true,
        });
      }
    });

    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, callback);
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS, (event, data) =>
      callback(data),
    );
    return () =>
      ipcRenderer.removeListener(
        IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS,
        callback,
      );
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, callback);
  },
  onUpdateError: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, (event, data) => callback(data));
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_ERROR, callback);
  },
  notifyUpdateDownloaded: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED),
  onHasUpdate: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED, (event, hasUpdate) =>
      callback(hasUpdate),
    );
    return () =>
      ipcRenderer.removeListener(
        IPC_CHANNELS.NOTIFY_UPDATE_DOWNLOADED,
        callback,
      );
  },
  getHasUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HAS_UPDATE),
};