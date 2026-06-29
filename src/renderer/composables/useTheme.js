import { ref } from 'vue'
import { THEME_IDS } from '../constants'

const theme = ref(THEME_IDS.SYSTEM)

export function useTheme() {
  return {
    theme
  }
}

function applyTheme(themeId) {
  const root = document.documentElement
  
  root.classList.remove('theme-light', 'theme-dark', 'theme-system')
  root.classList.add(`theme-${themeId}`)
  
  if (themeId === THEME_IDS.SYSTEM) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_IDS.DARK : THEME_IDS.LIGHT
    root.classList.add(`theme-${systemTheme}`)
  }
}

export async function initTheme() {
  let savedTheme = THEME_IDS.SYSTEM
  try {
    const result = await window.electronAPI.getSavedTheme()
    savedTheme = result.theme || THEME_IDS.SYSTEM
  } catch {
    savedTheme = THEME_IDS.SYSTEM
  }
  theme.value = savedTheme
  applyTheme(savedTheme);

  setupSystemThemeListener();
  setupThemeChangeListener();
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
