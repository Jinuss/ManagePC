import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import './styles/global.css'

const app = createApp(App)

app.use(i18n)

async function initApp() {
  try {
    const result = await window.electronAPI.getSavedLanguage()
    if (result.language) {
      i18n.global.locale.value = result.language
    }
  } catch {
    const saved = localStorage.getItem('language')
    if (saved) {
      i18n.global.locale.value = saved
    }
  }
  
  app.mount('#app')
}

initApp()
