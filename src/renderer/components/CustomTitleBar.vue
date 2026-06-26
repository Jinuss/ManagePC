<template>
  <div class="custom-titlebar" :class="{ 'is-mac': isMac }">
    <div class="titlebar-left">
      <div class="app-icon">⚙️</div>
      <span class="app-title">{{ t("header.title") }}</span>
    </div>
    <div class="titlebar-right">
      </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const platformInfo = window.electronAPI.getPlatform();
const isMac = computed(() => platformInfo.isMac);
</script>

<style scoped>
.custom-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: var(--color-titlebar-bg);
  padding: 0 8px;
  -webkit-app-region: drag;
  user-select: none;
  margin-right: 137px;
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
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn .icon {
  font-size: 12px;
  color: var(--color-titlebar-text);
}

.close-btn:hover {
  background: #e81123;
}

@media (max-width: 768px) {
  .titlebar-center {
    display: none;
  }
}
</style>
