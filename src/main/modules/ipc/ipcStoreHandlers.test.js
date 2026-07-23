jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: (key, defaultValue) => {
        const state = {
          window: { width: 800, height: 550, x: null, y: null },
          theme: "system",
          language: "zh",
          alwaysOnTop: false,
          autoStart: false,
          hasUpdate: false,
          autoUpdate: false,
          customProtocol: false,
          shortcuts: { showWindow: "CommandOrControl+Shift+A" }
        }
        return state[key] !== undefined ? state[key] : defaultValue
      },
      set: jest.fn()
    }
  })
})

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    GET_APP_VERSION: "get-app-version",
    GET_IS_PACKAGED: "get-is-packaged",
    SET_THEME: "set-theme",
    SET_AUTO_UPDATE: "set-auto-update",
    GET_AUTO_UPDATE: "get-auto-update",
    SET_LANGUAGE: "set-language",
    GET_SAVED_THEME: "get-saved-theme",
    GET_SAVED_LANGUAGE: "get-saved-language",
    SET_AUTO_START: "set-auto-start",
    GET_AUTO_START: "get-auto-start",
    GET_HAS_UPDATE: "get-has-update",
    THEME_CHANGED: "theme-changed",
    LANGUAGE_CHANGED: "language-changed"
  },
  WINDOW_DEFAULTS: { MAIN_WIDTH: 800, MAIN_HEIGHT: 550 },
  THEME_DEFAULTS: { DEFAULT: "system" },
  LANGUAGE_DEFAULTS: { DEFAULT: "zh" }
}))

jest.mock("electron", () => ({
  app: {
    getVersion: jest.fn().mockReturnValue("1.0.0"),
    isPackaged: false,
    setLoginItemSettings: jest.fn()
  },
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../utils/helps", () => ({
  broadcast: jest.fn()
}))

jest.mock("../log/logManager", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

const { registerIpcStoreHandlers } = require("./ipcStoreHandlers.js")
const { ipcMain } = require("electron")

describe("ipcStoreHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should register all store IPC handlers", () => {
    const mockWindowManager = { setTheme: jest.fn() }
    registerIpcStoreHandlers({ windowManager: mockWindowManager })

    expect(ipcMain.handle).toHaveBeenCalledWith("get-app-version", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-is-packaged", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-theme", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-auto-update", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-auto-update", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-language", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-saved-theme", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-saved-language", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-auto-start", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-auto-start", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-has-update", expect.any(Function))
  })

  test("should handle get-app-version request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-app-version")[1]
    const result = await handler()
    expect(result).toBe("1.0.0")
  })

  test("should handle get-is-packaged request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-is-packaged")[1]
    const result = await handler()
    expect(result).toBe(false)
  })

  test("should handle set-theme request", async () => {
    const mockWindowManager = { setTheme: jest.fn() }
    registerIpcStoreHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-theme")[1]
    const result = await handler(null, "dark")
    expect(result).toEqual({ success: true })
    expect(mockWindowManager.setTheme).toHaveBeenCalledWith("dark")
  })

  test("should handle get-auto-update request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-auto-update")[1]
    const result = await handler()
    expect(result.autoUpdate).toBeDefined()
  })

  test("should handle set-language request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-language")[1]
    const result = await handler(null, "en")
    expect(result).toEqual({ success: true })
  })

  test("should handle get-saved-theme request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-saved-theme")[1]
    const result = await handler()
    expect(result.theme).toBeDefined()
  })

  test("should handle get-saved-language request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-saved-language")[1]
    const result = await handler()
    expect(result.language).toBeDefined()
  })

  test("should handle set-auto-start request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-auto-start")[1]
    const result = await handler(null, true)
    expect(result).toEqual({ success: true })
    expect(require("electron").app.setLoginItemSettings).toHaveBeenCalledWith({ openAtLogin: true })
  })

  test("should handle get-auto-start request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-auto-start")[1]
    const result = await handler()
    expect(result.autoStart).toBeDefined()
  })

  test("should handle get-has-update request", async () => {
    registerIpcStoreHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-has-update")[1]
    const result = await handler()
    expect(result).toBeDefined()
  })
})
