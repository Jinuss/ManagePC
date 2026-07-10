import { app, ipcMain } from 'electron';
import path from 'path';
import { IPC_CHANNELS, CUSTOM_PROTOCOL_NAME } from '../../constants';
import storeManager from '../../store/index';
import { log } from '../log/logManager';

export function registerProtocol() {
  try {
    if (app.isPackaged) {
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME);
    } else {
      const args = [];
      if (process.defaultApp) {
        args.push(path.resolve(process.argv[1]));
      } else {
        args.push(process.argv[1]);
      }
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME, process.execPath, args);
    }
    log.info('[Protocol] Registered custom protocol: ' + CUSTOM_PROTOCOL_NAME);
    return true;
  } catch (error) {
    log.error('[Protocol] Failed to register protocol: ' + error.message);
    return false;
  }
}

export function unregisterProtocol() {
  try {
    if (app.isPackaged) {
      app.removeAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME);
    } else {
      const args = [];
      if (process.defaultApp) {
        args.push(path.resolve(process.argv[1]));
      } else {
        args.push(process.argv[1]);
      }
      app.removeAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME, process.execPath, args);
    }
    log.info('[Protocol] Unregistered custom protocol: ' + CUSTOM_PROTOCOL_NAME);
    return true;
  } catch (error) {
    log.error('[Protocol] Failed to unregister protocol: ' + error.message);
    return false;
  }
}

export function registerIpcProtocolHandlers() {
  const setStoreValue = (key, value) => {
    storeManager.getStore().set(key, value);
  };

  const getStoreValue = (key) => {
    return storeManager.getStore().get(key);
  };

  ipcMain.handle(IPC_CHANNELS.SET_CUSTOM_PROTOCOL, (event, enabled) => {
    log.info('[Protocol] Set custom protocol: ' + enabled);
    setStoreValue('customProtocol', enabled);
    
    if (enabled) {
      const success = registerProtocol();
      return { success, customProtocol: enabled };
    } else {
      const success = unregisterProtocol();
      return { success, customProtocol: enabled };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_CUSTOM_PROTOCOL, () => {
    const customProtocol = getStoreValue('customProtocol');
    log.info('[Protocol] Get custom protocol setting: ' + customProtocol);
    return { customProtocol };
  });
}
