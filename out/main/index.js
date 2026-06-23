"use strict";
const electron = require("electron");
const path = require("path");
const si = require("systeminformation");
const fs = require("fs");
const child_process = require("child_process");
class WindowManager {
  constructor() {
    this.mainWindow = null;
  }
  createMainWindow() {
    this.mainWindow = new electron.BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "../preload/index.js")
      }
    });
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      this.mainWindow.loadURL("http://localhost:5173");
    } else {
      this.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }
  getMainWindow() {
    return this.mainWindow;
  }
}
function isWindows() {
  return process.platform === "win32";
}
function formatSize(bytes) {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
async function getDiskUsage() {
  try {
    const partitions = await si.fsSize();
    let localDrives = /* @__PURE__ */ new Set();
    if (isWindows()) {
      try {
        const output = child_process.execSync("wmic logicaldisk get caption,providername", { encoding: "utf8" });
        const lines = output.trim().split("\n").slice(1);
        for (const line of lines) {
          const parts = line.trim().split(/\s{2,}/);
          const drive = parts[0];
          const provider = parts[1] || "";
          if (drive && !provider) {
            localDrives.add(drive.toUpperCase());
          }
        }
      } catch (e) {
        console.error("获取本地驱动器列表失败:", e);
      }
    }
    const diskList = [];
    for (const part of partitions) {
      if (!part.size || part.size <= 0) continue;
      if (part.fstype === "tmpfs" && part.size < 1024 * 1024 * 100) continue;
      const used = part.size - (part.available || 0);
      const percentage = part.size > 0 ? (used / part.size * 100).toFixed(1) : 0;
      let driveName = part.mount || part.fs;
      let isLocal = false;
      if (isWindows()) {
        const driveMatch = (part.fs || "").match(/^([A-Za-z]):/) || (part.mount || "").match(/^([A-Za-z]):/);
        if (driveMatch) {
          driveName = driveMatch[1] + ":";
          if (localDrives.has(driveName.toUpperCase())) {
            isLocal = true;
          }
        }
      } else {
        if (part.mount === "/") {
          driveName = "/";
          isLocal = true;
        }
      }
      if (!isLocal) continue;
      diskList.push({
        drive: driveName,
        name: part.fs,
        type: "local",
        filesystem: part.fstype || "unknown",
        total: formatSize(part.size),
        free: formatSize(part.available || 0),
        used: formatSize(used),
        percentage: parseFloat(percentage),
        rawTotal: part.size,
        rawFree: part.available || 0,
        rawUsed: used
      });
    }
    const sortedList = diskList.sort((a, b) => {
      return a.drive.localeCompare(b.drive);
    });
    return sortedList;
  } catch (error) {
    console.error("获取磁盘信息失败:", error);
    return [];
  }
}
function getSSHKey() {
  try {
    let sshDir = "";
    if (isWindows()) {
      sshDir = path.join(process.env.USERPROFILE, ".ssh");
    } else {
      sshDir = path.join(process.env.HOME, ".ssh");
    }
    const pubKeyPath = path.join(sshDir, "id_rsa.pub");
    if (fs.existsSync(pubKeyPath)) {
      const keyContent = fs.readFileSync(pubKeyPath, "utf8");
      const lines = keyContent.trim().split("\n");
      for (const line of lines) {
        if (line.startsWith("ssh-rsa") || line.startsWith("ssh-ed25519")) {
          return line;
        }
      }
      return keyContent;
    }
    const ed25519Path = path.join(sshDir, "id_ed25519.pub");
    if (fs.existsSync(ed25519Path)) {
      const keyContent = fs.readFileSync(ed25519Path, "utf8");
      const lines = keyContent.trim().split("\n");
      for (const line of lines) {
        if (line.startsWith("ssh-ed25519") || line.startsWith("ssh-rsa")) {
          return line;
        }
      }
      return keyContent;
    }
    return "未找到SSH密钥";
  } catch (error) {
    console.error("获取SSH密钥失败:", error);
    return "获取SSH密钥失败";
  }
}
async function getSystemInfo() {
  try {
    const [osInfo, cpu, mem] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.mem()
    ]);
    return {
      platform: osInfo.platform,
      arch: osInfo.arch,
      osType: osInfo.platform === "win32" ? "Windows" : osInfo.platform === "darwin" ? "macOS" : "Linux",
      osRelease: osInfo.release,
      hostname: osInfo.hostname,
      uptime: osInfo.uptime,
      cpuModel: cpu.brand,
      cpuCores: cpu.cores,
      cpuSpeed: cpu.speed,
      totalMemory: formatSize(mem.total),
      freeMemory: formatSize(mem.available),
      ...osInfo
    };
  } catch (error) {
    console.error("获取系统信息失败:", error);
    return {
      platform: process.platform,
      arch: process.arch,
      osType: process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux",
      osRelease: "",
      hostname: "",
      uptime: 0,
      cpuModel: "",
      cpuCores: 0,
      cpuSpeed: 0,
      totalMemory: "0 B",
      freeMemory: "0 B"
    };
  }
}
async function getNetworkInfo() {
  try {
    const interfaces = await si.networkInterfaces();
    return interfaces.filter((nic) => nic.operstate === "up" && !nic.internal && !nic.virtual && nic.ip4).map((iface) => ({
      ...iface,
      interface: iface.iface,
      ipAddress: iface.ip4 || iface.ip6 || "",
      macAddress: iface.mac || "",
      netmask: iface.ip4subnet || "",
      family: iface.ip4 ? "IPv4" : "IPv6",
      type: iface.type
    })).filter((iface) => iface.ipAddress && !iface.internal);
  } catch (error) {
    console.error("获取网络接口信息失败:", error);
    return [];
  }
}
async function getBatteryInfo() {
  try {
    const battery = await si.battery();
    return {
      ...battery,
      hasBattery: battery.hasBattery || false,
      percent: battery.percent || 0,
      isCharging: battery.isCharging || false,
      timeRemaining: battery.timeRemaining || null,
      designedCapacity: battery.designedCapacity || null,
      maxCapacity: battery.maxCapacity || null,
      currentCapacity: battery.currentCapacity || null
    };
  } catch (error) {
    console.error("获取电池信息失败:", error);
    return {
      hasBattery: false,
      percentage: 0,
      isCharging: false,
      timeRemaining: null,
      designCapacity: null,
      maxCapacity: null,
      currentCapacity: null
    };
  }
}
class SystemMonitor {
  constructor() {
    this.cache = {
      cpu: null,
      mem: null,
      network: null,
      timestamp: 0
    };
    this.subscribers = /* @__PURE__ */ new Set();
    this.interval = null;
  }
  async collect() {
    try {
      const [cpu, mem, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats()
      ]);
      let totalRx = 0;
      let totalTx = 0;
      for (const iface of network) {
        if (iface.rx_sec !== void 0 && iface.tx_sec !== void 0) {
          totalRx += iface.rx_sec;
          totalTx += iface.tx_sec;
        }
      }
      this.cache = {
        cpu: {
          usage: cpu.currentLoad.toFixed(1),
          cores: cpu.cpus.map((c) => c.load.toFixed(1))
        },
        mem: {
          used: (mem.used / mem.total * 100).toFixed(1),
          total: (mem.total / 1024 / 1024 / 1024).toFixed(1),
          free: (mem.available / 1024 / 1024 / 1024).toFixed(1)
        },
        network: {
          recvKbps: parseFloat((totalRx * 8 / 1024).toFixed(1)),
          sentKbps: parseFloat((totalTx * 8 / 1024).toFixed(1)),
          interfaces: network.map((n) => ({
            iface: n.iface,
            rx: this.formatBytesPerSecond(n.rx_sec),
            tx: this.formatBytesPerSecond(n.tx_sec)
          }))
        },
        timestamp: Date.now()
      };
      return this.cache;
    } catch (error) {
      console.error("采集系统数据失败:", error);
      return this.cache;
    }
  }
  formatBytesPerSecond(bytes) {
    if (bytes === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
  start(window, collectMs = 1e3, sendMs = 2e3) {
    this.stop();
    let lastSend = 0;
    this.interval = setInterval(async () => {
      await this.collect();
      const now = Date.now();
      if (now - lastSend >= sendMs) {
        lastSend = now;
        if (window && !window.isDestroyed()) {
          window.webContents.send("system-stats", this.cache);
        }
      }
    }, collectMs);
  }
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
let systemMonitor = null;
function registerIpcHandlers() {
  electron.ipcMain.handle("get-ssh-key", () => {
    return getSSHKey();
  });
  electron.ipcMain.handle("get-system-info", () => {
    return getSystemInfo();
  });
  electron.ipcMain.handle("get-network-info", () => {
    return getNetworkInfo();
  });
  electron.ipcMain.handle("get-disk-usage", () => {
    return getDiskUsage();
  });
  electron.ipcMain.handle("get-battery-info", () => {
    return getBatteryInfo();
  });
  electron.ipcMain.handle("start-monitoring", (event, intervalMs = 1e3) => {
    const window = event.sender.getOwnerBrowserWindow();
    if (systemMonitor) {
      systemMonitor.stop();
    }
    systemMonitor = new SystemMonitor();
    systemMonitor.start(window, intervalMs);
    return { success: true };
  });
  electron.ipcMain.handle("stop-monitoring", () => {
    if (systemMonitor) {
      systemMonitor.stop();
      systemMonitor = null;
    }
    return { success: true };
  });
}
const windowManager = new WindowManager();
function initApp() {
  registerIpcHandlers();
  windowManager.createMainWindow();
}
electron.app.whenReady().then(() => {
  initApp();
  electron.app.on("activate", () => {
    if (windowManager.getMainWindow() === null) {
      windowManager.createMainWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
