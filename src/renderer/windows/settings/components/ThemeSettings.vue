<template>
  <div class="settings-section">
    <div class="theme-options">
      <NButton
        v-for="themeItem in themes"
        :key="themeItem.id"
        :type="theme === themeItem.id ? 'primary' : 'default'"
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";
import { useTheme } from "../../../composables/useTheme";
import { THEME_IDS, THEME_ICONS } from "../../../constants";

const { t } = useI18n();
const { theme } = useTheme();
console.log("🚀 ~ theme:", theme)

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
