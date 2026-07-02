import { autoUpdater } from 'electron-updater'
import BaseUpdater from './BaseUpdater.js'
import { IPC_CHANNELS } from '../../constants.js'
import { log } from '../log/logManager.js'

/** Windows 平台更新管理器
 * 使用 electron-updater 实现自动更新
 */
export default class WindowsUpdater extends BaseUpdater {
  constructor() {
    super()
    this.autoUpdater = autoUpdater
    this.mainWindow = null
    this.initUpdater()
  }

    /** 设置主窗口引用
   * @param {BrowserWindow} mainWindow - 主窗口实例
   */
  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow
  }

    /** 初始化更新器
   * 配置自动下载选项，注册更新相关事件监听
   */
  initUpdater() {
    this.autoUpdater.autoDownload = false

    this.autoUpdater.on('update-downloaded', () => {
      log.info('[WindowsUpdater] Update downloaded')
      this.sendEvent(IPC_CHANNELS.UPDATE_DOWNLOADED)
    })

    this.autoUpdater.on('error', (error) => {
      log.error('[WindowsUpdater] Update error:', error)
      this.sendEvent(IPC_CHANNELS.UPDATE_ERROR, { message: error.message })
    })

    this.autoUpdater.on('download-progress', (progress) => {
      log.info(`[WindowsUpdater] Download progress: ${progress.percent.toFixed(1)}%`)
      this.sendEvent(IPC_CHANNELS.UPDATE_DOWNLOAD_PROGRESS, {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred
      })
    })
  }

    /** 发送事件到渲染进程
   * @param {string} channel - IPC 通道名称
   * @param {Object} data - 事件数据
   */
  sendEvent(channel, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }

    /** 检查更新
   * 通过 electron-updater 检查 GitHub Releases
   * @returns {Promise<Object>} - 更新检查结果
   */
  async checkForUpdates() {
    log.info('[WindowsUpdater] checkForUpdates called')
    log.info('[WindowsUpdater] Current version:', this.currentVersion)
    log.info('[WindowsUpdater] Feed URL:', autoUpdater.getFeedURL())
    
    return new Promise((resolve) => {
      const cleanup = () => {
        this.autoUpdater.removeListener('update-not-available', onNotAvailable)
        this.autoUpdater.removeListener('update-available', onAvailable)
        this.autoUpdater.removeListener('error', onError)
      }

      const onNotAvailable = () => {
        cleanup()
        resolve({ status: 'no-update', message: '当前已是最新版本' })
      }

      const onAvailable = (info) => {
        cleanup()
        const updateInfo = {
          status: 'update-available',
          version: info.version,
          message: `发现新版本 ${info.version}`,
          releaseNotes: info.releaseNotes || ''
        }
        this.sendEvent(IPC_CHANNELS.UPDATE_AVAILABLE, updateInfo)
        resolve(updateInfo)
      }

      const onError = (error) => {
        cleanup()
        log.error('[WindowsUpdater] Check update failed:', error)
        const errorInfo = {
          status: 'error',
          message: '检查更新失败，请稍后重试'
        }
        this.sendEvent(IPC_CHANNELS.UPDATE_ERROR, errorInfo)
        resolve(errorInfo)
      }

      this.autoUpdater.once('update-not-available', onNotAvailable)
      this.autoUpdater.once('update-available', onAvailable)
      this.autoUpdater.once('error', onError)

      this.autoUpdater.checkForUpdates()
    })
  }

    /** 下载更新包
   */
  downloadUpdate() {
    this.autoUpdater.downloadUpdate()
  }

    /** 退出应用并安装更新
   */
  quitAndInstall() {
    this.autoUpdater.quitAndInstall()
  }
}