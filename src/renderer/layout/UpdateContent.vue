<script setup>
import { onMounted, onUnmounted } from "vue";
import { usePlatform } from "../composables/usePlatform.js";

const { isMac } = usePlatform();

const handleDownloadComplete = () => {
  window.electronAPI.notifyUpdateDownloaded();
};

let removeUpdateAvailableListener = null;

onMounted(() => {
  // macos 不监听更新事件
  if (isMac) return;

  // setTimeout(() => {
  //   handleDownloadComplete();
  // }, 10000);

  // 获取自动升级设置
  const autoUpdate = window.electronAPI.getAutoUpdate();
  if (autoUpdate) {
    // 监听
    removeUpdateAvailableListener = window.electronAPI.onUpdateAvailable({
      auto: true,
    });

    window.electronAPI.onUpdateDownloaded(() => {
      handleDownloadComplete();
    });

    // 检查更新
    try {
      window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error("检查更新失败:", error);
    }
  }
});

onUnmounted(() => {
  if (removeUpdateAvailableListener) {
    removeUpdateAvailableListener();
  }
});
</script>
