jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  },
  shell: {
    showItemInFolder: jest.fn()
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    GET_LOG_PATH: "get-log-path",
    GET_LOG_INFO: "get-log-info",
    READ_LOGS: "read-logs",
    CLEAR_LOGS: "clear-logs",
    START_LOG_WATCHER: "start-log-watcher",
    STOP_LOG_WATCHER: "stop-log-watcher",
    OPEN_LOG_PATH: "open-log-path"
  }
}))

jest.mock("../log/logManager", () => ({
  createLogHandler: jest.fn().mockReturnValue({
    getLogPath: jest.fn().mockReturnValue("/logs/app.log"),
    getLogInfo: jest.fn().mockReturnValue({ path: "/logs/app.log", size: 1024 }),
    readLogs: jest.fn().mockReturnValue({ success: true, data: ["log line 1"] }),
    clearLogs: jest.fn().mockReturnValue({ success: true }),
    startWatching: jest.fn(),
    stopWatching: jest.fn()
  }),
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe("ipcLogHandlers", () => {
  let registerIpcLogHandlers
  let ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcLogHandlers = require("./ipcLogHandlers.js").registerIpcLogHandlers
  })

  test("should register all log IPC handlers", () => {
    registerIpcLogHandlers()

    expect(ipcMain.handle).toHaveBeenCalledWith("get-log-path", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-log-info", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("read-logs", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("clear-logs", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("start-log-watcher", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("stop-log-watcher", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("open-log-path", expect.any(Function))
  })

  test("should handle get-log-path request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-log-path")[1]
    const result = await handler()

    expect(result).toBe("/logs/app.log")
  })

  test("should handle get-log-info request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-log-info")[1]
    const result = await handler()

    expect(result).toEqual({ path: "/logs/app.log", size: 1024 })
  })

  test("should handle read-logs request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "read-logs")[1]
    const result = await handler(null, 100)

    expect(result).toEqual({ success: true, data: ["log line 1"] })
  })

  test("should handle clear-logs request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "clear-logs")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })

  test("should handle start-log-watcher request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "start-log-watcher")[1]
    const mockEvent = {
      sender: {
        getOwnerBrowserWindow: jest.fn().mockReturnValue({})
      }
    }

    const result = await handler(mockEvent)

    expect(result).toEqual({ success: true })
  })

  test("should handle stop-log-watcher request", async () => {
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "stop-log-watcher")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })

  test("should handle open-log-path request", async () => {
    const shell = require("electron").shell
    registerIpcLogHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "open-log-path")[1]
    const result = await handler(null, "/logs/app.log")

    expect(shell.showItemInFolder).toHaveBeenCalledWith("/logs/app.log")
    expect(result).toEqual({ success: true })
  })
})
