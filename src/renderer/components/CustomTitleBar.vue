<template>
  <div class="custom-titlebar" :class="{ 'is-mac': isMac }">
    <div class="titlebar-left">
      <div class="app-icon">⚙️</div>
      <span class="app-title">{{ t("header.title") }}</span>
    </div>
    <div class="titlebar-center"></div>
    <div class="titlebar-right">
      <div class="window-controls">
        <button
          class="control-btn pin-btn"
          :class="{ 'is-pinned': isAlwaysOnTop }"
          @click="toggleAlwaysOnTop"
          :title="isAlwaysOnTop ? t('common.unpin') : t('common.pin')"
        >
          <span class="icon">📌</span>
        </button>
        <button
          class="control-btn minimize-btn"
          @click="minimizeWindow"
          :title="t('common.minimize')"
        >
          <span class="icon">−</span>
        </button>
        <button
          class="control-btn maximize-btn"
          @click="maximizeWindow"
          :title="isMaximized ? t('common.restore') : t('common.maximize')"
        >
          <span class="icon">{{ isMaximized ? "⧉" : "□" }}</span>
        </button>
        <button
          class="control-btn close-btn"
          @click="closeWindow"
          :title="t('common.close')"
        >
          <span class="icon">✕</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const platformInfo = window.electronAPI.getPlatform();
const isMac = platformInfo.isMac;

const isMaximized = ref(false);
const isAlwaysOnTop = ref(false);

const minimizeWindow = () => {
  window.electronAPI.minimizeWindow();
};

const maximizeWindow = async () => {
  await window.electronAPI.maximizeWindow();
  updateMaximizedState();
};

const closeWindow = () => {
  window.electronAPI.closeWindow();
};

const toggleAlwaysOnTop = async () => {
  const newValue = !isAlwaysOnTop.value;
  await window.electronAPI.setAlwaysOnTop(newValue);
  isAlwaysOnTop.value = newValue;
};

const updateMaximizedState = async () => {
  try {
    const result = await window.electronAPI.isWindowMaximized();
    isMaximized.value = result.maximized;
  } catch (error) {
    console.error("Failed to check window state:", error);
  }
};

const updateAlwaysOnTopState = async () => {
  try {
    const result = await window.electronAPI.getAlwaysOnTop();
    isAlwaysOnTop.value = result.alwaysOnTop;
  } catch (error) {
    console.error("Failed to get always on top state:", error);
  }
};

let checkMaximizedInterval = null;

onMounted(() => {
  updateMaximizedState();
  updateAlwaysOnTopState();
  checkMaximizedInterval = setInterval(updateMaximizedState, 200);
});

onUnmounted(() => {
  if (checkMaximizedInterval) {
    clearInterval(checkMaximizedInterval);
  }
});
</script>

<style scoped>
.custom-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: var(--color-titlebar-bg);
  padding-left: 8px;
  -webkit-app-region: drag;
  user-select: none;
  z-index: 1000;
  transition: background-color var(--transition-normal);
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.app-icon {
  font-size: 16px;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-titlebar-text);
  transition: color var(--transition-normal);
}

.titlebar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--color-titlebar-text-secondary);
  transition: color var(--transition-normal);
}

.titlebar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
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

.control-btn:hover {
  background-color: var(--color-titlebar-hover);
}

.control-btn .icon {
  font-size: 14px;
  color: var(--color-titlebar-text);
  transition: color var(--transition-normal);
  line-height: 1;
}

.control-btn.pin-btn.is-pinned {
  color: #1890ff;
}

.control-btn.pin-btn.is-pinned .icon {
  color: #1890ff;
}

.control-btn.close-btn:hover {
  background-color: #e81123;
}

.control-btn.close-btn:hover .icon {
  color: #ffffff;
}

.is-mac .window-controls {
  order: -1;
}

.is-mac .titlebar-left {
  flex: 1;
  justify-content: center;
}

.is-mac .titlebar-center {
  display: none;
}

@media (max-width: 768px) {
  .titlebar-center {
    display: none;
  }
}
</style>
