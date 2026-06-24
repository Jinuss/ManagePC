import { autoUpdater } from 'electron-updater'
import { dialog } from 'electron'

class UpdateManager {
  constructor() {
    this.autoUpdater = autoUpdater
    this.init()
  }

  init() {
    // 设置更新源为 GitHub
    this.autoUpdater.autoDownload = false

    // 监听更新可用事件
    this.autoUpdater.on('update-available', async (info) => {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        title: '发现新版本',
        message: `新版本 ${info.version} 已发布！`,
        detail: `更新内容：\n${info.releaseNotes || '暂无更新说明'}`,
        buttons: ['立即更新', '稍后提醒']
      })

      if (response === 0) {
        // 开始下载更新
        this.autoUpdater.downloadUpdate()
      }
    })

    // 监听更新下载完成事件
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

    // 监听更新错误事件
    this.autoUpdater.on('error', (error) => {
      console.error('更新错误:', error)
    })

    // 监听更新进度
    this.autoUpdater.on('download-progress', (progress) => {
      console.log(`下载进度: ${progress.percent.toFixed(1)}%`)
    })
  }

  checkForUpdates() {
    this.autoUpdater.checkForUpdates()
  }

  checkForUpdatesAndNotify() {
    this.autoUpdater.checkForUpdatesAndNotify()
  }
}

export default UpdateManager