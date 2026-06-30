import { app } from 'electron'

export default class BaseUpdater {
  constructor() {
    this.currentVersion = app.getVersion()
  }

  async checkForUpdates() {
    throw new Error('checkForUpdates must be implemented by subclass')
  }

  async checkForUpdatesAndNotify() {
    const result = await this.checkForUpdates()
    if (result.status === 'update-available') {
      await this.showUpdateDialog(result)
    }
    return result
  }

  async showUpdateDialog(info) {
    throw new Error('showUpdateDialog must be implemented by subclass')
  }
}