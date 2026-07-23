jest.mock("../../utils/helps", () => ({
  isWindows: jest.fn(() => true),
  isMac: jest.fn(() => false)
}));

jest.mock("./WindowsUpdater", () => {
  const mockUpdater = {
    setMainWindow: jest.fn(),
    checkForUpdates: jest.fn(),
    checkAndDownload: jest.fn(),
    downloadUpdate: jest.fn(),
    quitAndInstall: jest.fn()
  };
  return jest.fn(() => mockUpdater);
});

jest.mock("./MacUpdater", () => {
  const mockUpdater = {
    setMainWindow: jest.fn(),
    checkForUpdatesAndNotify: jest.fn(),
    checkAndDownload: jest.fn(),
    downloadUpdate: jest.fn(),
    quitAndInstall: jest.fn()
  };
  return jest.fn(() => mockUpdater);
});

const helps = require("../../utils/helps");
const UpdateManager = require("./updateManager.js").default;

describe("UpdateManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create WindowsUpdater instance on Windows", () => {
    helps.isWindows.mockReturnValue(true);
    helps.isMac.mockReturnValue(false);
    
    const manager = new UpdateManager();
    
    expect(manager.updater).toBeDefined();
  });

  test("should set main window", () => {
    const manager = new UpdateManager();
    const mockWindow = { id: 1 };
    
    manager.setMainWindow(mockWindow);
    
    expect(manager.updater.setMainWindow).toHaveBeenCalledWith(mockWindow);
  });

  test("should check for updates", () => {
    const manager = new UpdateManager();
    
    manager.checkForUpdates();
    
    expect(manager.updater.checkForUpdates).toHaveBeenCalled();
  });

  test("should check and download updates", () => {
    const manager = new UpdateManager();
    const options = { autoDownload: true };
    
    manager.checkAndDownloadUpdates(options);
    
    expect(manager.updater.checkAndDownload).toHaveBeenCalledWith(options);
  });

  test("should download update", () => {
    const manager = new UpdateManager();
    const options = { silent: true };
    
    manager.downloadUpdate(options);
    
    expect(manager.updater.downloadUpdate).toHaveBeenCalledWith(options);
  });

  test("should quit and install", () => {
    const manager = new UpdateManager();
    
    manager.quitAndInstall(true, false);
    
    expect(manager.updater.quitAndInstall).toHaveBeenCalledWith(true, false);
  });
});