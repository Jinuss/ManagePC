<template>
  <div class="app-container" :platform="isMac ? 'mac' : 'win'">
    <CustomTitleBar v-if="!isMac" />
    <div v-else class="mac-titlebar-drag"></div>
    <div class="app-body">
      <div class="fixed-sidebar">
        <div class="fixed-sidebar-top">
          <div class="fixed-sidebar-menu">
            <NTooltip placement="right" trigger="hover">
              <template #trigger>
                <span class="menu-icon" @click="() => (activeTab = 'system')"
                  >🔧</span
                >
              </template>
              <span>{{ t("menu.monitoring") }}</span>
            </NTooltip>
          </div>
        </div>
        <div class="fixed-sidebar-bottom">
          <div class="settings-section">
            <NTooltip placement="right" trigger="hover">
              <template #trigger>
                <NButton
                  class="settings-btn"
                  @click="() => (activeTab = 'logs')"
                  size="small"
                  type="text"
                  >📋</NButton
                >
              </template>
              <span>{{ t("menu.logs") }}</span>
            </NTooltip>
          </div>
          <div class="settings-section">
            <NTooltip placement="right" trigger="hover">
              <template #trigger>
                <NButton
                  class="settings-btn"
                  @click="openSettings"
                  size="small"
                  type="text"
                  >⚙️</NButton
                >
              </template>
              <span>{{ t("common.settings") }}</span>
            </NTooltip>
          </div>
        </div>
      </div>
      <aside class="sidebar" v-if="activeTab !== 'logs'">
        <NMenu
          :value="activeTab"
          :options="menuOptions"
          class="sidebar-menu"
          mode="vertical"
          @update:value="handleMenuSelect"
        />
      </aside>
      <main class="main-content">
        <div class="content-panel">
          <keep-alive include="PCMonitor">
            <component :is="currentComponent" />
          </keep-alive>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, h } from "vue";
import { NMenu, NButton, NTooltip, useNotification, NProgress } from "naive-ui";
import { usePlatform } from "../composables/usePlatform";
import { useMenuOptions } from "../composables/useMenuOptions";
import CustomTitleBar from "./CustomTitleBar.vue";
import { componentMap } from "../config";
import { useDialog } from "../composables/useDialog.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { isMac } = usePlatform();

const { activeTab, menuOptions, handleMenuSelect } = useMenuOptions();

const { confirm } = useDialog();

const openSettings = async () => {
  await window.electronAPI.openSettingsWindow();
};

const currentComponent = computed(() => {
  return componentMap[activeTab.value] || componentMap.system;
});

let removeUpdateAvailableListener = null;

const handleUpdateAvailable = (updateInfo) => {
  console.log("🚀 ~ handleUpdateAvailable ~ updateInfo:", updateInfo);
  confirm({
    title: `${t("settings.updateAvailable")} ${updateInfo.version}`,
    content: () =>
      updateInfo.releaseNotes
        ? h("div", {
            class: "release-notes",
            innerHTML: updateInfo.releaseNotes,
          })
        : t("settings.noReleaseNotes"),
    positiveText: t("settings.downloadNow"),
    negativeText: t("settings.remindLater"),
    maskClosable: false,
    onPositive: () => {
      handleDownloadProgress();
    },
  });
};

const notification = useNotification();

const progrssNotif = ref();

const handleDownloadProgress = () => {
  progrssNotif.value = notification.create({
    title: "下载中",
    description: "正在下载更新，请稍后...",
    content: () => h(NProgress, { percentage: 0 }),
    duration: 0,
    closable: false,
  });

  window.electronAPI.onDownloadProgress((progress) => {
    console.log("🚀 ~ handleDownloadProgress ~ progress:", progress);

    progrssNotif.value.content = () =>
      h(NProgress, { percentage: progress.percent * 100 });
  });
  window.electronAPI.onUpdateDownloaded(() => {
    progrssNotif.value.destroy();
    console.log("🚀 ~ handleDownloadProgress ~ onDownloadComplete");
  });
  window.electronAPI.downloadUpdate();
};

onMounted(() => {
  // macos 不监听更新事件
  if (isMac) return;

  if (
    window.electronAPI &&
    window.electronAPI.onUpdateAvailable &&
    window.electronAPI.checkForUpdates
  ) {
    // 监听
    removeUpdateAvailableListener = window.electronAPI.onUpdateAvailable(
      handleUpdateAvailable,
    );
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

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: var(--color-bg-secondary);
  height: 100%;
  width: 100%;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app-container[platform="mac"] {
  .fixed-sidebar {
    padding: 40px 18px 20px;
  }

  .sidebar {
    padding-top: 40px;
  }

  .main-content {
    padding-top: 40px;
  }
}

.mac-titlebar-drag {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  -webkit-app-region: drag;
  z-index: 9999;
  pointer-events: none;
}

.fixed-sidebar {
  background: var(--color-titlebar-bg);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fixed-sidebar-menu {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.fixed-sidebar-menu .menu-icon {
  font-size: 24px;
}

.sidebar {
  width: 200px;
  background: var(--color-bg-primary);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.n-menu-item) {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-menu :deep(.n-menu-item:hover) {
  background: rgba(102, 126, 234, 0.1);
}

.sidebar-menu :deep(.n-menu-item.n-menu-item--active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-menu :deep(.n-menu-item.n-menu-item--active .menu-icon) {
  color: white;
}

.fixed-sidebar-bottom {
  font-size: 24px;
}

.settings-section {
  display: flex;
  justify-content: center;
}

.settings-btn {
  font-size: 1.2rem;
  padding: 8px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.content-panel {
  height: 100%;
  background: var(--color-bg-primary);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding-top: 10px;
  }

  .sidebar-menu :deep(.n-menu-item) {
    width: calc(33.33% - 16px);
    text-align: center;
    padding: 0 10px;
  }

  .sidebar-menu :deep(.menu-icon) {
    display: block;
    margin-right: 0;
    margin-bottom: 4px;
  }

  .sidebar-menu :deep(.n-menu-item span:last-child) {
    font-size: 0.75rem;
  }

  .main-content {
    padding: 10px;
  }
}
</style>
