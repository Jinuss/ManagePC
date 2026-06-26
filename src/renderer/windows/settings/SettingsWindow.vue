<template>
  <NConfigProvider :theme="naiveTheme" style="height: 100%; width: 100%">
    <div class="settings-window">
      <div class="settings-header">
        <span class="settings-title">{{ t('settings.title') }}</span>
        <NButton
          type="text"
          size="small"
          class="close-btn"
          @click="closeWindow"
        >
          ✕
        </NButton>
      </div>
      <div class="settings-content">
        <div class="settings-section">
          <div class="section-title">
            <span class="section-icon">🌐</span>
            <span>{{ t('settings.language') }}</span>
          </div>
          <div class="language-options">
            <NButton
              v-for="lang in languages"
              :key="lang.code"
              :type="currentLocale === lang.code ? 'primary' : 'default'"
              size="medium"
              class="language-option-btn"
              @click="switchLanguage(lang.code)"
            >
              {{ lang.name }}
            </NButton>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-title">
            <span class="section-icon">🎨</span>
            <span>{{ t('settings.theme') }}</span>
          </div>
          <div class="theme-options">
            <NButton
              v-for="t in themes"
              :key="t.id"
              :type="theme.value === t.id ? 'primary' : 'default'"
              size="medium"
              class="theme-option-btn"
              @click="setTheme(t.id)"
            >
              <span>{{ t.icon }}</span>
              <span>{{ t.label }}</span>
            </NButton>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-title">
            <span class="section-icon">🔄</span>
            <span>{{ t('settings.update') }}</span>
          </div>
          <div class="update-content">
            <NButton
              type="primary"
              size="medium"
              :loading="checkingUpdate"
              class="update-btn"
              @click="checkUpdate"
            >
              {{ t('common.checkUpdate') }}
            </NButton>
            <div v-if="updateStatus" class="update-status">
              <NAlert
                v-if="updateStatus === 'no-update'"
                type="success"
                :title="t('settings.noUpdate')"
                :closable="false"
              />
              <NAlert
                v-else-if="updateStatus === 'update-available'"
                type="info"
                :title="updateMessage"
                :closable="false"
              />
              <NAlert
                v-else-if="updateStatus === 'error'"
                type="error"
                :title="t('settings.updateError')"
                :closable="false"
              />
            </div>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-title">
            <span class="section-icon">ℹ️</span>
            <span>{{ t('settings.about') }}</span>
          </div>
          <div class="about-content">
            <div class="about-item">
              <span class="about-label">{{ t('settings.version') }}:</span>
              <span class="about-value">{{ version }}</span>
            </div>
            <div class="about-item">
              <span class="about-label">Electron:</span>
              <span class="about-value">{{ versions.electron }}</span>
            </div>
            <div class="about-item">
              <span class="about-label">Node.js:</span>
              <span class="about-value">{{ versions.node }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NConfigProvider>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NConfigProvider,
  NButton,
  NAlert
} from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { useTheme, initTheme, setupSystemThemeListener, setupThemeChangeListener } from '../../composables/useTheme'

const { t, locale } = useI18n()

initTheme()
setupSystemThemeListener()
setupThemeChangeListener()

const { theme, themes } = useTheme()

const currentLocale = ref(locale.value)

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
]

const switchLanguage = (code) => {
  window.electronAPI.setLanguage(code)
}

const setTheme = (newTheme) => {
  window.electronAPI.setTheme(newTheme)
}

const naiveTheme = computed(() => {
  if (theme.value === 'dark') {
    return darkTheme
  }
  if (theme.value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : null
  }
  return null
})

const checkingUpdate = ref(false)
const updateStatus = ref(null)
const updateMessage = ref('')

const version = ref('')
const versions = ref({
  electron: '',
  node: ''
})

const checkUpdate = async () => {
  checkingUpdate.value = true
  updateStatus.value = null
  try {
    const result = await window.electronAPI.checkForUpdates()
    if (result.status === 'no-update') {
      updateStatus.value = 'no-update'
    } else if (result.status === 'update-available') {
      updateStatus.value = 'update-available'
      updateMessage.value = result.message
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    updateStatus.value = 'error'
  } finally {
    checkingUpdate.value = false
  }
}

const closeWindow = () => {
  window.electronAPI.closeSettingsWindow()
}

onMounted(async () => {
  const appVersions = window.electronAPI.getVersions()
  versions.value = {
    electron: appVersions.electron,
    node: appVersions.node
  }
  
  try {
    version.value = await window.electronAPI.getAppVersion()
  } catch {
    version.value = '1.0.0'
  }
  
  if (window.electronAPI && window.electronAPI.onLanguageChanged) {
    window.electronAPI.onLanguageChanged((language) => {
      locale.value = language
      currentLocale.value = language
    })
  }
})
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
  justify-content: space-between;
  padding: 16px 20px;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  font-size: 20px;
  color: var(--color-text-secondary);
  padding: 0;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.section-icon {
  font-size: 16px;
}

.language-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.language-option-btn {
  padding: 8px 16px;
  border-radius: 6px;
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

.update-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-btn {
  align-self: flex-start;
}

.update-status {
  width: 100%;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.about-label {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.about-value {
  color: var(--color-text-primary);
  font-size: 13px;
  font-family: monospace;
}
</style>