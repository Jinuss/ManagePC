import Store from 'electron-store'
import { WINDOW_DEFAULTS, THEME_DEFAULTS, LANGUAGE_DEFAULTS } from './constants'

class StoreManager {
  constructor() {
    this.store = new Store({
      defaults: {
        window: {
          width: WINDOW_DEFAULTS.MAIN_WIDTH,
          height: WINDOW_DEFAULTS.MAIN_HEIGHT,
          x: null,
          y: null
        },
        theme: THEME_DEFAULTS.DEFAULT,
        language: LANGUAGE_DEFAULTS.DEFAULT,
        alwaysOnTop: false,
        autoStart: false
      }
    })
  }

  getWindowBounds() {
    return this.store.get('window', {
      width: WINDOW_DEFAULTS.MAIN_WIDTH,
      height: WINDOW_DEFAULTS.MAIN_HEIGHT,
      x: null,
      y: null
    })
  }

  saveWindowBounds(bounds) {
    this.store.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    })
  }

  getTheme() {
    return this.store.get('theme', THEME_DEFAULTS.DEFAULT)
  }

  setTheme(theme) {
    this.store.set('theme', theme)
  }

  getLanguage() {
    return this.store.get('language', LANGUAGE_DEFAULTS.DEFAULT)
  }

  setLanguage(language) {
    this.store.set('language', language)
  }

  getAlwaysOnTop() {
    return this.store.get('alwaysOnTop', false)
  }

  setAlwaysOnTop(onTop) {
    this.store.set('alwaysOnTop', onTop)
  }

  getAutoStart() {
    return this.store.get('autoStart', false)
  }

  setAutoStart(autoStart) {
    this.store.set('autoStart', autoStart)
  }
}

const storeManager = new StoreManager()

export default storeManager
