import { ref, provide, watch } from 'vue'

// 主题状态
const theme = ref('light')
const themes = [
  { id: 'light', name: 'light', label: '亮色', icon: '☀️' },
  { id: 'dark', name: 'dark', label: '暗色', icon: '🌙' },
  { id: 'system', name: 'system', label: '跟随系统', icon: '⚙️' }
]

// 获取当前主题
export function useTheme() {
  return {
    theme,
    themes,
    setTheme: (newTheme) => {
      theme.value = newTheme
      applyTheme(newTheme)
    },
    toggleTheme: () => {
      const currentIndex = themes.findIndex(t => t.id === theme.value)
      const nextIndex = (currentIndex + 1) % themes.length
      const newTheme = themes[nextIndex]
      theme.value = newTheme.id
      applyTheme(newTheme.id)
    }
  }
}

// 应用主题
function applyTheme(themeId) {
  const root = document.documentElement
  
  // 移除所有主题类
  themes.forEach(t => {
    root.classList.remove(`theme-${t.id}`)
  })
  
  // 添加当前主题类
  root.classList.add(`theme-${themeId}`)
  
  // 如果是系统主题，检测系统偏好
  if (themeId === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(`theme-${systemTheme}`)
  }
  
  // 保存到 localStorage
  localStorage.setItem('theme', themeId)
}

// 初始化主题
export function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'system'
  theme.value = savedTheme
  applyTheme(savedTheme)
}

// 监听系统主题变化
export function setupSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', (e) => {
    if (theme.value === 'system') {
      const systemTheme = e.matches ? 'dark' : 'light'
      document.documentElement.classList.remove('theme-light', 'theme-dark')
      document.documentElement.classList.add(`theme-${systemTheme}`)
    }
  })
}