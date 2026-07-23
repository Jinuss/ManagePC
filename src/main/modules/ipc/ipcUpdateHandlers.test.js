jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  },
  app: {
    isPackaged: true
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    CHECK_FOR_UPDATES: "check-for-updates",
    DOWNLOAD_UPDATE: "download-update",
    INSTALL_UPDATE: "install-update",
    NOTIFY_UPDATE_DOWNLOADED: "notify-update-downloaded"
  }
}))

jest.mock("../../utils/helps", () => ({
  broadcast: jest.fn()
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}))

describe("ipcUpdateHandlers", () => {
  let registerIpcUpdateHandlers
  let ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcUpdateHandlers = require("./ipcUpdateHandlers.js").registerIpcUpdateHandlers
  })

  test("should register all update IPC handlers", () => {
    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    expect(ipcMain.handle).toHaveBeenCalledWith("check-for-updates", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("download-update", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("install-update", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("notify-update-downloaded", expect.any(Function))
  })

  test("should handle check-for-updates with autoDownload false", async () => {
    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "check-for-updates")[1]
    await handler(null, { autoDownload: false })

    expect(mockUpdateManager.checkForUpdates).toHaveBeenCalled()
    expect(mockUpdateManager.checkAndDownload).not.toHaveBeenCalled()
  })

  test("should handle check-for-updates with autoDownload true", async () => {
    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "check-for-updates")[1]
    await handler(null, { autoDownload: true })

    expect(mockUpdateManager.checkAndDownload).toHaveBeenCalled()
    expect(mockUpdateManager.checkForUpdates).not.toHaveBeenCalled()
  })

  test("should handle download-update request", async () => {
    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "download-update")[1]
    const result = await handler(null, {})

    expect(mockUpdateManager.downloadUpdate).toHaveBeenCalledWith({})
    expect(result).toEqual({ success: true })
  })

  test("should handle install-update request", async () => {
    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "install-update")[1]
    const result = await handler(null, true, false)

    expect(mockUpdateManager.quitAndInstall).toHaveBeenCalledWith(true, false)
    expect(result).toEqual({ success: true })
  })

  test("should handle notify-update-downloaded request", async () => {
    const broadcast = require("../../utils/helps").broadcast

    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "notify-update-downloaded")[1]
    await handler()

    expect(broadcast).toHaveBeenCalledWith("notify-update-downloaded", { hasUpdate: true })
  })

  test("should return undefined when not packaged", async () => {
    jest.resetModules()
    jest.mock("electron", () => ({
      ipcMain: {
        handle: jest.fn()
      },
      app: {
        isPackaged: false
      }
    }))

    ipcMain = require("electron").ipcMain
    registerIpcUpdateHandlers = require("./ipcUpdateHandlers.js").registerIpcUpdateHandlers

    const mockUpdateManager = {
      checkForUpdates: jest.fn(),
      checkAndDownload: jest.fn(),
      downloadUpdate: jest.fn(),
      quitAndInstall: jest.fn()
    }

    registerIpcUpdateHandlers({ updateManager: mockUpdateManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "check-for-updates")[1]
    const result = await handler(null, { autoDownload: false })

    expect(result).toBeUndefined()
    expect(mockUpdateManager.checkForUpdates).not.toHaveBeenCalled()
  })
})
