import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const shortcutAPI = {
  setShortcut: (key, accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_SHORTCUT, { key, accelerator }),
  getShortcut: (key) => ipcRenderer.invoke(IPC_CHANNELS.GET_SHORTCUT, key),
  registerShortcut: (key, accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.REGISTER_SHORTCUT, { key, accelerator }),
};
