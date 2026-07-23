jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    GET_SCREEN_RESOLUTION: "get-screen-resolution",
    GET_ALL_SCREEN_RESOLUTIONS: "get-all-screen-resolutions",
    SET_SCREEN_RESOLUTION: "set-screen-resolution",
    START_RESOLUTION_LISTEN: "start-resolution-listen",
    STOP_RESOLUTION_LISTEN: "stop-resolution-listen",
    RESOLUTION_CHANGED: "resolution-changed"
  }
}))

jest.mock("../screen/screenManager", () => ({
  screenManager: {
    getScreenResolution: jest.fn().mockReturnValue({ success: true, data: { width: 1920, height: 1080 } }),
    getAllScreenResolutions: jest.fn().mockReturnValue({ success: true, data: [{ width: 1920, height: 1080 }] }),
    setScreenResolution: jest.fn().mockReturnValue({ success: true }),
    startResolutionListen: jest.fn().mockReturnValue({ success: true }),
    stopResolutionListen: jest.fn().mockReturnValue({ success: true }),
    on: jest.fn(),
    off: jest.fn()
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe("ipcScreenHandlers", () => {
  let registerIpcScreenHandlers
  let ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcScreenHandlers = require("./ipcScreenHandlers.js").registerIpcScreenHandlers
  })

  test("should register all screen IPC handlers", () => {
    registerIpcScreenHandlers()

    expect(ipcMain.handle).toHaveBeenCalledWith("get-screen-resolution", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-all-screen-resolutions", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-screen-resolution", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("start-resolution-listen", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("stop-resolution-listen", expect.any(Function))
  })

  test("should handle get-screen-resolution request", async () => {
    registerIpcScreenHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-screen-resolution")[1]
    const result = await handler()

    expect(result).toEqual({ success: true, data: { width: 1920, height: 1080 } })
  })

  test("should handle get-all-screen-resolutions request", async () => {
    registerIpcScreenHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-all-screen-resolutions")[1]
    const result = await handler()

    expect(result).toEqual({ success: true, data: [{ width: 1920, height: 1080 }] })
  })

  test("should handle set-screen-resolution request", async () => {
    registerIpcScreenHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-screen-resolution")[1]
    const result = await handler(null, 1920, 1080)

    expect(result).toEqual({ success: true })
  })

  test("should handle start-resolution-listen request", async () => {
    const mockWindowManager = {
      getMainWindow: jest.fn().mockReturnValue({ isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } })
    }
    registerIpcScreenHandlers({ windowManager: mockWindowManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "start-resolution-listen")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })

  test("should handle stop-resolution-listen request", async () => {
    registerIpcScreenHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "stop-resolution-listen")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })
})
