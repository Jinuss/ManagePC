import si from 'systeminformation'
import { IPC_CHANNELS } from '../constants'

/** 系统监控类
 * 定期采集 CPU、内存、网络等系统数据并发送到渲染进程
 */
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

    /** 采集系统数据
   * 使用 systeminformation 库获取 CPU、内存、网络信息
   * @returns {Object} - 采集的系统数据
   */
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

    /** 格式化每秒字节数为可读字符串
   * @param {number} bytes - 每秒字节数
   * @returns {string} - 格式化后的字符串（如 "1.5 MB/s"）
   */
  formatBytesPerSecond(bytes) {
    if (bytes === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

    /** 开始监控
   * @param {BrowserWindow} window - 目标窗口
   * @param {number} collectMs - 采集间隔（毫秒），默认 1000
   * @param {number} sendMs - 发送间隔（毫秒），默认 2000
   */
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

    /** 停止监控
   * 清除定时器
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}

export default SystemMonitor