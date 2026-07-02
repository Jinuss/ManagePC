import { app } from 'electron'

/** 更新管理器基类
 * 定义更新管理的接口，子类需实现具体平台的更新逻辑
 */
export default class BaseUpdater {
  constructor() {
    this.currentVersion = app.getVersion()
  }

    /** 检查更新并显示通知
   * @returns {Promise<Object>} - 更新检查结果
   */
  async checkForUpdatesAndNotify() {
    const result = await this.checkForUpdates()
    if (result.status === 'update-available') {
      await this.showUpdateDialog(result)
    }
    return result
  }

    /** 显示更新对话框（抽象方法）
   * 子类必须实现此方法
   * @param {Object} info - 更新信息
   */
  async showUpdateDialog(info) {
    throw new Error('showUpdateDialog must be implemented by subclass')
  }
}