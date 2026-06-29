<template>
  <div class="settings-section">
    <div class="theme-options">
      <NButton
        v-for="themeItem in themes"
        :key="themeItem.id"
        :type="theme.value === themeItem.id ? 'primary' : 'default'"
        size="medium"
        class="theme-option-btn"
        @click="setTheme(themeItem.id)"
      >
        <span>{{ themeItem.icon }}</span>
        <span>{{ themeItem.label }}</span>
      </NButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";
import {
  useTheme,
  initTheme,
  setupSystemThemeListener,
  setupThemeChangeListener,
} from "../../../composables/useTheme";
import { THEME_IDS, THEME_ICONS } from "../../../constants";

const { t } = useI18n();
const { theme } = useTheme();

const themes = computed(() => [
  {
    id: THEME_IDS.LIGHT,
    label: t("settings.themeLight"),
    icon: THEME_ICONS.LIGHT,
  },
  {
    id: THEME_IDS.DARK,
    label: t("settings.themeDark"),
    icon: THEME_ICONS.DARK,
  },
  {
    id: THEME_IDS.SYSTEM,
    label: t("settings.themeSystem"),
    icon: THEME_ICONS.SYSTEM,
  },
]);

const setTheme = (newTheme) => {
  window.electronAPI.setTheme(newTheme);
};

let themeChangedHandler = null;
let systemThemeHandler = null;

const applyTheme = (themeId) => {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark", "theme-system");
  root.classList.add("theme-" + themeId);
  if (themeId === THEME_IDS.SYSTEM) {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? THEME_IDS.DARK
      : THEME_IDS.LIGHT;
    root.classList.add("theme-" + systemTheme);
  }
};

onMounted(async () => {
  await initTheme();
  setupSystemThemeListener();
  setupThemeChangeListener();

  const savedTheme = await window.electronAPI.getSavedTheme();
  if (savedTheme.theme) {
    theme.value = savedTheme.theme;
    applyTheme(savedTheme.theme);
  }

  if (window.electronAPI && window.electronAPI.onThemeChanged) {
    themeChangedHandler = window.electronAPI.onThemeChanged((newTheme) => {
      theme.value = newTheme;
      applyTheme(newTheme);
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeHandler = (e) => {
    if (theme.value === THEME_IDS.SYSTEM) {
      const systemTheme = e.matches ? THEME_IDS.DARK : THEME_IDS.LIGHT;
      document.documentElement.classList.remove(
        "theme-" + THEME_IDS.LIGHT,
        "theme-" + THEME_IDS.DARK,
      );
      document.documentElement.classList.add("theme-" + systemTheme);
    }
  };
  mediaQuery.addEventListener("change", systemThemeHandler);
});

onUnmounted(() => {
  if (themeChangedHandler) themeChangedHandler();
  if (systemThemeHandler) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.removeEventListener("change", systemThemeHandler);
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}
.theme-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.theme-option-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
}
</style>
