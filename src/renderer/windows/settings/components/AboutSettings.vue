<template>
  <div class="settings-section">
    <div class="about-content">
      <div class="about-item">
        <span class="about-label">{{ t("settings.version") }}:</span>
        <span class="about-value">{{ version }}</span>
      </div>
      <div class="about-item">
        <span class="about-label">Electron:</span>
        <span class="about-value">{{ versions.electron }}</span>
      </div>
      <div class="about-item">
        <span class="about-label">Node.js:</span>
        <span class="about-value">{{ versions.node }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const version = ref("");
const versions = ref({ electron: "", node: "" });

onMounted(async () => {
  const appVersions = window.electronAPI.getVersions();
  versions.value = { electron: appVersions.electron, node: appVersions.node };

  try {
    version.value = await window.electronAPI.getAppVersion();
  } catch {
    version.value = "1.0.0";
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.about-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}
.about-label {
  color: var(--color-text-secondary);
  font-size: 13px;
}
.about-value {
  color: var(--color-text-primary);
  font-size: 13px;
  font-family: monospace;
}
</style>
