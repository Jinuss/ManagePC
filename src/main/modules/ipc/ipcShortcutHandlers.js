import { ipcMain, globalShortcut } from "electron";
import { IPC_CHANNELS } from "../../constants";
import storeManager from "../../store";

let registeredShortcuts = {};

export function registerIpcShortcutHandlers({ windowManager }) {
  ipcMain.handle(IPC_CHANNELS.SET_SHORTCUT, (event, { key, accelerator }) => {
    const store = storeManager.getStore();
    const shortcuts = store.get("shortcuts", {});
    shortcuts[key] = accelerator;
    store.set("shortcuts", shortcuts);

    if (registeredShortcuts[key]) {
      globalShortcut.unregister(registeredShortcuts[key]);
    }

    if (accelerator) {
      const success = globalShortcut.register(accelerator, () => {
        const mainWindow = windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
        }
      });
      if (success) {
        registeredShortcuts[key] = accelerator;
      }
      return { success, registered: accelerator };
    }
    return { success: true, registered: null };
  });

  ipcMain.handle(IPC_CHANNELS.GET_SHORTCUT, (event, key) => {
    const store = storeManager.getStore();
    const shortcuts = store.get("shortcuts", {});
    return { shortcut: shortcuts[key] || null };
  });

  ipcMain.handle(IPC_CHANNELS.REGISTER_SHORTCUT, (event, { key, accelerator }) => {
    if (registeredShortcuts[key]) {
      globalShortcut.unregister(registeredShortcuts[key]);
    }

    if (accelerator) {
      const success = globalShortcut.register(accelerator, () => {
        const mainWindow = windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
        }
      });
      if (success) {
        registeredShortcuts[key] = accelerator;
      }
      return { success };
    }
    return { success: true };
  });
}