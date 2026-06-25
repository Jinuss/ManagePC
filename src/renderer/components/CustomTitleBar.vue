<template>
  <div class="custom-titlebar" :class="{ 'is-mac': isMac }">
    <div class="titlebar-left">
      <div class="app-icon">⚙️</div>
      <span class="app-title">{{ t("header.title") }}</span>
    </div>
    <div class="titlebar-right">
      <div class="language-switcher">
        <NButton
          v-for="lang in languages"
          :key="lang.code"
          @click="switchLanguage(lang.code)"
          :type="currentLocale === lang.code ? 'primary' : 'text'"
          size="small"
          class="lang-btn"
        >
          {{ lang.name }}
        </NButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";

const { t, locale } = useI18n();

const platformInfo = window.electronAPI.getPlatform();
const isMac = computed(() => platformInfo.isMac);
const currentLocale = ref(locale.value);

const languages = [
  { code: "zh", name: "中文" },
  { code: "en", name: "EN" },
];

const switchLanguage = (code) => {
  locale.value = code;
  currentLocale.value = code;
};
</script>

<style scoped>
.custom-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: #2f3241;
  padding: 0 8px;
  -webkit-app-region: drag;
  user-select: none;
  margin-right: 137px;
  z-index: 1000;
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
  color: white;
}

.titlebar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.titlebar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.language-switcher {
  display: flex;
  gap: 4px;
}

.lang-btn {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.lang-btn.n-button--text {
  color: rgba(255, 255, 255, 0.8);
}

.lang-btn.n-button--text:hover {
  background: rgba(255, 255, 255, 0.2);
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
  color: white;
}

.close-btn:hover {
  background: #e81123;
}

.is-mac .window-controls {
  order: -1;
}

.is-mac .language-switcher {
  order: 1;
}

@media (max-width: 768px) {
  .titlebar-center {
    display: none;
  }

  .language-switcher {
    display: none;
  }
}
</style>
