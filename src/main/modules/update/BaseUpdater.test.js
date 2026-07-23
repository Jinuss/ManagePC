jest.mock("electron", () => ({
  app: {
    getVersion: jest.fn().mockReturnValue("1.0.0")
  }
}))

describe("BaseUpdater", () => {
  let BaseUpdater

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    BaseUpdater = require("./BaseUpdater.js").default
  })

  test("should initialize with current version", () => {
    const updater = new BaseUpdater()
    expect(updater.currentVersion).toBe("1.0.0")
  })

  test("should check for updates and notify when available", async () => {
    const updater = new BaseUpdater()
    updater.checkForUpdates = jest.fn().mockResolvedValue({ status: "update-available", version: "1.1.0" })
    updater.showUpdateDialog = jest.fn().mockResolvedValue()

    const result = await updater.checkForUpdatesAndNotify()

    expect(updater.checkForUpdates).toHaveBeenCalled()
    expect(updater.showUpdateDialog).toHaveBeenCalledWith({ status: "update-available", version: "1.1.0" })
    expect(result).toEqual({ status: "update-available", version: "1.1.0" })
  })

  test("should not show dialog when no update available", async () => {
    const updater = new BaseUpdater()
    updater.checkForUpdates = jest.fn().mockResolvedValue({ status: "no-update" })
    updater.showUpdateDialog = jest.fn().mockResolvedValue()

    const result = await updater.checkForUpdatesAndNotify()

    expect(updater.checkForUpdates).toHaveBeenCalled()
    expect(updater.showUpdateDialog).not.toHaveBeenCalled()
    expect(result).toEqual({ status: "no-update" })
  })

  test("should throw error when showUpdateDialog not implemented", async () => {
    const updater = new BaseUpdater()
    await expect(updater.showUpdateDialog({})).rejects.toThrow("showUpdateDialog must be implemented by subclass")
  })
})
