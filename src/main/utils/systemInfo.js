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
    const disks = await si.diskLayout()
    const diskInfo = []

    for (const disk of disks) {
      if (disk.type === 'SSD' || disk.type === 'HDD') {
        const partitions = await si.fsSize()
        const diskPartitions = partitions.filter(p => p.fs.startsWith(disk.name) ||
          (p.mount && disk.name.includes('/dev/')))

        let totalSize = 0
        let usedSize = 0

        for (const part of diskPartitions) {
          if (part.size) {
            totalSize += part.size
            usedSize += (part.size - (part.available || 0))
          }
        }

        if (totalSize === 0 && disk.size) {
          totalSize = disk.size
        }

        const percentage = totalSize > 0 ? ((usedSize / totalSize) * 100).toFixed(1) : 0

        diskInfo.push({
          drive: disk.name,
          name: disk.name,
          type: disk.type,
          total: formatSize(totalSize),
          free: formatSize(totalSize - usedSize),
          used: formatSize(usedSize),
          percentage: parseFloat(percentage),
          rawTotal: totalSize,
          rawFree: totalSize - usedSize,
          rawUsed: usedSize
        })
      }
    }

    if (diskInfo.length === 0) {
      const partitions = await si.fsSize()
      for (const part of partitions) {
        if (part.size && (part.fstype !== 'tmpfs' || part.size > 1024 * 1024 * 100)) {
          const used = part.size - (part.available || 0)
          const percentage = part.size > 0 ? ((used / part.size) * 100).toFixed(1) : 0

          diskInfo.push({
            drive: part.mount || part.fs,
            name: part.fs,
            type: 'Local',
            total: formatSize(part.size),
            free: formatSize(part.available || 0),
            used: formatSize(used),
            percentage: parseFloat(percentage),
            rawTotal: part.size,
            rawFree: part.available || 0,
            rawUsed: used
          })
        }
      }
    }

    return diskInfo.filter(d => d.rawTotal > 0)
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
      osRelease: osInfo.release,
      hostname: osInfo.hostname,
      uptime: osInfo.uptime,
      cpuModel: cpu.brand,
      cpuCores: cpu.cores,
      cpuSpeed: cpu.speed,
      totalMemory: formatSize(mem.total),
      freeMemory: formatSize(mem.available),
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return {
      platform: process.platform,
      arch: process.arch,
      osRelease: '',
      hostname: '',
      uptime: 0,
      cpuModel: '',
      cpuCores: 0,
      cpuSpeed: 0,
      totalMemory: '0 B',
      freeMemory: '0 B',
      osInfo
    }
  }
}

async function getNetworkInfo() {
  try {
    const interfaces = await si.networkInterfaces()

    return interfaces.map(iface => ({
      interface: iface.name,
      ipAddress: iface.ip4 || iface.ip6 || '',
      macAddress: iface.mac || '',
      netmask: iface.netmask4 || iface.netmask6 || '',
      family: iface.ip4 ? 'IPv4' : 'IPv6',
      type: iface.type
    })).filter(iface => iface.ipAddress && !iface.internal)
  } catch (error) {
    console.error('获取网络接口信息失败:', error)
    return []
  }
}

module.exports = {
  getNetworkInfo,
  getDiskUsage,
  getSystemInfo,
  getSSHKey
}