import Store from 'electron-store';
import {
  WINDOW_DEFAULTS,
  THEME_DEFAULTS,
  LANGUAGE_DEFAULTS,
} from '../constants';

/** 应用配置持久化管理类
 * 使用 electron-store 存储窗口大小、主题、语言等用户配置
 */

export const defaultState = {
  window: {
    width: WINDOW_DEFAULTS.MAIN_WIDTH,
    height: WINDOW_DEFAULTS.MAIN_HEIGHT,
    x: null,
    y: null,
  },
  theme: THEME_DEFAULTS.DEFAULT,
  language: LANGUAGE_DEFAULTS.DEFAULT,
  alwaysOnTop: false,
  autoStart: false,
  hasUpdate: false,
  autoUpdate: false,
  customProtocol: false,
  shortcuts: {
    showWindow: 'CommandOrControl+Shift+A',
  },
};

class StoreManager {
  constructor() {
    this._store = null;
  }

  /** 获取 store 实例（懒加载）
   * @returns {Store} - electron-store 实例
   */
  get store() {
    if (!this._store) {
      this._store = new Store({
        defaults: defaultState,
      });
    }
    return this._store;
  }

  /** 获取窗口边界尺寸
   * @returns {Object} - 窗口尺寸对象 { width, height, x, y }
   */
  getWindowBounds() {
    return this.store.get('window', {
      width: WINDOW_DEFAULTS.MAIN_WIDTH,
      height: WINDOW_DEFAULTS.MAIN_HEIGHT,
      x: null,
      y: null,
    });
  }

  /** 保存窗口边界尺寸
   * @param {Object} bounds - 窗口尺寸对象
   */
  saveWindowBounds(bounds) {
    this.store.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    });
  }

  /** 获取窗口置顶设置
   * @returns {boolean} - 是否置顶
   */
  getAlwaysOnTop() {
    return this.store.get('alwaysOnTop', false);
  }

  /** 设置窗口置顶
   * @param {boolean} onTop - 是否置顶
   */
  setAlwaysOnTop(onTop) {
    this.store.set('alwaysOnTop', onTop);
  }

  getStore() {
    return this.store;
  }
}

// 创建单例实例
const storeManager = new StoreManager();

export default storeManager;