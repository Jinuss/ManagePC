<template>
  <NConfigProvider :theme="naiveTheme" style="height: 100%; width: 100%">
    <div class="app-container" :platform="isMac ? 'mac' : 'win'">
      <CustomTitleBar v-if="!isMac" />
      <div v-if="isMac" class="mac-titlebar-drag"></div>
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
                  >
                    📋
                  </NButton>
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
                  >
                    ⚙️
                  </NButton>
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
          <n-message-provider>
            <div class="content-panel">
              <keep-alive include="PCMonitor">
                <component :is="currentComponent" />
              </keep-alive>
            </div>
          </n-message-provider>
        </main>
      </div>
    </div>
  </NConfigProvider>
</template>

<script setup>
import { ref, onMounted, computed, h } from "vue";
import { useI18n } from "vue-i18n";
import {
  NConfigProvider,
  NMessageProvider,
  NMenu,
  NButton,
  NTooltip,
} from "naive-ui";
import { darkTheme } from "naive-ui";
import { useTheme, initTheme } from "./composables/useTheme";
import { usePlatform } from "./composables/usePlatform";
import { THEME_IDS } from "./constants";
import CustomTitleBar from "./components/CustomTitleBar.vue";
import { componentMap } from "./config";

const { t, locale } = useI18n();
const { isMac } = usePlatform();

initTheme();

const { theme } = useTheme();

// Naive UI 主题
const naiveTheme = computed(() => {
  if (theme.value === THEME_IDS.DARK) {
    return darkTheme;
  }
  if (theme.value === THEME_IDS.SYSTEM) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkTheme
      : null;
  }
  return null;
});

const activeTab = ref("system");

const systemInfo = ref({});

const menuOptions = computed(() => [
  {
    label: t("menu.system"),
    key: "system",
    icon: () => h("span", { class: "menu-icon" }, "📊"),
  },
  {
    label: t("menu.network"),
    key: "network",
    icon: () => h("span", { class: "menu-icon" }, "📡"),
  },
  {
    label: t("menu.disk"),
    key: "disk",
    icon: () => h("span", { class: "menu-icon" }, "💾"),
  },
  {
    label: t("menu.battery"),
    key: "battery",
    icon: () => h("span", { class: "menu-icon" }, "🔋"),
  },
  {
    label: t("menu.monitor"),
    key: "monitor",
    icon: () => h("span", { class: "menu-icon" }, "📈"),
  },
]);

const handleMenuSelect = (index) => {
  activeTab.value = index;
};

const openSettings = async () => {
  await window.electronAPI.openSettingsWindow();
};

const currentComponent = computed(() => {
  return componentMap[activeTab.value] || componentMap.system;
});

const fetchSystemInfo = async () => {
  try {
    const data = await window.electronAPI.getSystemInfo();
    systemInfo.value = data;
  } catch (error) {
    console.error("获取系统信息失败:", error);
  }
};

onMounted(() => {
  fetchSystemInfo();

  if (window.electronAPI && window.electronAPI.onLanguageChanged) {
    window.electronAPI.onLanguageChanged((language) => {
      locale.value = language;
    });
  }
});
</script>

<style>
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
