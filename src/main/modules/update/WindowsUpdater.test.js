jest.mock("electron", () => ({
  app: {
    getVersion: jest.fn().mockReturnValue("1.0.0"),
    isPackaged: true
  }
}));

jest.mock("electron-updater", () => ({
  autoUpdater: {
    autoDownload: false,
    logger: null,
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    checkForUpdates: jest.fn().mockResolvedValue(),
    downloadUpdate: jest.fn(),
    quitAndInstall: jest.fn()
  }
}));

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    UPDATE_ERROR: "update-error",
    UPDATE_INVALID: "update-invalid",
    UPDATE_AVAILABLE: "update-available",
    UPDATE_AUTO_DOWNLOADED: "update-auto-downloaded",
    UPDATE_DOWNLOADED: "update-downloaded",
    UPDATE_DOWNLOAD_PROGRESS: "update-download-progress"
  }
}));

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn(),
    transports: {
      file: {
        level: "info"
      }
    }
  }
}));

jest.mock("../../store/index", () => ({
  getStore: jest.fn().mockReturnValue({
    set: jest.fn()
  })
}));

jest.mock("../../sentry", () => ({
  addBreadcrumb: jest.fn()
}));

describe("WindowsUpdater", () => {
  let WindowsUpdater;
  let autoUpdater;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    autoUpdater = require("electron-updater").autoUpdater;
    WindowsUpdater = require("./WindowsUpdater.js").default;
  });

  test("should initialize with autoDownload disabled", () => {
    const updater = new WindowsUpdater();
    expect(updater.autoUpdater.autoDownload).toBe(false);
    expect(updater.mainWindow).toBeNull();
  });

  test("should set main window", () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } };
    updater.setMainWindow(mockWindow);
    expect(updater.mainWindow).toBe(mockWindow);
  });

  test("should send event to main window", () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } };
    updater.setMainWindow(mockWindow);

    updater.sendEvent("test-channel", { data: "test" });

    expect(mockWindow.webContents.send).toHaveBeenCalledWith("test-channel", { data: "test" });
  });

  test("should not send event when window is destroyed", () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(true) };
    updater.setMainWindow(mockWindow);

    updater.sendEvent("test-channel", { data: "test" });

    expect(mockWindow.webContents).toBeUndefined();
  });

  test("should send event with default empty data", () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } };
    updater.setMainWindow(mockWindow);

    updater.sendEvent("test-channel");

    expect(mockWindow.webContents.send).toHaveBeenCalledWith("test-channel", {});
  });

  test("should quit and install", () => {
    const updater = new WindowsUpdater();
    updater.quitAndInstall(true, false);
    expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(true, false);
  });

  test("should quit and install with default parameters", () => {
    const updater = new WindowsUpdater();
    updater.quitAndInstall();
    expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true);
  });

  test("should handle update error in initUpdater", () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } };
    updater.setMainWindow(mockWindow);

    const errorHandler = autoUpdater.on.mock.calls.find(call => call[0] === "error")[1];
    errorHandler(new Error("Test error"));

    expect(mockWindow.webContents.send).toHaveBeenCalledWith("update-error", { message: "Test error" });
  });

  test("should check for updates and handle update available", async () => {
    const updater = new WindowsUpdater();
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } };
    updater.setMainWindow(mockWindow);

    await updater.checkForUpdates();

    expect(autoUpdater.once).toHaveBeenCalledWith("update-not-available", expect.any(Function));
    expect(autoUpdater.once).toHaveBeenCalledWith("update-available", expect.any(Function));
    expect(autoUpdater.once).toHaveBeenCalledWith("error", expect.any(Function));
    expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
  });

  test("should check and download updates", async () => {
    const updater = new WindowsUpdater();

    await updater.checkAndDownload();

    expect(autoUpdater.once).toHaveBeenCalledWith("update-not-available", expect.any(Function));
    expect(autoUpdater.once).toHaveBeenCalledWith("update-available", expect.any(Function));
    expect(autoUpdater.once).toHaveBeenCalledWith("error", expect.any(Function));
    expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
  });

  test("should auto download update", () => {
    const updater = new WindowsUpdater();

    updater.autoDownloadUpdate();

    expect(autoUpdater.once).toHaveBeenCalledWith("update-downloaded", expect.any(Function));
    expect(autoUpdater.downloadUpdate).toHaveBeenCalled();
  });

  test("should download update", () => {
    const updater = new WindowsUpdater();

    updater.downloadUpdate();

    expect(autoUpdater.on).toHaveBeenCalledWith("update-downloaded", expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith("download-progress", expect.any(Function));
    expect(autoUpdater.downloadUpdate).toHaveBeenCalled();
  });
});
