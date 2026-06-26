import path from 'path'
import { app } from 'electron'

export function getIconPath() {
  if (app.isPackaged) {
    if (isWindows()) {
      return path.join(process.resourcesPath, 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.resourcesPath, 'icons', 'macos', 'icon.icns')
    }
  }else{
    if (isWindows()) {
      return path.join(process.cwd(),'resources', 'assets', 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.cwd(),'resources', 'assets', 'icons', 'macos', '16x16.png')
    }
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