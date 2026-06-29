<template>
  <div class="settings-section">
    <div class="language-options">
      <span>{{ t("settings.language") }}</span>
      <NSelect
        v-model:value="currentLocale"
        :options="LANGUAGES"
        :consistent-menu-width="false"
        menu-size="small"
        @change="switchLanguage"
        style="width: 120px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { NSelect } from "naive-ui";
import { LANGUAGES } from "../../../../../constants";

const { t, locale } = useI18n();
const currentLocale = ref(locale.value);

let languageChangedHandler = null;

const switchLanguage = (code) => {
  window.electronAPI.setLanguage(code);
};

onMounted(async () => {
  const savedLanguage = await window.electronAPI.getSavedLanguage();
  if (savedLanguage.language) {
    locale.value = savedLanguage.language;
    currentLocale.value = savedLanguage.language;
  }

  if (window.electronAPI && window.electronAPI.onLanguageChanged) {
    languageChangedHandler = window.electronAPI.onLanguageChanged(
      (language) => {
        locale.value = language;
        currentLocale.value = language;
      },
    );
  }
});

onUnmounted(() => {
  if (languageChangedHandler) {
    languageChangedHandler();
  }
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}

.language-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
</style>
