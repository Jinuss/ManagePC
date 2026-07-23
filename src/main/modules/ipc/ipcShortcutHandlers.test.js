jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
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
    return {
      get: (key, defaultValue) => {
        return state[key] !== undefined ? state[key] : defaultValue
      },
      set: (key, value) => {
        state[key] = value
      }
    }
  })
})

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    SET_SHORTCUT: "set-shortcut",
    GET_SHORTCUT: "get-shortcut",
    REGISTER_SHORTCUT: "register-shortcut"
  },
  WINDOW_DEFAULTS: { MAIN_WIDTH: 800, MAIN_HEIGHT: 550 },
  THEME_DEFAULTS: { DEFAULT: "system" },
  LANGUAGE_DEFAULTS: { DEFAULT: "zh" }
}))

jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  },
  globalShortcut: {
    register: jest.fn().mockReturnValue(true),
    unregister: jest.fn()
  }
}))

const { registerIpcShortcutHandlers } = require("./ipcShortcutHandlers.js")
const { ipcMain, globalShortcut } = require("electron")

describe("ipcShortcutHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should register all shortcut IPC handlers", () => {
    const mockWindowManager = { getMainWindow: jest.fn() }
    registerIpcShortcutHandlers({ windowManager: mockWindowManager })

    expect(ipcMain.handle).toHaveBeenCalledWith("set-shortcut", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-shortcut", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("register-shortcut", expect.any(Function))
  })

  test("should handle get-shortcut request", async () => {
    registerIpcShortcutHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-shortcut")[1]
    const result = await handler(null, "show-window")
    expect(result).toEqual({ shortcut: null })
  })

  test("should handle set-shortcut with accelerator", async () => {
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue({ isMinimized: jest.fn().mockReturnValue(false), focus: jest.fn() }) }
    registerIpcShortcutHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-shortcut")[1]
    const result = await handler(null, { key: "show-window", accelerator: "Ctrl+Shift+A" })
    expect(result).toEqual({ success: true, registered: "Ctrl+Shift+A" })
    expect(globalShortcut.register).toHaveBeenCalledWith("Ctrl+Shift+A", expect.any(Function))
  })

  test("should handle set-shortcut without accelerator", async () => {
    registerIpcShortcutHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-shortcut")[1]
    const result = await handler(null, { key: "show-window", accelerator: null })
    expect(result).toEqual({ success: true, registered: null })
  })

  test("should handle register-shortcut with accelerator", async () => {
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue({ isMinimized: jest.fn().mockReturnValue(false), focus: jest.fn() }) }
    registerIpcShortcutHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "register-shortcut")[1]
    const result = await handler(null, { key: "show-window", accelerator: "Ctrl+Shift+B" })
    expect(result).toEqual({ success: true })
    expect(globalShortcut.register).toHaveBeenCalledWith("Ctrl+Shift+B", expect.any(Function))
  })

  test("should handle register-shortcut without accelerator", async () => {
    registerIpcShortcutHandlers({ windowManager: {} })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "register-shortcut")[1]
    const result = await handler(null, { key: "show-window", accelerator: null })
    expect(result).toEqual({ success: true })
  })

  test("should restore and focus window when shortcut is triggered", async () => {
    const mockWindow = { 
      isMinimized: jest.fn().mockReturnValue(true), 
      restore: jest.fn(), 
      focus: jest.fn(),
      isDestroyed: jest.fn().mockReturnValue(false)
    }
    const mockWindowManager = { getMainWindow: jest.fn().mockReturnValue(mockWindow) }
    registerIpcShortcutHandlers({ windowManager: mockWindowManager })
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-shortcut")[1]
    await handler(null, { key: "show-window", accelerator: "Ctrl+Shift+C" })
    
    const shortcutCallback = globalShortcut.register.mock.calls[0][1]
    shortcutCallback()
    
    expect(mockWindow.restore).toHaveBeenCalled()
    expect(mockWindow.focus).toHaveBeenCalled()
  })
})
