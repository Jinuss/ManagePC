import path from "path";
import { app } from "electron";
import { log } from "../modules/log/logManager";

const loadedModules = new Map();

const resolveDevPath = (moduleName) => {
  const appPath = app.getAppPath();
  return path.join(appPath, "src", "main", "native", "build", "Release", `${moduleName}.node`);
};

const resolveProdPath = (moduleName) => {
  return path.join(process.resourcesPath, "native", `${moduleName}.node`);
};

const resolvePath = (moduleName) => {
  if (app.isPackaged) {
    return resolveProdPath(moduleName);
  }
  return resolveDevPath(moduleName);
};

export const loadNativeModule = (moduleName) => {
  if (loadedModules.has(moduleName)) {
    const cached = loadedModules.get(moduleName);
    return { success: cached.success, error: cached.error, module: cached.module };
  }

  const nativePath = resolvePath(moduleName);
  log.info(`[NativeModuleLoader] Loading ${moduleName} from: ${nativePath}`);

  try {
    const module = require(nativePath);
    log.info(`[NativeModuleLoader] ${moduleName} loaded successfully`);
    const result = { success: true, error: null, module };
    loadedModules.set(moduleName, result);
    return result;
  } catch (err) {
    log.error(`[NativeModuleLoader] Failed to load ${moduleName}:`, err.message);
    const result = { success: false, error: err, module: null };
    loadedModules.set(moduleName, result);
    return result;
  }
};

export const getNativeModule = (moduleName) => {
  return loadedModules.get(moduleName) || { success: false, error: null, module: null };
};

export const isNativeModuleLoaded = (moduleName) => {
  const module = loadedModules.get(moduleName);
  return module?.success ?? false;
};

export const clearNativeModuleCache = (moduleName) => {
  if (moduleName) {
    loadedModules.delete(moduleName);
  } else {
    loadedModules.clear();
  }
};

export const reloadNativeModule = (moduleName) => {
  clearNativeModuleCache(moduleName);
  return loadNativeModule(moduleName);
};