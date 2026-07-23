import TrayManager from "./trayManager.js"

jest.mock("electron", () => ({
  app: {
    quit: jest.fn()
  },
  Tray: jest.fn().mockImplementation(() => ({
    setContextMenu: jest.fn(),
    setToolTip: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn()
  })),
  Menu: {
    buildFromTemplate: jest.fn().mockReturnValue({})
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock("../../utils/helps", () => ({
  getTrayIconPath: jest.fn().mockReturnValue("/tray.ico"),
  isMac: jest.fn().mockReturnValue(false)
}))

jest.mock("../../index", () => ({
  setIsQuitting: jest.fn()
}))

describe("TrayManager", () => {
  let trayManager

  beforeEach(() => {
    jest.clearAllMocks()
    trayManager = new TrayManager()
  })

  test("should initialize with default values", () => {
    expect(trayManager.tray).toBeNull()
    expect(trayManager.mainWindow).toBeNull()
    expect(trayManager.windowManager).toBeNull()
  })

  test("should set window manager", () => {
    const mockWindowManager = {
      createMainWindow: jest.fn(),
      getMainWindow: jest.fn().mockReturnValue({ isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() })
    }
    trayManager.setWindowManager(mockWindowManager)
    expect(trayManager.windowManager).toBe(mockWindowManager)
  })

  test("should create tray", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() }
    trayManager.init(mockWindow)
    expect(trayManager.tray).not.toBeNull()
    expect(trayManager.mainWindow).toBe(mockWindow)
  })

  test("should show window", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() }
    trayManager.init(mockWindow)
    trayManager.showWindow()
    expect(mockWindow.show).toHaveBeenCalled()
    expect(mockWindow.focus).toHaveBeenCalled()
  })

  test("should recreate window if destroyed", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(true) }
    const mockWindowManager = {
      createMainWindow: jest.fn(),
      getMainWindow: jest.fn().mockReturnValue({ isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() })
    }
    trayManager.setWindowManager(mockWindowManager)
    trayManager.init(mockWindow)
    trayManager.showWindow()
    expect(mockWindowManager.createMainWindow).toHaveBeenCalled()
  })

  test("should hide window", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), hide: jest.fn() }
    trayManager.init(mockWindow)
    trayManager.hideWindow()
    expect(mockWindow.hide).toHaveBeenCalled()
  })

  test("should quit app", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() }
    const mockTray = { destroy: jest.fn() }
    trayManager.init(mockWindow)
    trayManager.tray = mockTray
    trayManager.quitApp()
    expect(mockTray.destroy).toHaveBeenCalled()
    expect(require("../../index").setIsQuitting).toHaveBeenCalledWith(true)
  })

  test("should get tray", () => {
    const mockWindow = { isDestroyed: jest.fn().mockReturnValue(false), show: jest.fn(), focus: jest.fn() }
    trayManager.init(mockWindow)
    const tray = trayManager.getTray()
    expect(tray).not.toBeNull()
  })
})
