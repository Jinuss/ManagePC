jest.mock("electron", () => ({
  app: {
    getVersion: jest.fn().mockReturnValue("1.0.0")
  },
  dialog: {
    showMessageBox: jest.fn().mockResolvedValue({ response: 0 })
  },
  shell: {
    openExternal: jest.fn().mockResolvedValue()
  }
}))

jest.mock("semver", () => ({
  gt: jest.fn().mockReturnValue(true)
}))

jest.mock("../../constants", () => ({
  GITHUB_REPO: {
    RELEASE_API: "https://api.github.com/repos/test/repo/releases/latest"
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

jest.mock("../../sentry", () => ({
  addBreadcrumb: jest.fn()
}))

describe("MacUpdater", () => {
  let MacUpdater

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    MacUpdater = require("./MacUpdater.js").default
  })

  test("should initialize with current version", () => {
    const updater = new MacUpdater()
    expect(updater.currentVersion).toBe("1.0.0")
  })

  test("should check for updates and find available update", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        tag_name: "v1.1.0",
        assets: [{ name: "app.dmg", browser_download_url: "https://download.com/app.dmg" }],
        body: "Update notes"
      })
    })

    const updater = new MacUpdater()
    const result = await updater.checkForUpdates()

    expect(result.status).toBe("update-available")
    expect(result.version).toBe("1.1.0")
    expect(result.downloadUrl).toBe("https://download.com/app.dmg")
  })

  test("should return no-update when version is same", async () => {
    const semver = require("semver")
    semver.gt.mockReturnValue(false)

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        tag_name: "v1.0.0",
        assets: [],
        body: ""
      })
    })

    const updater = new MacUpdater()
    const result = await updater.checkForUpdates()

    expect(result.status).toBe("no-update")
  })

  test("should return error when fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    const updater = new MacUpdater()
    const result = await updater.checkForUpdates()

    expect(result.status).toBe("error")
  })

  test("should show update dialog and open download url", async () => {
    const dialog = require("electron").dialog
    const shell = require("electron").shell

    const updater = new MacUpdater()
    await updater.showUpdateDialog({
      version: "1.1.0",
      downloadUrl: "https://download.com/app.dmg",
      releaseNotes: "Update notes"
    })

    expect(dialog.showMessageBox).toHaveBeenCalled()
    expect(shell.openExternal).toHaveBeenCalledWith("https://download.com/app.dmg")
  })

  test("should check for updates and notify when available", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        tag_name: "v1.1.0",
        assets: [{ name: "app.dmg", browser_download_url: "https://download.com/app.dmg" }],
        body: "Update notes"
      })
    })

    const updater = new MacUpdater()
    const result = await updater.checkForUpdatesAndNotify()

    expect(result.status).toBe("update-available")
  })
})
