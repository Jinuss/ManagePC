import { autoUpdater } from 'electron-updater'
import BaseUpdater from './BaseUpdater.js'
import { IPC_CHANNELS } from '../../constants.js'
import { log } from '../log/logManager.js'

export default class WindowsUpdater extends BaseUpdater {
  constructor() {
    super()
    this.autoUpdater = autoUpdater
    this.mainWindow = null
    this.initUpdater()
  }

  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow
  }

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

  sendEvent(channel, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }

  async checkForUpdates() {
    log.info('[WindowsUpdater] checkForUpdates called')
    log.info('[WindowsUpdater] Current version:', this.currentVersion)

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

  downloadUpdate() {
    this.autoUpdater.downloadUpdate()
  }

  quitAndInstall() {
    this.autoUpdater.quitAndInstall()
  }
}