<template>
  <div class="update-content">
    <NButton
      type="primary"
      size="medium"
      :loading="checkingUpdate || downloading"
      class="update-btn"
      @click="checkUpdate"
    >
      <span>
        <span v-show="!checkingUpdate && !downloading"> 🔄</span>
        {{ checkingUpdate ? t("settings.checkingUpdate") : (downloading ? t("settings.downloading") : t("common.checkUpdate")) }}
      </span>
    </NButton>
    <div v-if="updateStatus" class="update-status">
      <NAlert
        v-if="updateStatus === 'no-update'"
        type="success"
        :title="t('settings.noUpdate')"
        :closable="false"
      />
      <NAlert
        v-else-if="updateStatus === 'error'"
        type="error"
        :title="t('settings.updateError')"
        :closable="false"
      />
    </div>

    <NModal v-model:show="showUpdateModal" preset="card" title="发现新版本" :closable="false">
      <div class="update-modal-content">
        <div class="update-version">{{ updateInfo.version }}</div>
        <div class="update-message">{{ updateInfo.message }}</div>
        <div v-if="updateInfo.releaseNotes" class="update-release-notes">
          <div class="release-notes-title">{{ t("settings.releaseNotes") }}</div>
          <div class="release-notes-content">{{ updateInfo.releaseNotes }}</div>
        </div>
        <div v-if="downloading" class="download-progress-section">
          <NProgress :percentage="downloadProgress" :show-indicator="true" />
          <div class="download-progress-text">{{ downloadProgress.toFixed(1) }}%</div>
        </div>
        <div class="update-modal-actions">
          <NButton v-if="!downloading && !downloaded" type="primary" @click="startDownload">
            {{ t("settings.downloadNow") }}
          </NButton>
          <NButton v-if="!downloading && !downloaded" @click="showUpdateModal = false">
            {{ t("settings.remindLater") }}
          </NButton>
          <NButton v-if="downloaded" type="primary" @click="installUpdate">
            {{ t("settings.restartNow") }}
          </NButton>
          <NButton v-if="downloaded" @click="showUpdateModal = false; downloaded = false">
            {{ t("settings.restartLater") }}
          </NButton>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NAlert, NModal, NProgress } from "naive-ui";

const { t } = useI18n();

const checkingUpdate = ref(false);
const downloading = ref(false);
const downloaded = ref(false);
const updateStatus = ref(null);
const updateMessage = ref("");
const updateInfo = ref({ version: "", message: "", releaseNotes: "" });
const showUpdateModal = ref(false);
const downloadProgress = ref(0);

let removeUpdateAvailableListener = null;
let removeDownloadProgressListener = null;
let removeUpdateDownloadedListener = null;
let removeUpdateErrorListener = null;

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
    console.error("检查更新失败:", error.message);
    updateStatus.value = "error";
  } finally {
    checkingUpdate.value = false;
  }
};

const startDownload = async () => {
  downloading.value = true;
  downloadProgress.value = 0;
  await window.electronAPI.downloadUpdate();
};

const installUpdate = async () => {
  await window.electronAPI.installUpdate();
};

const handleUpdateAvailable = (info) => {
  updateInfo.value = {
    version: info.version,
    message: info.message,
    releaseNotes: info.releaseNotes || ""
  };
  downloaded.value = false;
  downloading.value = false;
  downloadProgress.value = 0;
  showUpdateModal.value = true;
};

const handleDownloadProgress = (progress) => {
  downloadProgress.value = progress.percent || 0;
};

const handleUpdateDownloaded = () => {
  downloading.value = false;
  downloaded.value = true;
  showUpdateModal.value = true;
};

const handleUpdateError = (error) => {
  console.error("更新错误:", error);
  downloading.value = false;
  updateStatus.value = "error";
};

onMounted(() => {
  if (window.electronAPI && window.electronAPI.onUpdateAvailable) {
    removeUpdateAvailableListener = window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
  }
  if (window.electronAPI && window.electronAPI.onDownloadProgress) {
    removeDownloadProgressListener = window.electronAPI.onDownloadProgress(handleDownloadProgress);
  }
  if (window.electronAPI && window.electronAPI.onUpdateDownloaded) {
    removeUpdateDownloadedListener = window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
  }
  if (window.electronAPI && window.electronAPI.onUpdateError) {
    removeUpdateErrorListener = window.electronAPI.onUpdateError(handleUpdateError);
  }
});

onUnmounted(() => {
  if (removeUpdateAvailableListener) {
    removeUpdateAvailableListener();
  }
  if (removeDownloadProgressListener) {
    removeDownloadProgressListener();
  }
  if (removeUpdateDownloadedListener) {
    removeUpdateDownloadedListener();
  }
  if (removeUpdateErrorListener) {
    removeUpdateErrorListener();
  }
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