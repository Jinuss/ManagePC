import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";
import { audioManager } from "../audio/audioManager";
import { log } from "../log/logManager";

let volumeChangeListener = null;
let windowManagerRef = null;

export function registerIpcAudioHandlers({ windowManager } = {}) {
  windowManagerRef = windowManager;
  ipcMain.handle(IPC_CHANNELS.GET_SPEAKER_VOLUME, () => {
    log.info("[IPC] GET_SPEAKER_VOLUME requested");
    const result = audioManager.getSpeakerVolume();
    if (result.success) {
      log.info("[IPC] GET_SPEAKER_VOLUME success:", result.data);
    } else {
      log.error("[IPC] GET_SPEAKER_VOLUME failed:", result.error);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.SET_SPEAKER_VOLUME, (event, volume) => {
    log.info("[IPC] SET_SPEAKER_VOLUME requested:", volume);
    const result = audioManager.setSpeakerVolume(volume);
    if (result.success) {
      log.info("[IPC] SET_SPEAKER_VOLUME success:", volume);
    } else {
      log.error("[IPC] SET_SPEAKER_VOLUME failed:", result.error);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.GET_MICROPHONE_VOLUME, () => {
    log.info("[IPC] GET_MICROPHONE_VOLUME requested");
    const result = audioManager.getMicrophoneVolume();
    if (result.success) {
      log.info("[IPC] GET_MICROPHONE_VOLUME success:", result.data);
    } else {
      log.error("[IPC] GET_MICROPHONE_VOLUME failed:", result.error);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.SET_MICROPHONE_VOLUME, (event, volume) => {
    log.info("[IPC] SET_MICROPHONE_VOLUME requested:", volume);
    const result = audioManager.setMicrophoneVolume(volume);
    if (result.success) {
      log.info("[IPC] SET_MICROPHONE_VOLUME success:", volume);
    } else {
      log.error("[IPC] SET_MICROPHONE_VOLUME failed:", result.error);
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.START_VOLUME_LISTEN, () => {
    log.info("[IPC] START_VOLUME_LISTEN requested");
    
    if (volumeChangeListener) {
      log.info("[IPC] Volume listener already started");
      return { success: true };
    }

    volumeChangeListener = (data) => {
      if (!windowManagerRef) return;
      const mainWindow = windowManagerRef.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_CHANNELS.VOLUME_CHANGED, {
          volume: data.volume,
          isMuted: data.isMuted,
        });
      }
    };

    audioManager.on("volume-changed", volumeChangeListener);
    
    const result = audioManager.startVolumeListen();
    if (result.success) {
      log.info("[IPC] START_VOLUME_LISTEN success");
    } else {
      log.error("[IPC] START_VOLUME_LISTEN failed:", result.error);
      audioManager.off("volume-changed", volumeChangeListener);
      volumeChangeListener = null;
    }
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.STOP_VOLUME_LISTEN, () => {
    log.info("[IPC] STOP_VOLUME_LISTEN requested");
    
    if (volumeChangeListener) {
      audioManager.off("volume-changed", volumeChangeListener);
      volumeChangeListener = null;
    }
    
    const result = audioManager.stopVolumeListen();
    if (result.success) {
      log.info("[IPC] STOP_VOLUME_LISTEN success");
    } else {
      log.error("[IPC] STOP_VOLUME_LISTEN failed:", result.error);
    }
    return result;
  });
}
