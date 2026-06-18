<template>
  <div class="app-container">
    <header class="app-header">
      <div class="language-switcher">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          @click="switchLanguage(lang.code)"
          :class="['lang-btn', { active: currentLocale === lang.code }]"
        >
          {{ lang.name }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <div class="card">
        <h2>{{ t('system.title') }}</h2>
        <p>Node.js {{ t('system.version') }}: {{ nodeVersion }}</p>
        <p>Electron {{ t('system.version') }}: {{ electronVersion }}</p>
        <p>Chrome {{ t('system.version') }}: {{ chromeVersion }}</p>
      </div>

      <div class="card system-info-card">
        <SystemInfo />
      </div>

      <div class="card system-info-card">
        <DiskUsage />
      </div>

      <div class="card system-info-card">
        <PCMonitor />
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2026 Electron Vue 3 App</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SystemInfo from './components/SystemInfo.vue'
import DiskUsage from './components/DiskUsage.vue'
import PCMonitor from './components/PCMonitor.vue'

const { t, locale } = useI18n()

const nodeVersion = ref('')
const electronVersion = ref('')
const chromeVersion = ref('')

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' }
]

const currentLocale = computed(() => locale.value)

const switchLanguage = (code) => {
  locale.value = code
}

onMounted(() => {
  nodeVersion.value = process.versions.node
  electronVersion.value = process.versions.electron
  chromeVersion.value = process.versions.chrome
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  color: white;
}

.header-content h1 {
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.header-content p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.language-switcher {
  display: flex;
  gap: 10px;
}

.lang-btn {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.lang-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.app-main {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.card h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.card ul {
  list-style: none;
}

.card li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  color: #555;
}

.card li:last-child {
  border-bottom: none;
}

.card p {
  padding: 8px 0;
  color: #555;
}

.system-info-card {
  flex: 1;
  min-width: 100%;
  max-width: 100%;
}

.app-footer {
  text-align: center;
  padding: 20px;
  color: white;
  opacity: 0.8;
}
</style>
