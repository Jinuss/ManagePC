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

  /**
   * 开始监听音量变化
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  startVolumeListen: () => ipcRenderer.invoke(IPC_CHANNELS.START_VOLUME_LISTEN),

  /**
   * 停止监听音量变化
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  stopVolumeListen: () => ipcRenderer.invoke(IPC_CHANNELS.STOP_VOLUME_LISTEN),

  /**
   * 注册音量变化事件监听器
   * @param {Function} callback - 回调函数，接收参数 { volume: number, isMuted: boolean }
   */
  onVolumeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.VOLUME_CHANGED, (event, data) => {
      callback(data);
    });
  },

  /**
   * 移除音量变化事件监听器
   */
  removeVolumeChangedListener: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.VOLUME_CHANGED);
  },
};
