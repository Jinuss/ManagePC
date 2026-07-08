<template>
  <div class="settings-section">
    <div class="auto-Update-content">
      <span class="auto-Update-label">{{ t("settings.autoUpdateLabel") }}</span>
      <NSwitch
        :value="autoUpdate"
        @update:value="toggleAutoUpdate"
        class="auto-Update-switch"
        :round="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { NSwitch } from "naive-ui";

const { t } = useI18n();

const autoUpdate = ref(false);

const toggleAutoUpdate = (value) => {
  window.electronAPI.setAutoUpdate(value);
  autoUpdate.value = value;
};

onMounted(async () => {
  try {
    const result = await window.electronAPI.getAutoUpdate();
    console.log("🚀 ~ result:", result)
    autoUpdate.value = result.autoUpdate;
  } catch {
    autoUpdate.value = false;
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}
.auto-Update-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.auto-Update-label {
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>
