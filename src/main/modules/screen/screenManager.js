import { loadNativeModule } from "../../utils/nativeModuleLoader";
import { log } from "../log/logManager";
import { EventEmitter } from "events";

const NATIVE_MODULE_NAME = "system";

class ScreenManager extends EventEmitter {
  constructor() {
    super();
    this.loadResult = loadNativeModule(NATIVE_MODULE_NAME);
    this.isListening = false;
  }

  isNativeAvailable() {
    return this.loadResult.success;
  }

  getLoadError() {
    return this.loadResult.error;
  }

  getScreenResolution() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    try {
      const result = this.loadResult.module.getScreenSize();
      return {
        success: true,
        data: {
          width: result.width,
          height: result.height,
        },
      };
    } catch (err) {
      log.error("[ScreenManager] getScreenResolution failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  getAllScreenResolutions() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    try {
      const resolutions = this.loadResult.module.getAllScreenResolutions();
      const result = [];
      for (let i = 0; i < resolutions.length; i++) {
        result.push({
          width: resolutions[i].width,
          height: resolutions[i].height,
        });
      }
      result.sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        return areaB - areaA;
      });
      return { success: true, data: result };
    } catch (err) {
      log.error("[ScreenManager] getAllScreenResolutions failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  setScreenResolution(width, height) {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      return { success: false, error: "Width and height must be integers" };
    }

    if (width <= 0 || height <= 0) {
      return { success: false, error: "Width and height must be positive" };
    }

    try {
      const result = this.loadResult.module.setScreenResolution(width, height);
      if (result) {
        log.info(`[ScreenManager] Resolution set to ${width}x${height}`);
        return { success: true };
      } else {
        log.error(`[ScreenManager] Failed to set resolution to ${width}x${height}`);
        return { success: false, error: "Failed to set resolution" };
      }
    } catch (err) {
      log.error("[ScreenManager] setScreenResolution failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  startResolutionListen() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    if (this.isListening) {
      return { success: true };
    }

    try {
      const self = this;
      const callback = (data) => {
        log.info("[ScreenManager] Resolution changed:", data);
        self.emit("resolution-changed", {
          width: data.width,
          height: data.height,
        });
      };

      const result = this.loadResult.module.startResolutionNotification(callback);
      if (result) {
        this.isListening = true;
        log.info("[ScreenManager] Resolution notification started");
        return { success: true };
      } else {
        log.error("[ScreenManager] Failed to start resolution notification");
        return { success: false, error: "Failed to start resolution notification" };
      }
    } catch (err) {
      log.error("[ScreenManager] startResolutionListen failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  stopResolutionListen() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    if (!this.isListening) {
      return { success: true };
    }

    try {
      const result = this.loadResult.module.stopResolutionNotification();
      if (result) {
        this.isListening = false;
        log.info("[ScreenManager] Resolution notification stopped");
        return { success: true };
      } else {
        log.error("[ScreenManager] Failed to stop resolution notification");
        return { success: false, error: "Failed to stop resolution notification" };
      }
    } catch (err) {
      log.error("[ScreenManager] stopResolutionListen failed:", err.message);
      return { success: false, error: err.message };
    }
  }
}

const screenManager = new ScreenManager();

export { screenManager };

export default ScreenManager;