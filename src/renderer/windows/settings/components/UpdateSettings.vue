<template>
  <div class="settings-section">
    <div class="update-content">
      <NButton
        type="primary"
        size="medium"
        :loading="checkingUpdate"
        class="update-btn"
        @click="checkUpdate"
      >
        {{ t("common.checkUpdate") }}
      </NButton>
      <div v-if="updateStatus" class="update-status">
        <NAlert
          v-if="updateStatus === 'no-update'"
          type="success"
          :title="t('settings.noUpdate')"
          :closable="false"
        />
        <NAlert
          v-else-if="updateStatus === 'update-available'"
          type="info"
          :title="updateMessage"
          :closable="false"
        />
        <NAlert
          v-else-if="updateStatus === 'error'"
          type="error"
          :title="t('settings.updateError')"
          :closable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NAlert } from "naive-ui";

const { t } = useI18n();

const checkingUpdate = ref(false);
const updateStatus = ref(null);
const updateMessage = ref("");

const checkUpdate = async () => {
  checkingUpdate.value = true;
  updateStatus.value = null;
  try {
    const result = await window.electronAPI.checkForUpdates();
    if (result.status === "no-update") {
      updateStatus.value = "no-update";
    } else if (result.status === "update-available") {
      updateStatus.value = "update-available";
      updateMessage.value = result.message;
    }
  } catch (error) {
    console.error("检查更新失败:", error);
    updateStatus.value = "error";
  } finally {
    checkingUpdate.value = false;
  }
};
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}
.update-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.update-btn {
  align-self: flex-start;
}
.update-status {
  width: 100%;
}
</style>