jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../utils/systemInfo", () => ({
  getSystemInfo: jest.fn().mockReturnValue({ success: true, data: {} }),
  getNetworkInfo: jest.fn().mockReturnValue({ success: true, data: {} }),
  getDiskUsage: jest.fn().mockReturnValue({ success: true, data: {} }),
  getSSHKey: jest.fn().mockReturnValue({ success: true, data: {} }),
  getBatteryInfo: jest.fn().mockReturnValue({ success: true, data: {} })
}))

jest.mock("../../utils/SystemMonitor", () => ({
  default: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn()
  }))
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    GET_SSH_KEY: "get-ssh-key",
    GET_SYSTEM_INFO: "get-system-info",
    GET_NETWORK_INFO: "get-network-info",
    GET_DISK_USAGE: "get-disk-usage",
    GET_BATTERY_INFO: "get-battery-info",
    START_MONITORING: "start-monitoring",
    STOP_MONITORING: "stop-monitoring"
  }
}))

describe("ipcSysInfoHandlers", () => {
  let registerIpcSysInfoHandlers
  let ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcSysInfoHandlers = require("./ipcSysInfoHandlers.js").registerIpcSysInfoHandlers
  })

  test("should register all sys info IPC handlers", () => {
    registerIpcSysInfoHandlers()

    expect(ipcMain.handle).toHaveBeenCalledWith("get-ssh-key", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-system-info", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-network-info", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-disk-usage", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-battery-info", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("start-monitoring", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("stop-monitoring", expect.any(Function))
  })

  test("should handle get-ssh-key request", async () => {
    registerIpcSysInfoHandlers()

    const getSSHKeyHandler = ipcMain.handle.mock.calls.find(call => call[0] === "get-ssh-key")[1]
    const result = await getSSHKeyHandler()

    expect(result).toEqual({ success: true, data: {} })
  })

  test("should handle get-system-info request", async () => {
    registerIpcSysInfoHandlers()

    const getSystemInfoHandler = ipcMain.handle.mock.calls.find(call => call[0] === "get-system-info")[1]
    const result = await getSystemInfoHandler()

    expect(result).toEqual({ success: true, data: {} })
  })

  test("should handle stop-monitoring request", async () => {
    registerIpcSysInfoHandlers()

    const stopMonitoringHandler = ipcMain.handle.mock.calls.find(call => call[0] === "stop-monitoring")[1]
    const result = await stopMonitoringHandler()

    expect(result).toEqual({ success: true })
  })
})
