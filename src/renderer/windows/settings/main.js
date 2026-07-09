import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SettingsWindow from './SettingsWindow.vue'
import i18n from '../../i18n'
import '../../styles/global.css'
import { initTheme } from '../../composables/useTheme'
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

const pinia = createPinia()

const app = createApp(SettingsWindow)

app.use(pinia)

app.use(i18n)

// 初始化主题
await initTheme()

app.mount('#app')
