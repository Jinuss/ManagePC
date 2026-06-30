import { isWindows, isMac } from '../../utils/helps.js'
import WindowsUpdater from './WindowsUpdater.js'
import MacUpdater from './MacUpdater.js'

class UpdateManager {
  constructor() {
    if (isWindows()) {
      this.updater = new WindowsUpdater()
    } else if (isMac()) {
      this.updater = new MacUpdater()
    }
  }

  setMainWindow(mainWindow) {
    if (this.updater.setMainWindow) {
      this.updater.setMainWindow(mainWindow)
    }
  }

  async checkForUpdates() {
    if (isWindows()) {
      this.updater.checkForUpdates()
    } else if (isMac()) {
      this.updater.checkForUpdatesAndNotify()
    }
  }

  downloadUpdate() {
    if (this.updater.downloadUpdate) {
      this.updater.downloadUpdate()
    }
  }

  quitAndInstall() {
    if (this.updater.quitAndInstall) {
      this.updater.quitAndInstall()
    }
  }
}

export default UpdateManager