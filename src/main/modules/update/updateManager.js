import { isWindows, isMac } from '../../utils/helps.js'
import WindowsUpdater from './WindowsUpdater.js'
import MacUpdater from './MacUpdater.js'

/** 更新管理器工厂类
 * 根据平台创建对应的更新管理器实例
 */
class UpdateManager {
  constructor() {
    if (isWindows()) {
      this.updater = new WindowsUpdater()
    } else if (isMac()) {
      this.updater = new MacUpdater()
    }
  }

    /** 设置主窗口引用
   * @param {BrowserWindow} mainWindow - 主窗口实例
   */
  setMainWindow(mainWindow) {
    if (this.updater.setMainWindow) {
      this.updater.setMainWindow(mainWindow)
    }
  }

    /** 检查更新
   * 根据平台调用对应的检查方法
   */
  async checkForUpdates() {
    if (isWindows()) {
      this.updater.checkForUpdates()
    } else if (isMac()) {
      this.updater.checkForUpdatesAndNotify()
    }
  }

    /** 下载更新
   */
  downloadUpdate() {
    if (this.updater.downloadUpdate) {
      this.updater.downloadUpdate()
    }
  }

    /** 退出并安装更新
   */
  quitAndInstall(isSilent = false, isRestart = true) {
    if (this.updater.quitAndInstall) {
      this.updater.quitAndInstall(isSilent, isRestart)
    }
  }
}

export default UpdateManager