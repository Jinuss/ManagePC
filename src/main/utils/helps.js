import iconPath_windows from '../../../resources/assets/icons/windows/icon.ico?asset'
import iconPath_mac from '../../../resources/assets/icons/macos/icon.icns?asset'

export function getIconPath() {
  if (isWindows()) {
    return iconPath_windows
  }
  if (isMac()) {
    return iconPath_mac
  }
}

export function isWindows() {
  return process.platform === 'win32'
}

export function isMac() {
  return process.platform === 'darwin'
}

export function formatSize(bytes) {
  if (bytes === 0 || !bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}