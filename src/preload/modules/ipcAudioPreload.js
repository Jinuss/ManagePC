import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const audioAPI = {
  /**
   * 获取扬声器音量
   * @returns {Promise<Object>} - { success: boolean, data?: { volume: number, isMuted: boolean }, error?: string }
   */
  getSpeakerVolume: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SPEAKER_VOLUME),

  /**
   * 设置扬声器音量
   * @param {number} volume - 音量值（0-100）
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  setSpeakerVolume: (volume) => ipcRenderer.invoke(IPC_CHANNELS.SET_SPEAKER_VOLUME, volume),

  /**
   * 获取麦克风音量
   * @returns {Promise<Object>} - { success: boolean, data?: { volume: number, isMuted: boolean }, error?: string }
   */
  getMicrophoneVolume: () => ipcRenderer.invoke(IPC_CHANNELS.GET_MICROPHONE_VOLUME),

  /**
   * 设置麦克风音量
   * @param {number} volume - 音量值（0-100）
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  setMicrophoneVolume: (volume) => ipcRenderer.invoke(IPC_CHANNELS.SET_MICROPHONE_VOLUME, volume),
};
