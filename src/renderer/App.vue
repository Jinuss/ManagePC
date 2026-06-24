<template>
  <NConfigProvider :theme="naiveTheme">
    <div class="app-container">
      <CustomTitleBar />
      <div class="app-body">
        <div class="fixed-sidebar">
          <div class="fixed-sidebar-content">
            <div class="fixed-sidebar-menu">
              <NTooltip placement="right" trigger="hover">
                <template #trigger>
                <span class="menu-icon">🔧</span>
                </template>
                <span>{{ t('menu.monitoring') }}</span>
              </NTooltip>
            </div>
          </div>
        </div>
        <aside class="sidebar">
          <NMenu
            :value="activeTab"
            :options="menuOptions"
            class="sidebar-menu"
            mode="vertical"
            @update:value="handleMenuSelect"
          />

          <div class="sidebar-bottom">
            <div class="update-section">
              <NButton
                class="update-btn"
                @click="checkUpdate"
                size="small"
                type="primary"
                :loading="checkingUpdate"
              >
                🔄 {{ t("common.checkUpdate") }}
              </NButton>
            </div>
            <div class="theme-section">
              <ThemeSwitcher />
            </div>
          </div>
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
  </NConfigProvider>
</template>

<script setup>
import { ref, onMounted, computed, defineAsyncComponent, h } from "vue";
import { useI18n } from "vue-i18n";
import { NConfigProvider, NMenu, NButton, NTooltip } from "naive-ui";
import { darkTheme } from "naive-ui";
import {
  useTheme,
  initTheme,
  setupSystemThemeListener,
} from "./composables/useTheme";
import CustomTitleBar from "./components/CustomTitleBar.vue";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";

const { t } = useI18n();

// 初始化主题
initTheme();
setupSystemThemeListener();

const { theme } = useTheme();

// Naive UI 主题
const naiveTheme = computed(() => {
  if (theme.value === "dark") {
    return darkTheme;
  }
  if (theme.value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkTheme
      : null;
  }
  return null;
});

const activeTab = ref("system");
const checkingUpdate = ref(false);

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

const checkUpdate = async () => {
  checkingUpdate.value = true;
  try {
    const result = await window.electronAPI.checkForUpdates();
    if (result.status === "no-update") {
      // message.success(result.message);
    }
  } catch (error) {
    console.error("检查更新失败:", error);
    // message.error("检查更新失败");
  } finally {
    checkingUpdate.value = false;
  }
};

const componentMap = {
  system: defineAsyncComponent(() => import("./components/StaticInfo.vue")),
  network: defineAsyncComponent(() => import("./components/SystemInfo.vue")),
  disk: defineAsyncComponent(() => import("./components/DiskUsage.vue")),
  battery: defineAsyncComponent(() => import("./components/BatteryStatus.vue")),
  monitor: defineAsyncComponent(() => import("./components/PCMonitor.vue")),
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
});
</script>

<style>
.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: var(--color-bg-secondary);
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.fixed-sidebar {
  background: var(--color-bg-primary);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
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

.menu-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.sidebar-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 200px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

.update-section {
  margin-bottom: 12px;
}

.update-btn {
  width: 100%;
  border-radius: 8px;
}

.theme-section {
  display: flex;
  justify-content: center;
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

  .sidebar-bottom {
    position: static;
    width: auto;
  }
}
</style>
