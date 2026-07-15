<template>
  <div class="screen-resolution-container">
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">🖥️</span>
          {{ t("screen.currentResolution") }}
        </h2>
      </div>
      <div class="current-resolution-card" v-if="currentResolution">
        <div class="resolution-display">
          <span class="resolution-value">{{ currentResolution.width }}</span>
          <span class="separator">×</span>
          <span class="resolution-value">{{ currentResolution.height }}</span>
        </div>
        <div class="resolution-label">{{ t("screen.pixels") }}</div>
      </div>
      <div class="error-card" v-else-if="currentError">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ currentError }}</div>
      </div>
      <div class="loading-card" v-else>
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ t("common.loading") }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">📐</span>
          {{ t("screen.availableResolutions") }}
        </h2>
        <NButton size="small" type="primary" @click="refreshResolutions">
          {{ t("common.refresh") }}
        </NButton>
      </div>

      <div v-if="resolutions.length > 0" class="select-container">
        <NSelect
          v-model:value="selectedResolution"
          :options="resolutionOptions"
          :disabled="isDisabled"
          :placeholder="t('screen.selectResolution')"
          class="resolution-select"
        />
        <NButton
          size="medium"
          type="primary"
          :disabled="isDisabled || isSetting || !selectedResolution"
          @click="applyResolution"
          class="apply-btn"
        >
          {{ isSetting ? t("common.setting") : t("common.apply") }}
        </NButton>
      </div>

      <div v-else-if="resolutionsError" class="error-card">
        <div class="error-icon">❌</div>
        <div class="error-message">{{ resolutionsError }}</div>
        <NButton size="small" type="primary" @click="refreshResolutions">
          {{ t("common.retry") }}
        </NButton>
      </div>

      <div v-else class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ t("common.loading") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NSelect } from "naive-ui";

const { t } = useI18n();

const currentResolution = ref(null);
const currentError = ref(null);
const resolutions = ref([]);
const resolutionsError = ref(null);
const selectedResolution = ref(null);
const isSetting = ref(false);

const isDisabled = ref(false);

const resolutionOptions = computed(() => {
  return resolutions.value.map((res) => {
    const isCurrent =
      currentResolution.value &&
      currentResolution.value.width === res.width &&
      currentResolution.value.height === res.height;
    const label = isCurrent
      ? `${res.width} × ${res.height} (${t("screen.current")})`
      : `${res.width} × ${res.height}`;
    return {
      label,
      value: JSON.stringify(res),
    };
  });
});

const fetchCurrentResolution = async () => {
  try {
    currentError.value = null;
    const result = await window.electronAPI.getScreenResolution();
    if (result.success) {
      currentResolution.value = result.data;
      if (resolutions.value.length > 0) {
        const current = resolutions.value.find(
          (r) =>
            r.width === result.data.width && r.height === result.data.height
        );
        if (current) {
          selectedResolution.value = JSON.stringify(current);
        }
      }
    } else {
      currentError.value = result.error;
      isDisabled.value = true;
    }
  } catch (err) {
    currentError.value = err.message;
    isDisabled.value = true;
  }
};

const fetchAllResolutions = async () => {
  try {
    resolutionsError.value = null;
    const result = await window.electronAPI.getAllScreenResolutions();
    if (result.success) {
      resolutions.value = result.data;
      if (currentResolution.value) {
        const current = result.data.find(
          (r) =>
            r.width === currentResolution.value.width &&
            r.height === currentResolution.value.height
        );
        if (current) {
          selectedResolution.value = JSON.stringify(current);
        }
      }
    } else {
      resolutionsError.value = result.error;
    }
  } catch (err) {
    resolutionsError.value = err.message;
  }
};

const refreshResolutions = async () => {
  await fetchCurrentResolution();
  await fetchAllResolutions();
};

const applyResolution = async () => {
  if (!selectedResolution.value || isSetting.value) return;

  const resolution = JSON.parse(selectedResolution.value);
  isSetting.value = true;

  try {
    const result = await window.electronAPI.setScreenResolution(
      resolution.width,
      resolution.height
    );
    if (result.success) {
      await fetchCurrentResolution();
    } else {
      alert(t("screen.setFailed", { error: result.error }));
    }
  } catch (err) {
    alert(t("screen.setFailed", { error: err.message }));
  } finally {
    isSetting.value = false;
  }
};

onMounted(() => {
  refreshResolutions();
});
</script>

<style scoped>
.screen-resolution-container {
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

.current-resolution-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.resolution-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.resolution-value {
  font-size: 48px;
  font-weight: 700;
}

.separator {
  font-size: 32px;
  opacity: 0.8;
}

.resolution-label {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.9;
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

.select-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.resolution-select {
  flex: 1;
}

.apply-btn {
  flex-shrink: 0;
}
</style>