<template>
  <div style="width: 0; height: 0">自动下载占位</div>
</template>
<script setup>
import { onMounted } from "vue";
import { usePlatform } from "@/composables/usePlatform.js";

const { isMac } = usePlatform();

onMounted(() => {
  // macos 不监听更新事件
  if (isMac) return;

  // 获取是否自动下载
  const autoUpdate = window.electronAPI.getAutoUpdate();
  if (!autoUpdate) {
    console.log("自动下载更新已关闭");
    return;
  }

  // 检查更新并下载
  try {
    window.electronAPI.checkForUpdatesAndDownload();
  } catch (error) {
    console.error("检查更新并下载失败:", error);
  }
});

</script>
