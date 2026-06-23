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