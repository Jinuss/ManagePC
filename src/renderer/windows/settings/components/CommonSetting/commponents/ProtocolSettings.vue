<template>
  <div class="settings-section">
    <div class="protocol-content">
      <div class="protocol-label">
        <span>{{ t("settings.customProtocolLabel") }}</span>
        <span class="protocol-name">{{ t("settings.customProtocolName") }}</span>
      </div>
      <NSwitch
        :value="customProtocol"
        @update:value="toggleProtocol"
        class="protocol-switch"
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

const customProtocol = ref(false);

const toggleProtocol = async (value) => {
  const result = await window.electronAPI.setCustomProtocol(value);
  if (result.success) {
    customProtocol.value = value;
  }
};

onMounted(async () => {
  try {
    const result = await window.electronAPI.getCustomProtocol();
    customProtocol.value = result.customProtocol;
  } catch {
    customProtocol.value = false;
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}
.protocol-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.protocol-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
}
.protocol-name {
  color: var(--color-primary);
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
