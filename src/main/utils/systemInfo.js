const si = require('systeminformation')
const fs = require('fs')
const path = require('path')

function formatSize(bytes) {
  if (bytes === 0 || !bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function getDiskUsage() {
  try {
    const partitions = await si.fsSize()
    
    let localDrives = new Set()
    if (process.platform === 'win32') {
      const { execSync } = require('child_process')
      try {
        const output = execSync('wmic logicaldisk get caption,providername', { encoding: 'utf8' })
        const lines = output.trim().split('\n').slice(1)
        for (const line of lines) {
          const parts = line.trim().split(/\s{2,}/)
          const drive = parts[0]
          const provider = parts[1] || ''
          if (drive && !provider) {
            localDrives.add(drive.toUpperCase())
          }
        }
      } catch (e) {
        console.error('获取本地驱动器列表失败:', e)
      }
    }

    const diskList = []

    for (const part of partitions) {
      if (!part.size || part.size <= 0) continue
      
      if (part.fstype === 'tmpfs' && part.size < 1024 * 1024 * 100) continue

      const used = part.size - (part.available || 0)
      const percentage = part.size > 0 ? ((used / part.size) * 100).toFixed(1) : 0

      let driveName = part.mount || part.fs
      let isLocal = false

      if (process.platform === 'win32') {
        const driveMatch = (part.fs || '').match(/^([A-Za-z]):/) || (part.mount || '').match(/^([A-Za-z]):/)
        if (driveMatch) {
          driveName = driveMatch[1] + ':'
          if (localDrives.has(driveName.toUpperCase())) {
            isLocal = true
          }
        }
      } else {
        if (part.mount === '/') {
          driveName = '/'
          isLocal = true
        }
      }

      if (!isLocal) continue

      diskList.push({
        drive: driveName,
        name: part.fs,
        type: 'local',
        filesystem: part.fstype || 'unknown',
        total: formatSize(part.size),
        free: formatSize(part.available || 0),
        used: formatSize(used),
        percentage: parseFloat(percentage),
        rawTotal: part.size,
        rawFree: part.available || 0,
        rawUsed: used
      })
    }

    const sortedList = diskList.sort((a, b) => {
      return a.drive.localeCompare(b.drive)
    })

    return sortedList
  } catch (error) {
    console.error('获取磁盘信息失败:', error)
    return []
  }
}

function getSSHKey() {
  try {
    let sshDir = ''

    if (process.platform === 'win32') {
      sshDir = path.join(process.env.USERPROFILE, '.ssh')
    } else {
      sshDir = path.join(process.env.HOME, '.ssh')
    }

    const pubKeyPath = path.join(sshDir, 'id_rsa.pub')

    if (fs.existsSync(pubKeyPath)) {
      const keyContent = fs.readFileSync(pubKeyPath, 'utf8')
      const lines = keyContent.trim().split('\n')
      for (const line of lines) {
        if (line.startsWith('ssh-rsa') || line.startsWith('ssh-ed25519')) {
          return line
        }
      }
      return keyContent
    }

    const ed25519Path = path.join(sshDir, 'id_ed25519.pub')
    if (fs.existsSync(ed25519Path)) {
      const keyContent = fs.readFileSync(ed25519Path, 'utf8')
      const lines = keyContent.trim().split('\n')
      for (const line of lines) {
        if (line.startsWith('ssh-ed25519') || line.startsWith('ssh-rsa')) {
          return line
        }
      }
      return keyContent
    }

    return '未找到SSH密钥'
  } catch (error) {
    console.error('获取SSH密钥失败:', error)
    return '获取SSH密钥失败'
  }
}

async function getSystemInfo() {
  try {
    const [osInfo, cpu, mem] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.mem()
    ])


    return {
      platform: osInfo.platform,
      arch: osInfo.arch,
      osType: osInfo.platform === 'win32' ? 'Windows' : (osInfo.platform === 'darwin' ? 'macOS' : 'Linux'),
      osRelease: osInfo.release,
      hostname: osInfo.hostname,
      uptime: osInfo.uptime,
      cpuModel: cpu.brand,
      cpuCores: cpu.cores,
      cpuSpeed: cpu.speed,
      totalMemory: formatSize(mem.total),
      freeMemory: formatSize(mem.available),
      ...osInfo
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    
    return {
      platform: process.platform,
      arch: process.arch,
      osType: process.platform === 'win32' ? 'Windows' : (process.platform === 'darwin' ? 'macOS' : 'Linux'),
      osRelease: '',
      hostname: '',
      uptime: 0,
      cpuModel: '',
      cpuCores: 0,
      cpuSpeed: 0,
      totalMemory: '0 B',
      freeMemory: '0 B',
    }
  }
}

async function getNetworkInfo() {
  try {
    const interfaces = await si.networkInterfaces()

    return interfaces.filter(nic => nic.operstate === 'up' &&
      !nic.internal &&
      !nic.virtual &&
      nic.ip4).map(iface => ({
        ...iface,
        interface: iface.iface,
        ipAddress: iface.ip4 || iface.ip6 || '',
        macAddress: iface.mac || '',
        netmask: iface.ip4subnet || '',
        family: iface.ip4 ? 'IPv4' : 'IPv6',
        type: iface.type
      })).filter(iface => iface.ipAddress && !iface.internal)
  } catch (error) {
    console.error('获取网络接口信息失败:', error)
    return []
  }
}

async function getBatteryInfo() {
  try {
    const battery = await si.battery()
    return {
      ...battery,
      hasBattery: battery.hasBattery || false,
      percent: battery.percent || 0,
      isCharging: battery.isCharging || false,
      timeRemaining: battery.timeRemaining || null,
      designedCapacity: battery.designedCapacity || null,
      maxCapacity: battery.maxCapacity || null,
      currentCapacity: battery.currentCapacity || null
    }
  } catch (error) {
    console.error('获取电池信息失败:', error)
    return {
      hasBattery: false,
      percentage: 0,
      isCharging: false,
      timeRemaining: null,
      designCapacity: null,
      maxCapacity: null,
      currentCapacity: null
    }
  }
}

module.exports = {
  getNetworkInfo,
  getDiskUsage,
  getSystemInfo,
  getSSHKey,
  getBatteryInfo
}
