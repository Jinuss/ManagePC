<template>
  <div class="log-viewer">
    <div class="log-header">
      <div class="log-info">
        <span class="log-mode-badge" :class="isDev ? 'dev' : 'prod'">
          {{ isDev ? "DEV" : "PROD" }}
        </span>
        <span class="log-path" :title="logPath" @click="handleOpenLogPath">{{
          shortPath
        }}</span>
      </div>
      <div class="log-actions">
        <NButton size="tiny" @click="refreshLogs" :loading="loading">
          {{ t("logViewer.refresh") }}
        </NButton>
        <NButton size="tiny" type="warning" @click="handleClearLogs">
          {{ t("logViewer.clear") }}
        </NButton>
      </div>
    </div>
    <div class="log-stats">
      <span>{{ t("logViewer.lines") }}: {{ logInfo.lineCount }}</span>
      <span>{{ t("logViewer.size") }}: {{ formattedSize }}</span>
      <span
        >初始只能显示最近的500条日志，若要查看全部日志，请点击日志路径打开查看</span
      >
    </div>
    <div class="log-content" ref="logContainer">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-line"
        :class="log.level"
      >
        <span class="log-index">{{ index + 1 }}</span>
        <span class="log-time">{{ formatTime(log.timestamp) }}</span>
        <span class="log-level" :class="log.level"
          >[{{ log.level.toUpperCase() }}]</span
        >
        <span class="log-message">{{ log.message }}</span>
      </div>
      <div v-if="logs.length === 0 && !loading" class="log-empty">
        {{ t("logViewer.empty") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NMessageProvider, useMessage } from "naive-ui";

const { t } = useI18n();
const message = useMessage();

const logs = ref([]);
const loading = ref(false);
const logPath = ref("");
const logInfo = ref({ lineCount: 0, size: 0, isDev: false });
const logContainer = ref(null);
let removeLogListener = null;

const isDev = computed(() => logInfo.value.isDev);

const shortPath = computed(() => {
  const path = logPath.value;
  if (path.length > 50) {
    return "..." + path.slice(-47);
  }
  return path;
});

const formattedSize = computed(() => {
  const size = logInfo.value.size;
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  return (size / (1024 * 1024)).toFixed(2) + " MB";
});

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
};

const scrollToBottom = async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
};

const handleOpenLogPath = () => {
  if (logPath.value) {
    window.electronAPI.openLogPath(logPath.value);
  }
};

const refreshLogs = async () => {
  loading.value = true;
  try {
    const logData = await window.electronAPI.readLogs(500);
    logs.value = logData;
    logInfo.value = await window.electronAPI.getLogInfo();
    logPath.value = await window.electronAPI.getLogPath();
    await scrollToBottom();
  } catch (error) {
    console.error("Failed to load logs:", error);
    message.error(t("logViewer.loadError"));
  } finally {
    loading.value = false;
  }
};

const handleNewLogs = async (newLogs) => {
  if (newLogs && newLogs.length > 0) {
    logs.value.push(...newLogs);
    logInfo.value = await window.electronAPI.getLogInfo();
    await scrollToBottom();
  }
};

const handleClearLogs = async () => {
  try {
    const result = await window.electronAPI.clearLogs();
    if (result.success) {
      message.success(t("logViewer.clearSuccess"));
      await refreshLogs();
    } else {
      message.error(result.error || t("logViewer.clearError"));
    }
  } catch (error) {
    console.error("Failed to clear logs:", error);
    message.error(t("logViewer.clearError"));
  }
};

onMounted(async () => {
  await refreshLogs();
  await window.electronAPI.startLogWatcher();
  removeLogListener = window.electronAPI.onLogUpdated(handleNewLogs);
});

onUnmounted(() => {
  if (removeLogListener) {
    removeLogListener();
  }
  window.electronAPI.stopLogWatcher();
});
</script>

<style scoped>
.log-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  overflow: hidden;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.log-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-mode-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.log-mode-badge.dev {
  background-color: #1890ff;
  color: white;
}

.log-mode-badge.prod {
  background-color: #52c41a;
  color: white;
}

.log-path {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: monospace;
  cursor: pointer;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-stats {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  line-height: 1.6;
  background-color: var(--color-bg-tertiary, #1e1e1e);
  color: var(--color-text-primary, #d4d4d4);
}

.log-line {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

.log-line.error {
  color: #f48771;
}

.log-line.warn {
  color: #dcdcaa;
}

.log-line.info {
  color: #4ec9b0;
}

.log-line.debug {
  color: #9cdcfe;
}

.log-index {
  color: #808080;
  flex-shrink: 0;
  width: 40px;
  text-align: right;
}

.log-time {
  color: #6a9955;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  font-weight: 600;
}

.log-level.error {
  color: #f48771;
}

.log-level.warn {
  color: #dcdcaa;
}

.log-level.info {
  color: #4ec9b0;
}

.log-level.debug {
  color: #9cdcfe;
}

.log-message {
  word-break: break-all;
  white-space: pre-wrap;
}

.log-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6a9955;
  font-style: italic;
}
</style>
