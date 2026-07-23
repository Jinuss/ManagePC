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
    SET_CUSTOM_PROTOCOL: "set-custom-protocol",
    GET_CUSTOM_PROTOCOL: "get-custom-protocol"
  },
  CUSTOM_PROTOCOL_NAME: "managepc",
  WINDOW_DEFAULTS: { MAIN_WIDTH: 800, MAIN_HEIGHT: 550 },
  THEME_DEFAULTS: { DEFAULT: "system" },
  LANGUAGE_DEFAULTS: { DEFAULT: "zh" }
}))

jest.mock("electron", () => ({
  app: {
    isPackaged: true,
    setAsDefaultProtocolClient: jest.fn(),
    removeAsDefaultProtocolClient: jest.fn()
  },
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

const { registerProtocol, unregisterProtocol, registerIpcProtocolHandlers } = require("./ipcProtocolHandlers.js")
const { ipcMain } = require("electron")

describe("ipcProtocolHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("registerProtocol should return true when successful", () => {
    const result = registerProtocol()
    expect(result).toBe(true)
    expect(require("electron").app.setAsDefaultProtocolClient).toHaveBeenCalledWith("managepc")
  })

  test("registerProtocol should return false when error occurs", () => {
    require("electron").app.setAsDefaultProtocolClient.mockImplementation(() => {
      throw new Error("Registration failed")
    })
    const result = registerProtocol()
    expect(result).toBe(false)
  })

  test("unregisterProtocol should return true when successful", () => {
    const result = unregisterProtocol()
    expect(result).toBe(true)
    expect(require("electron").app.removeAsDefaultProtocolClient).toHaveBeenCalledWith("managepc")
  })

  test("unregisterProtocol should return false when error occurs", () => {
    require("electron").app.removeAsDefaultProtocolClient.mockImplementation(() => {
      throw new Error("Unregistration failed")
    })
    const result = unregisterProtocol()
    expect(result).toBe(false)
  })

  test("should register all protocol IPC handlers", () => {
    registerIpcProtocolHandlers()
    expect(ipcMain.handle).toHaveBeenCalledWith("set-custom-protocol", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-custom-protocol", expect.any(Function))
  })

  test("should handle get-custom-protocol request", async () => {
    registerIpcProtocolHandlers()
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-custom-protocol")[1]
    const result = await handler()
    expect(result).toEqual({ customProtocol: false })
  })

  test("should handle set-custom-protocol with enabled=true", async () => {
    registerIpcProtocolHandlers()
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-custom-protocol")[1]
    const result = await handler(null, true)
    expect(result.customProtocol).toBe(true)
  })

  test("should handle set-custom-protocol with enabled=false", async () => {
    registerIpcProtocolHandlers()
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-custom-protocol")[1]
    const result = await handler(null, false)
    expect(result.customProtocol).toBe(false)
  })
})
