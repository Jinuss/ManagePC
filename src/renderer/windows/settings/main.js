import { createApp } from 'vue'
import SettingsWindow from './SettingsWindow.vue'
import i18n from '../../i18n'
import '../../styles/global.css'
import { initTheme } from '../../composables/useTheme'

const app = createApp(SettingsWindow)

app.use(i18n)

// 初始化主题
await initTheme()

app.mount('#app')
