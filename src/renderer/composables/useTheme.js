import { ref } from 'vue'

const theme = ref('light')
const themes = [
  { id: 'light', name: 'light', label: '亮色', icon: '☀️' },
  { id: 'dark', name: 'dark', label: '暗色', icon: '🌙' },
  { id: 'system', name: 'system', label: '跟随系统', icon: '⚙️' }
]

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

function applyTheme(themeId) {
  const root = document.documentElement
  
  themes.forEach(t => {
    root.classList.remove(`theme-${t.id}`)
  })
  
  root.classList.add(`theme-${themeId}`)
  
  if (themeId === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(`theme-${systemTheme}`)
  }
  
  localStorage.setItem('theme', themeId)
}

export function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'system'
  theme.value = savedTheme
  applyTheme(savedTheme)
}

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

export function setupThemeChangeListener() {
  if (window.electronAPI && window.electronAPI.onThemeChanged) {
    window.electronAPI.onThemeChanged((newTheme) => {
      theme.value = newTheme
      applyTheme(newTheme)
    })
  }
}