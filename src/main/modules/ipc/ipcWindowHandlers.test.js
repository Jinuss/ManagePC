jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    OPEN_SETTINGS_WINDOW: "open-settings-window",
    CLOSE_SETTINGS_WINDOW: "close-settings-window",
    MINIMIZE_WINDOW: "minimize-window",
    MAXIMIZE_WINDOW: "maximize-window",
    CLOSE_WINDOW: "close-window",
    IS_WINDOW_MAXIMIZED: "is-window-maximized",
    SET_ALWAYS_ON_TOP: "set-always-on-top",
    GET_ALWAYS_ON_TOP: "get-always-on-top"
  }
}))

describe("ipcWindowHandlers", () => {
  let registerIpcWindowHandlers, ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcWindowHandlers = require("./ipcWindowHandlers.js").registerIpcWindowHandlers
  })

  test("should register all window IPC handlers", () => {
    const mockWindowManager = { 
      createSettingsWindow: jest.fn(),
      closeSettingsWindow: jest.fn(),
      getMainWindow: jest.fn(),
      setAlwaysOnTop: jest.fn(),
      getAlwaysOnTop: jest.fn()
    }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })

    expect(ipcMain.handle).toHaveBeenCalledWith("open-settings-window", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("close-settings-window", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("minimize-window", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("maximize-window", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("close-window", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("is-window-maximized", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-always-on-top", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-always-on-top", expect.any(Function))
  })

  test("should handle open-settings-window request", async () => {
    const mockWindowManager = { createSettingsWindow: jest.fn() }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "open-settings-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindowManager.createSettingsWindow).toHaveBeenCalled()
  })

  test("should handle close-settings-window request", async () => {
    const mockWindowManager = { closeSettingsWindow: jest.fn() }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "close-settings-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindowManager.closeSettingsWindow).toHaveBeenCalled()
  })

  test("should handle minimize-window request", async () => {
    const mockWindow = { minimize: jest.fn(), isDestroyed: jest.fn().mockReturnValue(false) }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "minimize-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindow.minimize).toHaveBeenCalled()
  })

  test("should handle maximize-window request when not maximized", async () => {
    const mockWindow = { isMaximized: jest.fn().mockReturnValue(false), maximize: jest.fn(), isDestroyed: jest.fn().mockReturnValue(false) }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "maximize-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindow.maximize).toHaveBeenCalled()
  })

  test("should handle maximize-window request when maximized", async () => {
    const mockWindow = { isMaximized: jest.fn().mockReturnValue(true), unmaximize: jest.fn(), isDestroyed: jest.fn().mockReturnValue(false) }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "maximize-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindow.unmaximize).toHaveBeenCalled()
  })

  test("should handle close-window request", async () => {
    const mockWindow = { close: jest.fn(), isDestroyed: jest.fn().mockReturnValue(false) }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "close-window")[1]
    const result = await handler()
    expect(result).toEqual({ success: true })
    expect(mockWindow.close).toHaveBeenCalled()
  })

  test("should handle is-window-maximized request", async () => {
    const mockWindow = { isMaximized: jest.fn().mockReturnValue(true), isDestroyed: jest.fn().mockReturnValue(false) }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "is-window-maximized")[1]
    const result = await handler()
    expect(result).toEqual({ maximized: true })
  })

  test("should handle set-always-on-top request", async () => {
    const mockWindowManager = { setAlwaysOnTop: jest.fn().mockReturnValue({ success: true }) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-always-on-top")[1]
    const result = await handler(null, true)
    expect(result).toEqual({ success: true })
    expect(mockWindowManager.setAlwaysOnTop).toHaveBeenCalledWith(true)
  })

  test("should handle get-always-on-top request", async () => {
    const mockWindowManager = { getAlwaysOnTop: jest.fn().mockReturnValue(true) }
    registerIpcWindowHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-always-on-top")[1]
    const result = await handler()
    expect(result).toEqual({ alwaysOnTop: true })
  })
})
