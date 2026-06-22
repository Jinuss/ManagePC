import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import ElementPlus from 'element-plus'
import zhLocale from 'element-plus/es/locale/lang/zh-cn'
import enLocale from 'element-plus/es/locale/lang/en'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(i18n)
app.use(ElementPlus, {
  locale: i18n.global.locale.value === 'zh' ? zhLocale : enLocale
})

app.mount('#app')
