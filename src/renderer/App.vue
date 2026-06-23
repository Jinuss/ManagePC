<template>
  <ElConfigProvider>
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>{{ t('header.title') }}</h1>
          <p>{{ t('header.subtitle') }}</p>
        </div>
        <div class="language-switcher">
          <el-button 
            v-for="lang in languages" 
            :key="lang.code"
            @click="switchLanguage(lang.code)"
            :type="currentLocale === lang.code ? 'primary' : 'default'"
            size="small"
          >
            {{ lang.name }}
          </el-button>
        </div>
      </header>

      <div class="app-body">
        <aside class="sidebar">
          <el-menu
            :default-active="activeTab"
            class="sidebar-menu"
            mode="vertical"
            @select="handleMenuSelect"
          >
            <el-sub-menu index="monitoring">
              <template #title>
                <span class="menu-icon">🔧</span>
                <span>{{ t('menu.monitoring') }}</span>
              </template>
              <el-menu-item index="system">
                <span class="menu-icon">📊</span>
                <span>{{ t('menu.system') }}</span>
              </el-menu-item>
              <el-menu-item index="network">
                <span class="menu-icon">📡</span>
                <span>{{ t('menu.network') }}</span>
              </el-menu-item>
              <el-menu-item index="disk">
                <span class="menu-icon">💾</span>
                <span>{{ t('menu.disk') }}</span>
              </el-menu-item>
              <el-menu-item index="battery">
                <span class="menu-icon">🔋</span>
                <span>{{ t('menu.battery') }}</span>
              </el-menu-item>
              <el-menu-item index="monitor">
                <span class="menu-icon">📈</span>
                <span>{{ t('menu.monitor') }}</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </aside>

        <main class="main-content">
          <div class="content-panel">
            <keep-alive include="PCMonitor">
              <component :is="currentComponent" />
            </keep-alive>
          </div>
        </main>
      </div>
    </div>
  </ElConfigProvider>
</template>

<script setup>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import ElConfigProvider from './components/ElConfigProvider.vue'

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

const activeTab = ref('system')

const systemInfo = ref({})

const handleMenuSelect = (index) => {
  activeTab.value = index
}

const componentMap = {
  system: defineAsyncComponent(() => import('./components/StaticInfo.vue')),
  network: defineAsyncComponent(() => import('./components/SystemInfo.vue')),
  disk: defineAsyncComponent(() => import('./components/DiskUsage.vue')),
  battery: defineAsyncComponent(() => import('./components/BatteryStatus.vue')),
  monitor: defineAsyncComponent(() => import('./components/PCMonitor.vue'))
}

const currentComponent = computed(() => {
  return componentMap[activeTab.value] || componentMap.system
})

const fetchSystemInfo = async () => {
  try {
    const data = await window.electronAPI.getSystemInfo()
    systemInfo.value = data
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}

onMounted(() => {
  const versions = window.electronAPI.getVersions()
  nodeVersion.value = versions.node
  electronVersion.value = versions.electron
  chromeVersion.value = versions.chrome
  fetchSystemInfo()
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
  padding: 15px 30px;
  color: white;
  background: rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 1.5rem;
  margin-bottom: 3px;
}

.header-content p {
  font-size: 0.85rem;
  opacity: 0.8;
}

.language-switcher {
  display: flex;
  gap: 8px;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sidebar {
  width: 200px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.content-panel {
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding-top: 10px;
  }
  
  .sidebar-menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .sidebar-menu .el-menu-item {
    width: calc(33.33% - 16px);
    text-align: center;
    padding: 0 10px;
  }
  
  .menu-icon {
    display: block;
    margin-right: 0;
    margin-bottom: 4px;
  }
  
  .sidebar-menu .el-menu-item span:last-child {
    font-size: 0.75rem;
  }
  
  .main-content {
    padding: 10px;
  }
}
</style>
