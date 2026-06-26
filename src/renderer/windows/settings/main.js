import { createApp } from 'vue'
import SettingsWindow from './SettingsWindow.vue'
import i18n from '../../i18n'
import '../../styles/global.css'

const app = createApp(SettingsWindow)

app.use(i18n)

app.mount('#app')