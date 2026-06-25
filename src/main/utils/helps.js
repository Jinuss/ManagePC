import iconPath_windows from '../../../resources/assets/icons/windows/icon.ico?asset'
import iconPath_mac from '../../../resources/assets/icons/macos/icon.icns?asset'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 读取 package.json 中的配置值
export function getPackageConfig(key, defaultValue = null) {
  try {
    // package.json 会被复制到 out 目录，所以使用相对路径
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const packageJsonPath = path.join(__dirname, '../../package.json')
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    // 支持点号分隔的路径，如 'build.appId'
    const keys = key.split('.')
    let value = packageJson
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue
      }
    }
    
    return value !== undefined ? value : defaultValue
  } catch (error) {
    console.error('读取 package.json 失败:', error)
    return defaultValue
  }
}

export function getIconPath() {
  if (isWindows()) {
    return iconPath_windows
  }
  if (isMac()) {
    return iconPath_mac
  }
}

// 判断是否是 Windows 平台
export function isWindows() {
  return process.platform === 'win32'
}

// 判断是否是 macOS 平台
export function isMac() {
  return process.platform === 'darwin'
}

// 格式化大小
export function formatSize(bytes) {
  if (bytes === 0 || !bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}