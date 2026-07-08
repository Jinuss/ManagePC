<template>
  <div class="update-content">
    <NButton
      type="primary"
      size="medium"
      :loading="checkingUpdate"
      class="update-btn"
      @click="checkUpdate"
      v-if="!hasUpdate"
      :disabled="checkingUpdate"
    >
      <span>
        {{ t("common.checkUpdate") }}
      </span>
    </NButton>
    <n-badge :value="1" dot v-else>
      <NButton
        type="info"
        size="medium"
        class="update-btn"
        @click="checkUpdateAndInstall"
      >
        <span>{{ t("settings.restartAndInstall") }}</span>
      </NButton>
    </n-badge>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NBadge, useMessage } from "naive-ui";
import { useAppVersionStore } from "@/store/useAppVersion";
import { useDialog } from "@/composables/useDialog";
import { usePlatform } from "@/composables/usePlatform";

const { t } = useI18n();
const { isMac } = usePlatform();
const { hasUpdate, setHasUpdate } = useAppVersionStore();
const message = useMessage();

const checkingUpdate = ref(false);

const checkUpdate = async () => {
  if (checkingUpdate.value) {
    message.warning(t("settings.checkingUpdate"));
    return;
  }
  checkingUpdate.value = true;
  try {
    await window.electronAPI.checkForUpdates();
    //TODO: 最后一步确定更新后关闭窗口
    window.electronAPI.closeSettingsWindow();
  } catch (error) {
    console.error("检查更新失败:", error);
  } finally {
    checkingUpdate.value = false;
  }
};

const { confirm } = useDialog();

const checkUpdateAndInstall = () => {
  confirm({
    title: t("settings.downloadComplete"),
    content: t("settings.exitAndInstall"),
    positiveText: t("settings.exitInstall"),
    negativeText: t("settings.installLater"),
    maskClosable: false,
    onPositive: () => {
      window.electronAPI.installUpdate();
    },
  });
};

let removeUpdateAvailableListener = null;
onMounted(() => {
  if (isMac) return;
  removeUpdateAvailableListener = window.electronAPI.onUpdateAutoDownload(
    () => {
      setHasUpdate(true);
    },
  );
  onUnmounted(() => {
    removeUpdateAvailableListener();
  });
});
</script>

<style scoped>
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
.update-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.update-version {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}
.update-message {
  font-size: 16px;
  color: var(--text-primary-color);
}
.update-release-notes {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 12px;
}
.release-notes-title {
  font-weight: bold;
  margin-bottom: 8px;
}
.release-notes-content {
  font-size: 14px;
  color: var(--text-secondary-color);
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
}
.download-progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.download-progress-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary-color);
}
.update-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
