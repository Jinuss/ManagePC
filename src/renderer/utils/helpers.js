export const formatUptime = (seconds) => {
  if (!seconds || typeof seconds !== 'number') return '-'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}天 ${hours}小时 ${minutes}分钟`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

export const getDiskColor = (percentage) => {
  if (percentage >= 90) return 'linear-gradient(90deg, #dc3545, #ff6b6b)'
  if (percentage >= 70) return 'linear-gradient(90deg, #ffc107, #ffec8b)'
  return 'linear-gradient(90deg, #28a745, #98fb98)'
}

export const updateHistory = (history, value, maxLength = 30) => {
  if (!Array.isArray(history)) return
  
  history.push(value)
  if (history.length > maxLength) {
    history.shift()
  }
}

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

export const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export const throttle = (fn, limit) => {
  let inThrottle = false
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
