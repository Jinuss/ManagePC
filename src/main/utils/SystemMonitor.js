import si from 'systeminformation'
import { IPC_CHANNELS } from '../constants'

class SystemMonitor {
  constructor() {
    this.cache = {
      cpu: null,
      mem: null,
      network: null,
      timestamp: 0
    }
    this.subscribers = new Set()
    this.interval = null
  }

  async collect() {
    try {
      const [cpu, mem, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats()
      ])

      let totalRx = 0
      let totalTx = 0

      for (const iface of network) {
        if (iface.rx_sec !== undefined && iface.tx_sec !== undefined) {
          totalRx += iface.rx_sec
          totalTx += iface.tx_sec
        }
      }

      this.cache = {
        cpu: {
          usage: cpu.currentLoad.toFixed(1),
          cores: cpu.cpus.map(c => c.load.toFixed(1))
        },
        mem: {
          used: ((mem.used / mem.total) * 100).toFixed(1),
          total: (mem.total / 1024 / 1024 / 1024).toFixed(1),
          free: (mem.available / 1024 / 1024 / 1024).toFixed(1)
        },
        network: {
          recvKbps: parseFloat((totalRx * 8 / 1024).toFixed(1)),
          sentKbps: parseFloat((totalTx * 8 / 1024).toFixed(1)),
          interfaces: network.map(n => ({
            iface: n.iface,
            rx: this.formatBytesPerSecond(n.rx_sec),
            tx: this.formatBytesPerSecond(n.tx_sec)
          }))
        },
        timestamp: Date.now()
      }

      return this.cache
    } catch (error) {
      console.error('采集系统数据失败:', error)
      return this.cache
    }
  }

  formatBytesPerSecond(bytes) {
    if (bytes === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  start(window, collectMs = 1000, sendMs = 2000) {
    this.stop();
    let lastSend = 0;

    this.interval = setInterval(async () => {
      await this.collect();

      const now = Date.now();
      if (now - lastSend >= sendMs) {
        lastSend = now;
        if (window && !window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.SYSTEM_STATS, this.cache);
        }
      }
    }, collectMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}

export default SystemMonitor