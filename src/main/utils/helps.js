import path from 'path'
import { app } from 'electron'

/** 获取应用图标路径
 * 根据平台和打包状态返回正确的图标路径
 * @returns {string} - 图标文件路径
 */
export function getIconPath() {
  if (app.isPackaged) {
    if (isWindows()) {
      return path.join(process.resourcesPath, 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.resourcesPath, 'icons', 'macos', 'icon.icns')
    }
  } else {
    if (isWindows()) {
      return path.join(process.cwd(), 'resources', 'assets', 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.cwd(), 'resources', 'assets', 'icons', 'macos', 'icon.icns')
    }
  }
}

/** 获取托盘图标路径
 * 根据平台和打包状态返回正确的托盘图标路径
 * @returns {string} - 托盘图标文件路径
 */
export function getTrayIconPath() {
  if (app.isPackaged) {
    if (isWindows()) {
      return path.join(process.resourcesPath, 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.resourcesPath, 'icons', 'macos', '16x16.png')
    }
  } else {
    if (isWindows()) {
      return path.join(process.cwd(), 'resources', 'assets', 'icons', 'windows', 'icon.ico')
    }
    if (isMac()) {
      return path.join(process.cwd(), 'resources', 'assets', 'icons', 'macos', '16x16.png')
    }
  }
}

/** 判断是否为 Windows 平台
 * @returns {boolean}
 */
export function isWindows() {
  return process.platform === 'win32'
}

/** 判断是否为 macOS 平台
 * @returns {boolean}
 */
export function isMac() {
  return process.platform === 'darwin'
}

/** 格式化字节数为可读字符串
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的字符串（如 "1.5 GB"）
 */
export function formatSize(bytes) {
  if (bytes === 0 || !bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}