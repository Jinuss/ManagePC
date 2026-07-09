import { dialog, shell } from 'electron'
import semver from 'semver'
import BaseUpdater from './BaseUpdater.js'
import { GITHUB_REPO } from '../../constants.js'
import { log } from '../log/logManager.js'
import { addBreadcrumb } from '../../sentry.js'

/** macOS 平台更新管理器
 * 通过 GitHub API 检查更新，使用系统对话框通知用户
 */
export default class MacUpdater extends BaseUpdater {
  constructor() {
    super()
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

    /** 检查更新
   * 通过 GitHub Releases API 获取最新版本信息
   * @returns {Promise<Object>} - 更新检查结果
   */
  async checkForUpdates() {
    log.info('[MacUpdater] checkForUpdates called')
    log.info('[MacUpdater] Current version:', this.currentVersion)
    log.info('[MacUpdater] GitHub API:', GITHUB_REPO.RELEASE_API)
    addBreadcrumb({
      category: 'update',
      message: '开始检查更新',
      level: 'info',
    })

    try {
      const response = await fetch(GITHUB_REPO.RELEASE_API)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const release = await response.json()
      const latestVersion = release.tag_name.replace(/^v/, '')
      log.info('[MacUpdater] Latest version:', latestVersion)

      if (semver.gt(latestVersion, this.currentVersion)) {
        const dmgAsset = release.assets.find(
          asset => asset.name.endsWith('.dmg')
        )
        log.info('[MacUpdater] Update available, dmg asset:', dmgAsset?.name)

        return {
          status: 'update-available',
          version: latestVersion,
          message: `发现新版本 ${latestVersion}`,
          downloadUrl: dmgAsset?.browser_download_url || release.html_url,
          releaseNotes: release.body || ''
        }
      }

      log.info('[MacUpdater] No update available')
      return {
        status: 'no-update',
        message: '当前已是最新版本'
      }
    } catch (error) {
      log.error('[MacUpdater] Check update failed:', error)
      return {
        status: 'error',
        message: '检查更新失败，请稍后重试'
      }
    }
  }

    /** 显示更新对话框
   * 使用系统对话框通知用户发现新版本
   * @param {Object} updateInfo - 更新信息
   */
  async showUpdateDialog(updateInfo) {
    log.info('[MacUpdater] showUpdateDialog called with updateInfo:', updateInfo)
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `新版本 ${updateInfo.version} 已发布！`,
      detail: `${updateInfo.releaseNotes || '暂无更新说明'}\n\n请手动下载并安装更新。`,
      buttons: ['前往下载', '稍后提醒']
    })

    if (response === 0 && updateInfo.downloadUrl) {
      addBreadcrumb({
        category: 'update',
        message: '用户前往下载更新',
        level: 'info',
      })
      await shell.openExternal(updateInfo.downloadUrl)
    }
  }
}