import Store from 'electron-store'
import { WINDOW_DEFAULTS, THEME_DEFAULTS, LANGUAGE_DEFAULTS } from './constants'

/** 应用配置持久化管理类
 * 使用 electron-store 存储窗口大小、主题、语言等用户配置
 */
class StoreManager {
  constructor() {
    this._store = null
  }

  /** 获取 store 实例（懒加载）
 * @returns {Store} - electron-store 实例
 */
  get store() {
    if (!this._store) {
      this._store = new Store({
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
    return this._store
  }

  /** 获取窗口边界尺寸
 * @returns {Object} - 窗口尺寸对象 { width, height, x, y }
 */
  getWindowBounds() {
    return this.store.get('window', {
      width: WINDOW_DEFAULTS.MAIN_WIDTH,
      height: WINDOW_DEFAULTS.MAIN_HEIGHT,
      x: null,
      y: null
    })
  }

  /** 保存窗口边界尺寸
 * @param {Object} bounds - 窗口尺寸对象
 */
  saveWindowBounds(bounds) {
    this.store.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    })
  }

  /** 获取主题设置
  * @returns {string} - 主题名称
  */
  getTheme() {
    return this.store.get('theme', THEME_DEFAULTS.DEFAULT)
  }

  /** 设置主题
 * @param {string} theme - 主题名称
 */
  setTheme(theme) {
    this.store.set('theme', theme)
  }

  /** 获取语言设置
 * @returns {string} - 语言代码
 */
  getLanguage() {
    return this.store.get('language', LANGUAGE_DEFAULTS.DEFAULT)
  }

  /** 设置语言
 * @param {string} language - 语言代码
 */
  setLanguage(language) {
    this.store.set('language', language)
  }

  /** 获取窗口置顶设置
 * @returns {boolean} - 是否置顶
 */
  getAlwaysOnTop() {
    return this.store.get('alwaysOnTop', false)
  }

  /** 设置窗口置顶
 * @param {boolean} onTop - 是否置顶
 */
  setAlwaysOnTop(onTop) {
    this.store.set('alwaysOnTop', onTop)
  }

  /** 获取开机自启设置
 * @returns {boolean} - 是否自启
 */
  getAutoStart() {
    return this.store.get('autoStart', false)
  }

  /** 设置开机自启
 * @param {boolean} autoStart - 是否自启
 */
  setAutoStart(autoStart) {
    this.store.set('autoStart', autoStart)
  }
}


// 创建单例实例
const storeManager = new StoreManager()

export default storeManager