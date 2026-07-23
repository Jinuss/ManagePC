jest.mock("electron", () => ({
  app: {
    isPackaged: false
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    info: jest.fn()
  }
}))

jest.mock("./ipcSysInfoHandlers", () => ({ registerIpcSysInfoHandlers: jest.fn() }))
jest.mock("./ipcUpdateHandlers", () => ({ registerIpcUpdateHandlers: jest.fn() }))
jest.mock("./ipcLogHandlers", () => ({ registerIpcLogHandlers: jest.fn() }))
jest.mock("./ipcStoreHandlers", () => ({ registerIpcStoreHandlers: jest.fn() }))
jest.mock("./ipcWindowHandlers", () => ({ registerIpcWindowHandlers: jest.fn() }))
jest.mock("./ipcShortcutHandlers", () => ({ registerIpcShortcutHandlers: jest.fn() }))
jest.mock("./ipcProtocolHandlers", () => ({ registerIpcProtocolHandlers: jest.fn() }))
jest.mock("./ipcTaskHandlers", () => ({ registerTaskHandlers: jest.fn() }))
jest.mock("./ipcScreenHandlers", () => ({ registerIpcScreenHandlers: jest.fn() }))
jest.mock("./ipcAudioHandlers", () => ({ registerIpcAudioHandlers: jest.fn() }))

describe("ipc index", () => {
  let registerIpcHandlers

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    registerIpcHandlers = require("./index.js").registerIpcHandlers
  })

  test("should register all IPC handlers", () => {
    const mockUpdateManager = {}
    const mockWindowManager = {}

    registerIpcHandlers({ updateManager: mockUpdateManager, windowManager: mockWindowManager })

    expect(require("./ipcStoreHandlers").registerIpcStoreHandlers).toHaveBeenCalledWith({ windowManager: mockWindowManager })
    expect(require("./ipcWindowHandlers").registerIpcWindowHandlers).toHaveBeenCalledWith({ windowManager: mockWindowManager })
    expect(require("./ipcShortcutHandlers").registerIpcShortcutHandlers).toHaveBeenCalledWith({ windowManager: mockWindowManager })
    expect(require("./ipcSysInfoHandlers").registerIpcSysInfoHandlers).toHaveBeenCalled()
    expect(require("./ipcLogHandlers").registerIpcLogHandlers).toHaveBeenCalled()
    expect(require("./ipcProtocolHandlers").registerIpcProtocolHandlers).toHaveBeenCalled()
    expect(require("./ipcTaskHandlers").registerTaskHandlers).toHaveBeenCalled()
    expect(require("./ipcScreenHandlers").registerIpcScreenHandlers).toHaveBeenCalledWith({ windowManager: mockWindowManager })
    expect(require("./ipcAudioHandlers").registerIpcAudioHandlers).toHaveBeenCalledWith({ windowManager: mockWindowManager })
    expect(require("./ipcUpdateHandlers").registerIpcUpdateHandlers).not.toHaveBeenCalled()
  })

  test("should register update handlers when app is packaged", () => {
    jest.doMock("electron", () => ({
      app: {
        isPackaged: true
      }
    }))

    jest.resetModules()
    const mockUpdateManager = {}
    const mockWindowManager = {}

    const registerIpcHandlers = require("./index.js").registerIpcHandlers
    registerIpcHandlers({ updateManager: mockUpdateManager, windowManager: mockWindowManager })

    expect(require("./ipcUpdateHandlers").registerIpcUpdateHandlers).toHaveBeenCalledWith({ updateManager: mockUpdateManager })
  })
})
