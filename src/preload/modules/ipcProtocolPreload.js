import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../main/constants';

export const protocolAPI = {
  /**
   * 设置是否启用自定义协议
   * @param {boolean} enabled - 是否启用自定义协议
   * @returns {Promise<Object>} - 操作结果 { success, customProtocol }
   */
  setCustomProtocol: (enabled) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_CUSTOM_PROTOCOL, enabled),

  /**
   * 获取自定义协议设置
   * @returns {Promise<Object>} - 自定义协议设置 { customProtocol }
   */
  getCustomProtocol: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CUSTOM_PROTOCOL),
};

