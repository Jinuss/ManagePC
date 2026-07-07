<template>
  <NConfigProvider :theme="naiveTheme" style="height: 100%; width: 100%">
    <NDialogProvider>
      <NNotificationProvider placement="bottom-right">
        <NMessageProvider>
          <Content />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
} from "naive-ui";
import { darkTheme } from "naive-ui";
import { useTheme } from "./composables/useTheme";
import { THEME_IDS } from "./constants";
import Content from "./layout/index.vue";

const { locale } = useI18n();

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

onMounted(() => {
  if (window.electronAPI && window.electronAPI.onLanguageChanged) {
    window.electronAPI.onLanguageChanged((language) => {
      locale.value = language;
    });
  }
});
</script>
