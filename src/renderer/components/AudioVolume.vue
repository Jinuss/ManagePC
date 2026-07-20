<template>
  <div class="audio-volume-container">
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">🔊</span>
          {{ t("audio.speakerVolume") }}
        </h2>
      </div>

      <div class="volume-card" v-if="speakerLoaded">
        <div class="volume-display">
          <span class="volume-icon">{{ isSpeakerMuted ? "🔇" : "🔊" }}</span>
          <span class="volume-value"
            >{{ isSpeakerMuted ? 0 : speakerCurrentValue }}%</span
          >
        </div>
        <div class="volume-slider-container">
          <NSlider
            :value="speakerCurrentValue"
            :min="0"
            :max="100"
            :step="1"
            :disabled="isSetting"
            :tooltip="false"
            class="volume-slider"
            @update:value="onSpeakerVolumeChange"
          />
          <NButton
            size="small"
            :type="isSpeakerMuted ? 'primary' : 'default'"
            :disabled="isSetting"
            @click="toggleSpeakerMute"
            class="mute-btn"
          >
            {{ isSpeakerMuted ? t("audio.unmute") : t("audio.mute") }}
          </NButton>
        </div>
        <div class="volume-status">
          <span>{{
            isSpeakerMuted ? t("audio.muted") : t("audio.unmuted")
          }}</span>
        </div>
      </div>

      <div class="error-card" v-else-if="speakerError">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ speakerError }}</div>
        <NButton size="small" type="primary" @click="refreshSpeakerVolume">
          {{ t("common.retry") }}
        </NButton>
      </div>

      <div class="loading-card" v-else>
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ t("common.loading") }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">🎤</span>
          {{ t("audio.microphoneVolume") }}
        </h2>
      </div>

      <div class="volume-card" v-if="microphoneLoaded">
        <div class="volume-display">
          <span class="volume-icon">{{ isMicrophoneMuted ? "🔇" : "🎤" }}</span>
          <span class="volume-value"
            >{{ isMicrophoneMuted ? 0 : microphoneCurrentValue }}%</span
          >
        </div>
        <div class="volume-slider-container">
          <NSlider
            :value="microphoneCurrentValue"
            :min="0"
            :max="100"
            :step="1"
            :disabled="isSetting"
            :tooltip="false"
            class="volume-slider"
            @update:value="onMicrophoneVolumeChange"
          />
          <NButton
            size="small"
            :type="isMicrophoneMuted ? 'primary' : 'default'"
            :disabled="isSetting"
            @click="toggleMicrophoneMute"
            class="mute-btn"
          >
            {{ isMicrophoneMuted ? t("audio.unmute") : t("audio.mute") }}
          </NButton>
        </div>
        <div class="volume-status">
          <span>{{
            isMicrophoneMuted ? t("audio.muted") : t("audio.unmuted")
          }}</span>
        </div>
      </div>

      <div class="error-card" v-else-if="microphoneError">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ microphoneError }}</div>
        <NButton size="small" type="primary" @click="refreshMicrophoneVolume">
          {{ t("common.retry") }}
        </NButton>
      </div>

      <div class="loading-card" v-else>
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ t("common.loading") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { NSlider, NButton } from "naive-ui";

const { t } = useI18n();

const speakerCurrentValue = ref(50);
const isSpeakerMuted = ref(false);
const speakerLoaded = ref(false);
const speakerError = ref(null);
const speakerPreviousVolume = ref(50);

const microphoneCurrentValue = ref(50);
const isMicrophoneMuted = ref(false);
const microphoneLoaded = ref(false);
const microphoneError = ref(null);
const microphonePreviousVolume = ref(50);

const isSetting = ref(false);

const fetchSpeakerVolume = async () => {
  try {
    speakerError.value = null;
    const result = await window.electronAPI.getSpeakerVolume();
    console.log("[AudioVolume] getSpeakerVolume result:", result);
    if (result.success) {
      speakerCurrentValue.value = result.data.volume;
      isSpeakerMuted.value = result.data.isMuted;
      if (!result.data.isMuted) {
        speakerPreviousVolume.value = result.data.volume;
      }
      speakerLoaded.value = true;
    } else {
      speakerError.value = result.error;
      speakerLoaded.value = false;
    }
  } catch (err) {
    console.error("[AudioVolume] getSpeakerVolume error:", err);
    speakerError.value = err.message;
    speakerLoaded.value = false;
  }
};

const fetchMicrophoneVolume = async () => {
  try {
    microphoneError.value = null;
    const result = await window.electronAPI.getMicrophoneVolume();
    console.log("[AudioVolume] getMicrophoneVolume result:", result);
    if (result.success) {
      microphoneCurrentValue.value = result.data.volume;
      isMicrophoneMuted.value = result.data.isMuted;
      if (!result.data.isMuted) {
        microphonePreviousVolume.value = result.data.volume;
      }
      microphoneLoaded.value = true;
    } else {
      microphoneError.value = result.error;
      microphoneLoaded.value = false;
    }
  } catch (err) {
    console.error("[AudioVolume] getMicrophoneVolume error:", err);
    microphoneError.value = err.message;
    microphoneLoaded.value = false;
  }
};

const onSpeakerVolumeChange = async (value) => {
  speakerCurrentValue.value = Math.round(value);
  console.log("[AudioVolume] onSpeakerVolumeChange:", value);
  if (isSetting.value) return;

  const volume = Math.round(value);

  isSetting.value = true;

  try {
    const result = await window.electronAPI.setSpeakerVolume(volume);
    console.log("[AudioVolume] setSpeakerVolume result:", result);
    if (result.success) {
      isSpeakerMuted.value = volume === 0;
      if (volume > 0) {
        speakerPreviousVolume.value = volume;
      }
    } else {
      alert(t("audio.setFailed", { error: result.error }));
      await fetchSpeakerVolume();
    }
  } catch (err) {
    console.error("[AudioVolume] setSpeakerVolume error:", err);
    alert(t("audio.setFailed", { error: err.message }));
    await fetchSpeakerVolume();
  } finally {
    isSetting.value = false;
  }
};

const onMicrophoneVolumeChange = async (value) => {
  console.log("[AudioVolume] onMicrophoneVolumeChange:", value);
  if (isSetting.value) return;

  microphoneCurrentValue.value = Math.round(value);
  const volume = Math.round(value);

  isSetting.value = true;

  try {
    const result = await window.electronAPI.setMicrophoneVolume(volume);
    console.log("[AudioVolume] setMicrophoneVolume result:", result);
    if (result.success) {
      isMicrophoneMuted.value = volume === 0;
      if (volume > 0) {
        microphonePreviousVolume.value = volume;
      }
    } else {
      alert(t("audio.setFailed", { error: result.error }));
      await fetchMicrophoneVolume();
    }
  } catch (err) {
    console.error("[AudioVolume] setMicrophoneVolume error:", err);
    alert(t("audio.setFailed", { error: err.message }));
    await fetchMicrophoneVolume();
  } finally {
    isSetting.value = false;
  }
};

const toggleSpeakerMute = async () => {
  console.log("[AudioVolume] toggleSpeakerMute");
  if (isSetting.value) return;

  isSetting.value = true;

  try {
    let targetVolume;
    if (isSpeakerMuted.value) {
      targetVolume = speakerPreviousVolume.value || 50;
    } else {
      speakerPreviousVolume.value = speakerCurrentValue.value;
      targetVolume = 0;
    }

    const result = await window.electronAPI.setSpeakerVolume(targetVolume);
    console.log(
      "[AudioVolume] toggleSpeakerMute setSpeakerVolume result:",
      result,
    );
    if (result.success) {
      speakerCurrentValue.value = targetVolume;
      isSpeakerMuted.value = targetVolume === 0;
    } else {
      alert(t("audio.setFailed", { error: result.error }));
    }
  } catch (err) {
    console.error("[AudioVolume] toggleSpeakerMute error:", err);
    alert(t("audio.setFailed", { error: err.message }));
  } finally {
    isSetting.value = false;
  }
};

const toggleMicrophoneMute = async () => {
  console.log("[AudioVolume] toggleMicrophoneMute");
  if (isSetting.value) return;

  isSetting.value = true;

  try {
    let targetVolume;
    if (isMicrophoneMuted.value) {
      targetVolume = microphonePreviousVolume.value || 50;
    } else {
      microphonePreviousVolume.value = microphoneCurrentValue.value;
      targetVolume = 0;
    }

    const result = await window.electronAPI.setMicrophoneVolume(targetVolume);
    console.log(
      "[AudioVolume] toggleMicrophoneMute setMicrophoneVolume result:",
      result,
    );
    if (result.success) {
      microphoneCurrentValue.value = targetVolume;
      isMicrophoneMuted.value = targetVolume === 0;
    } else {
      alert(t("audio.setFailed", { error: result.error }));
    }
  } catch (err) {
    console.error("[AudioVolume] toggleMicrophoneMute error:", err);
    alert(t("audio.setFailed", { error: err.message }));
  } finally {
    isSetting.value = false;
  }
};

const refreshSpeakerVolume = async () => {
  await fetchSpeakerVolume();
};

const refreshMicrophoneVolume = async () => {
  await fetchMicrophoneVolume();
};

const refreshAll = async () => {
  await fetchSpeakerVolume();
  await fetchMicrophoneVolume();
};

const startVolumeListen = async () => {
  try {
    const result = await window.electronAPI.startVolumeListen();
    console.log("[AudioVolume] startVolumeListen result:", result);
    if (result.success) {
      window.electronAPI.onVolumeChanged((data) => {
        console.log("[AudioVolume] onVolumeChanged:", data);
        if (isSetting.value) {
          console.log("[AudioVolume] Skipping volume update during setting");
          return;
        }
        speakerCurrentValue.value = data.volume;
        isSpeakerMuted.value = data.isMuted;
        if (!data.isMuted) {
          speakerPreviousVolume.value = data.volume;
        }
      });
    } else {
      console.error("[AudioVolume] startVolumeListen failed:", result.error);
    }
  } catch (err) {
    console.error("[AudioVolume] startVolumeListen error:", err);
  }
};

const stopVolumeListen = async () => {
  try {
    const result = await window.electronAPI.stopVolumeListen();
    console.log("[AudioVolume] stopVolumeListen result:", result);
    window.electronAPI.removeVolumeChangedListener();
  } catch (err) {
    console.error("[AudioVolume] stopVolumeListen error:", err);
  }
};

onMounted(() => {
  console.log("[AudioVolume] onMounted");
  refreshAll();
  startVolumeListen();
});

onUnmounted(() => {
  console.log("[AudioVolume] onUnmounted");
  stopVolumeListen();
});
</script>

<style scoped>
.audio-volume-container {
  padding: 20px;
  max-width: 600px;
}

.section {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 18px;
}

.volume-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.volume-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.volume-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.volume-value {
  font-size: 36px;
  font-weight: 700;
}

.volume-slider-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.volume-slider {
  flex: 1;
}

.mute-btn {
  flex-shrink: 0;
}

.volume-status {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 87, 87, 0.1);
  border-radius: 12px;
  color: #ff5757;
  gap: 8px;
}

.error-icon {
  font-size: 24px;
}

.error-message {
  font-size: 14px;
  text-align: center;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 8px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
