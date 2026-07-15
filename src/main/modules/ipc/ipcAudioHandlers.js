import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../constants";
import { audioManager } from "../audio/audioManager";
import { log } from "../log/logManager";

export function registerIpcAudioHandlers() {
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
}
