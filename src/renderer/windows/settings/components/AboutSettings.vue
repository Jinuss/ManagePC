<template>
  <div class="settings-section">
    <div class="about-content">
      <div class="about-item">
        <span class="about-label">{{ t("settings.version") }}:</span>
        <span class="about-value">{{ version }}</span>
      </div>
      <UpdateSettings />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UpdateSettings from "./UpdateSettings.vue";

const { t } = useI18n();

const version = ref("");

onMounted(async () => {
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
  justify-content: space-between;
  align-items: center;
}
.about-item {
  display: flex;
  flex-direction: column;
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
