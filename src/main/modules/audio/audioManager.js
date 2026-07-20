import { loadNativeModule } from "../../utils/nativeModuleLoader";
import { log } from "../log/logManager";
import { EventEmitter } from "events";

const NATIVE_MODULE_NAME = "system";

class AudioManager extends EventEmitter {
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

  getSpeakerVolume() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    try {
      const result = this.loadResult.module.getSpeakerVolume();
      if (result.success) {
        return {
          success: true,
          data: {
            volume: result.volume,
            isMuted: result.isMuted,
          },
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      log.error("[AudioManager] getSpeakerVolume failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  setSpeakerVolume(volume) {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    if (!Number.isInteger(volume)) {
      return { success: false, error: "Volume must be an integer" };
    }

    if (volume < 0 || volume > 100) {
      return { success: false, error: "Volume must be between 0 and 100" };
    }

    try {
      const result = this.loadResult.module.setSpeakerVolume(volume);
      if (result) {
        log.info("[AudioManager] Speaker volume set to", volume);
        return { success: true };
      } else {
        log.error("[AudioManager] Failed to set speaker volume to", volume);
        return { success: false, error: "Failed to set speaker volume" };
      }
    } catch (err) {
      log.error("[AudioManager] setSpeakerVolume failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  getMicrophoneVolume() {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    try {
      const result = this.loadResult.module.getMicrophoneVolume();
      if (result.success) {
        return {
          success: true,
          data: {
            volume: result.volume,
            isMuted: result.isMuted,
          },
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      log.error("[AudioManager] getMicrophoneVolume failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  setMicrophoneVolume(volume) {
    if (!this.isNativeAvailable()) {
      return {
        success: false,
        error: this.getLoadError()?.message || "Native module not available",
      };
    }

    if (!Number.isInteger(volume)) {
      return { success: false, error: "Volume must be an integer" };
    }

    if (volume < 0 || volume > 100) {
      return { success: false, error: "Volume must be between 0 and 100" };
    }

    try {
      const result = this.loadResult.module.setMicrophoneVolume(volume);
      if (result) {
        log.info("[AudioManager] Microphone volume set to", volume);
        return { success: true };
      } else {
        log.error("[AudioManager] Failed to set microphone volume to", volume);
        return { success: false, error: "Failed to set microphone volume" };
      }
    } catch (err) {
      log.error("[AudioManager] setMicrophoneVolume failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  startVolumeListen() {
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
        log.info("[AudioManager] Volume changed:", data);
        self.emit("volume-changed", {
          volume: data.volume,
          isMuted: data.isMuted,
        });
      };

      const result = this.loadResult.module.startVolumeNotification(callback);
      if (result) {
        this.isListening = true;
        log.info("[AudioManager] Volume notification started");
        return { success: true };
      } else {
        log.error("[AudioManager] Failed to start volume notification");
        return { success: false, error: "Failed to start volume notification" };
      }
    } catch (err) {
      log.error("[AudioManager] startVolumeListen failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  stopVolumeListen() {
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
      const result = this.loadResult.module.stopVolumeNotification();
      if (result) {
        this.isListening = false;
        log.info("[AudioManager] Volume notification stopped");
        return { success: true };
      } else {
        log.error("[AudioManager] Failed to stop volume notification");
        return { success: false, error: "Failed to stop volume notification" };
      }
    } catch (err) {
      log.error("[AudioManager] stopVolumeListen failed:", err.message);
      return { success: false, error: err.message };
    }
  }
}

const audioManager = new AudioManager();

export { audioManager };

export default AudioManager;
