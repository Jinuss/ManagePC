import { ref } from 'vue'
import { THEME_IDS, THEME_LABELS, THEME_ICONS, STORAGE_KEYS } from '../constants'

const theme = ref(THEME_IDS.LIGHT)
const themes = [
  { id: THEME_IDS.LIGHT, name: THEME_IDS.LIGHT, label: THEME_LABELS.LIGHT, icon: THEME_ICONS.LIGHT },
  { id: THEME_IDS.DARK, name: THEME_IDS.DARK, label: THEME_LABELS.DARK, icon: THEME_ICONS.DARK },
  { id: THEME_IDS.SYSTEM, name: THEME_IDS.SYSTEM, label: THEME_LABELS.SYSTEM, icon: THEME_ICONS.SYSTEM }
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
  
  if (themeId === THEME_IDS.SYSTEM) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_IDS.DARK : THEME_IDS.LIGHT
    root.classList.add(`theme-${systemTheme}`)
  }
  
  localStorage.setItem(STORAGE_KEYS.THEME, themeId)
}

export async function initTheme() {
  let savedTheme = THEME_IDS.SYSTEM
  try {
    const result = await window.electronAPI.getSavedTheme()
    savedTheme = result.theme || THEME_IDS.SYSTEM
  } catch {
    savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEME_IDS.SYSTEM
  }
  theme.value = savedTheme
  applyTheme(savedTheme)
}

export function setupSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', (e) => {
    if (theme.value === THEME_IDS.SYSTEM) {
      const systemTheme = e.matches ? THEME_IDS.DARK : THEME_IDS.LIGHT
      document.documentElement.classList.remove(`theme-${THEME_IDS.LIGHT}`, `theme-${THEME_IDS.DARK}`)
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
