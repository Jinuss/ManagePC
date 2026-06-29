<template>
  <NConfigProvider :theme="naiveTheme" style="height: 100%; width: 100%">
    <div class="settings-window" :platform="isMac ? 'mac' : 'win'">
      <div class="settings-header">
        <div class="mac-controls">
          <button
            v-if="isMac"
            class="mac-close-button"
            :class="{ inactive: !isActive }"
            @click="closeWindow"
          >
            <span class="mac-close-icon">✕</span>
          </button>
        </div>
        <div class="windows-controls">
          <button
            v-if="!isMac"
            class="control-btn close-btn"
            @click="closeWindow"
            :title="t('common.close')"
          >
            <span class="icon">✕</span>
          </button>
        </div>
      </div>
      <div class="settings-body">
        <aside class="settings-sidebar">
          <NMenu
            :value="activeTab"
            :options="menuOptions"
            class="sidebar-menu"
            mode="vertical"
            @update:value="handleMenuSelect"
          />
        </aside>
        <main class="settings-main">
          <component :is="componentMap[activeTab]" />
        </main>
      </div>
    </div>
  </NConfigProvider>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from "vue";
import { NConfigProvider, NMenu } from "naive-ui";
import { darkTheme } from "naive-ui";
import { useTheme } from "../../composables/useTheme";
import { usePlatform } from "../../composables/usePlatform";
import { THEME_IDS } from "../../constants";
import { useI18n } from "vue-i18n";
import { componentMap } from "./config.js";

const { t } = useI18n();
const { isMac } = usePlatform();
const { theme } = useTheme();

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

const activeTab = ref("common");

const menuOptions = computed(() => [
  {
    label: t("settings.common"),
    key: "common",
    icon: () => h("span", { class: "menu-icon" }, "⚙️"),
  },
  {
    label: t("settings.theme"),
    key: "theme",
    icon: () => h("span", { class: "menu-icon" }, "🎨"),
  },
  {
    label: t("settings.about"),
    key: "about",
    icon: () => h("span", { class: "menu-icon" }, "ℹ️"),
  },
]);

const handleMenuSelect = (key) => {
  activeTab.value = key;
};

const closeWindow = () => {
  window.electronAPI.closeSettingsWindow();
};

const isActive = ref(true);

let blurHandler = null;
let focusHandler = null;

onMounted(async () => {
  if (window.electronAPI && window.electronAPI.onWindowBlur) {
    blurHandler = window.electronAPI.onWindowBlur(() => {
      isActive.value = false;
    });
  }

  if (window.electronAPI && window.electronAPI.onWindowFocus) {
    focusHandler = window.electronAPI.onWindowFocus(() => {
      isActive.value = true;
    });
  }
});

onUnmounted(() => {
  if (blurHandler) blurHandler();
  if (focusHandler) focusHandler();
});
</script>

<style>
.settings-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-bg-secondary);
}

.settings-header {
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
  user-select: none;
  justify-content: space-between;
  height: 32px;
}

.mac-controls {
  display: flex;
  align-items: center;
  width: 180px;
  height: 32px;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
}

.windows-controls {
  display: flex;
  flex: 1;
  gap: 4px;
  height: 32px;
  justify-content: flex-end;
}

.mac-close-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: #ff5f56;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
}

.mac-close-button:hover {
  background-color: #ff3b30;
}

.mac-close-button:hover .mac-close-icon {
  opacity: 1;
}

.mac-close-icon {
  font-size: 11px;
  color: #000;
  opacity: 0;
  transition: opacity 0.15s ease;
  line-height: 1;
  font-weight: bold;
}

.mac-close-button.inactive {
  background-color: #c0c0c0;
}

.mac-close-button.inactive:hover {
  background-color: #a0a0a0;
}

.settings-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.settings-window[platform="mac"] .settings-title {
  text-align: center;
  font-size: 13px;
}

.close-btn {
  font-size: 20px;
  color: var(--color-text-secondary);
  padding: 0;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.settings-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.settings-sidebar {
  width: 180px;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
  padding: 16px 0;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.n-menu-item) {
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
  margin: 2px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.sidebar-menu :deep(.n-menu-item:hover) {
  background-color: rgba(102, 126, 234, 0.1);
}

.sidebar-menu :deep(.n-menu-item.n-menu-item--active) {
  background-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-icon {
  font-size: 16px;
  margin-right: 8px;
}

.settings-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.control-btn {
  -webkit-app-region: no-drag;
  width: 46px;
  height: 32px;
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
  padding: 0;
}
.control-btn .icon {
  font-size: 14px;
  color: var(--color-titlebar-text);
  transition: color var(--transition-normal);
  line-height: 1;
}

.control-btn.close-btn:hover {
  background-color: #e81123;
}

.control-btn.close-btn:hover .icon {
  color: #ffffff;
}
</style>
