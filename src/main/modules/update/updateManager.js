import { autoUpdater } from 'electron-updater'
import { dialog, shell } from 'electron'
import { app } from 'electron'
import semver from 'semver'
import { GITHUB_REPO } from '../../constants.js'
import { isWindows, isMac } from '../../utils/helps.js'
import { log } from '../log/logManager.js'

class UpdateManager {
  constructor() {
    this.currentVersion = app.getVersion()
    this.autoUpdater = autoUpdater

    if (isWindows()) {
      this.initWindowsUpdater()
    }
  }

  initWindowsUpdater() {
    this.autoUpdater.autoDownload = false

    this.autoUpdater.on('update-downloaded', async () => {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        title: '更新下载完成',
        message: '更新已下载完成，是否立即重启应用？',
        buttons: ['立即重启', '稍后重启']
      })

      if (response === 0) {
        this.autoUpdater.quitAndInstall()
      }
    })

    this.autoUpdater.on('error', (error) => {
      console.error('更新错误:', error)
    })

    this.autoUpdater.on('download-progress', (progress) => {
      console.log(`下载进度: ${progress.percent.toFixed(1)}%`)
    })
  }

  async checkForUpdates() {
    log.info('[UpdateManager] checkForUpdates called')
    if (isWindows()) {
      log.info('[UpdateManager] Platform: Windows, using electron-updater')
      return this.checkWindowsUpdates()
    }

    if (isMac()) {
      log.info('[UpdateManager] Platform: macOS, using GitHub API')
      return this.checkMacOSUpdates()
    }

    log.warn('[UpdateManager] Unsupported platform')
    return { status: 'unsupported', message: '当前平台不支持自动更新' }
  }

  async checkForUpdatesAndNotify() {
    log.info('[UpdateManager] checkForUpdatesAndNotify called')
    if (isWindows()) {
      log.info('[UpdateManager] Platform: Windows')
      return this.checkWindowsUpdates(true)
    }

    if (isMac()) {
      log.info('[UpdateManager] Platform: macOS')
      const result = await this.checkMacOSUpdates()
      if (result.status === 'update-available') {
        await this.showMacOSUpdateDialog(result)
      }
      return result
    }

    log.warn('[UpdateManager] Unsupported platform')
    return { status: 'unsupported', message: '当前平台不支持自动更新' }
  }

  checkWindowsUpdates(showDialog = false) {
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
        if (showDialog) {
          this.showWindowsUpdateDialog(info)
        }
        resolve({
          status: 'update-available',
          version: info.version,
          message: `发现新版本 ${info.version}`
        })
      }

      const onError = (error) => {
        cleanup()
        console.error('更新错误:', error)
        resolve({ status: 'error', message: '检查更新失败，请稍后重试' })
      }

      this.autoUpdater.once('update-not-available', onNotAvailable)
      this.autoUpdater.once('update-available', onAvailable)
      this.autoUpdater.once('error', onError)

      this.autoUpdater.checkForUpdates()
    })
  }

  async showWindowsUpdateDialog(info) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `新版本 ${info.version} 已发布！`,
      detail: `更新内容：\n${info.releaseNotes || '暂无更新说明'}`,
      buttons: ['立即更新', '稍后提醒']
    })

    if (response === 0) {
      this.autoUpdater.downloadUpdate()
    }
  }

  async checkMacOSUpdates() {
    log.info('[UpdateManager] Checking macOS updates via GitHub API')
    log.info('[UpdateManager] Current version:', this.currentVersion)
    log.info('[UpdateManager] GitHub API:', GITHUB_REPO.RELEASE_API)
    
    try {
      const response = await fetch(GITHUB_REPO.RELEASE_API)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const release = await response.json()
      const latestVersion = release.tag_name.replace(/^v/, '')
      log.info('[UpdateManager] Latest version:', latestVersion)

      if (semver.gt(latestVersion, this.currentVersion)) {
        const dmgAsset = release.assets.find(
          asset => asset.name.endsWith('.dmg')
        )
        log.info('[UpdateManager] Update available, dmg asset:', dmgAsset?.name)

        return {
          status: 'update-available',
          version: latestVersion,
          message: `发现新版本 ${latestVersion}`,
          downloadUrl: dmgAsset?.browser_download_url || release.html_url,
          releaseNotes: release.body || ''
        }
      }

      log.info('[UpdateManager] No update available')
      return {
        status: 'no-update',
        message: '当前已是最新版本'
      }
    } catch (error) {
      log.error('[UpdateManager] Check update failed:', error)
      return {
        status: 'error',
        message: '检查更新失败，请稍后重试'
      }
    }
  }

  async showMacOSUpdateDialog(updateInfo) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `新版本 ${updateInfo.version} 已发布！`,
      detail: `${updateInfo.releaseNotes || '暂无更新说明'}\n\n请手动下载并安装更新。`,
      buttons: ['前往下载', '稍后提醒']
    })

    if (response === 0 && updateInfo.downloadUrl) {
      await shell.openExternal(updateInfo.downloadUrl)
    }
  }
}

export default UpdateManager