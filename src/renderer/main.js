import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import './styles/global.css'
import { initTheme } from './composables/useTheme'

import * as Sentry from '@sentry/electron/renderer'

async function initSentry() {
  try {
    const dsn = window.electronAPI?.getSentryDsn?.()
    if (dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
      })
    }
  } catch {
  }
}

initSentry()

const app = createApp(App)

app.use(i18n)

async function initApp() {
  try {
    const result = await window.electronAPI.getSavedLanguage()
    if (result.language) {
      i18n.global.locale.value = result.language
    }
  } catch {
  }

  // 初始化主题
  await initTheme()

  app.mount('#app')
}

initApp()