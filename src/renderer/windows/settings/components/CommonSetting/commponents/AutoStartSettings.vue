<template>
  <div class="settings-section">
    <div class="auto-start-content">
      <span class="auto-start-label">{{
        t("settings.autoStartDescription")
      }}</span>
      <NSwitch
        :value="autoStart"
        @update:value="toggleAutoStart"
        class="auto-start-switch"
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

const autoStart = ref(false);

const toggleAutoStart = async (value) => {
  await window.electronAPI.setAutoStart(value);
  autoStart.value = value;
};

onMounted(async () => {
  try {
    const result = await window.electronAPI.getAutoStart();
    console.log("🚀 ~ result:", result)
    autoStart.value = result.autoStart;
  } catch {
    autoStart.value = false;
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}
.auto-start-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.auto-start-label {
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>
