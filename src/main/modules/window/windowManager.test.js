import WindowManager from "./windowManager.js"

jest.mock("electron", () => ({
  app: {
    isPackaged: false,
    getAppPath: jest.fn().mockReturnValue("/app")
  },
  BrowserWindow: jest.fn().mockImplementation(() => {
    const mockWindow = {
      loadURL: jest.fn(),
      loadFile: jest.fn(),
      webContents: {
        openDevTools: jest.fn(),
        send: jest.fn()
      },
      on: jest.fn(),
      minimize: jest.fn(),
      maximize: jest.fn(),
      unmaximize: jest.fn(),
      close: jest.fn(),
      show: jest.fn(),
      focus: jest.fn(),
      isMaximized: jest.fn().mockReturnValue(false),
      isDestroyed: jest.fn().mockReturnValue(false),
      getBounds: jest.fn().mockReturnValue({ width: 800, height: 550, x: 0, y: 0 }),
      setAlwaysOnTop: jest.fn()
    }
    return mockWindow
  })
}))

jest.mock("../../store/index", () => ({
  __esModule: true,
  default: {
    getWindowBounds: jest.fn().mockReturnValue({ width: 800, height: 550, x: 0, y: 0 }),
    saveWindowBounds: jest.fn(),
    getAlwaysOnTop: jest.fn().mockReturnValue(false),
    setAlwaysOnTop: jest.fn()
  },
  defaultState: {
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
}))

jest.mock("../log/logManager", () => ({
  __esModule: true,
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock("../../utils/helps", () => ({
  __esModule: true,
  isMac: jest.fn().mockReturnValue(false),
  getIconPath: jest.fn().mockReturnValue("/icon.ico")
}))

jest.mock("../../index", () => ({
  __esModule: true,
  getIsQuitting: jest.fn().mockReturnValue(false)
}))

describe("WindowManager", () => {
  let windowManager

  beforeEach(() => {
    jest.clearAllMocks()
    windowManager = new WindowManager()
  })

  test("should initialize with default options", () => {
    expect(windowManager.mainWindow).toBeNull()
    expect(windowManager.settingsWindow).toBeNull()
    expect(windowManager.isAlwaysOnTop).toBe(false)
    expect(windowManager.baseOptions).toEqual({ frame: false })
  })

  test("should set tray manager", () => {
    const mockTrayManager = { getTray: jest.fn().mockReturnValue({ isDestroyed: jest.fn().mockReturnValue(false) }) }
    windowManager.setTrayManager(mockTrayManager)
    expect(windowManager.trayManager).toBe(mockTrayManager)
  })

  test("should create main window", () => {
    windowManager.createMainWindow()
    expect(windowManager.mainWindow).not.toBeNull()
    expect(windowManager.mainWindow.loadURL).toHaveBeenCalledWith("http://localhost:5173")
  })

  test("should get main window", () => {
    windowManager.createMainWindow()
    const window = windowManager.getMainWindow()
    expect(window).not.toBeNull()
  })

  test("should show window", () => {
    windowManager.createMainWindow()
    windowManager.showWindow()
    expect(windowManager.mainWindow.show).toHaveBeenCalled()
    expect(windowManager.mainWindow.focus).toHaveBeenCalled()
  })

  test("should create settings window", () => {
    windowManager.createSettingsWindow()
    expect(windowManager.settingsWindow).not.toBeNull()
    expect(windowManager.settingsWindow.loadURL).toHaveBeenCalledWith("http://localhost:5173/windows/settings/index.html")
  })

  test("should focus existing settings window", () => {
    windowManager.createSettingsWindow()
    const firstWindow = windowManager.settingsWindow
    windowManager.createSettingsWindow()
    expect(windowManager.settingsWindow).toBe(firstWindow)
    expect(firstWindow.focus).toHaveBeenCalled()
  })

  test("should close settings window", () => {
    windowManager.createSettingsWindow()
    const settingsWindow = windowManager.settingsWindow
    windowManager.closeSettingsWindow()
    expect(settingsWindow.close).toHaveBeenCalled()
    expect(windowManager.settingsWindow).toBeNull()
  })

  test("should get settings window", () => {
    windowManager.createSettingsWindow()
    const window = windowManager.getSettingsWindow()
    expect(window).not.toBeNull()
  })

  test("should minimize window", () => {
    windowManager.createMainWindow()
    windowManager.minimizeWindow()
    expect(windowManager.mainWindow.minimize).toHaveBeenCalled()
  })

  test("should maximize window", () => {
    windowManager.createMainWindow()
    windowManager.maximizeWindow()
    expect(windowManager.mainWindow.maximize).toHaveBeenCalled()
  })

  test("should unmaximize window when already maximized", () => {
    windowManager.createMainWindow()
    windowManager.mainWindow.isMaximized.mockReturnValue(true)
    windowManager.maximizeWindow()
    expect(windowManager.mainWindow.unmaximize).toHaveBeenCalled()
  })

  test("should close window", () => {
    windowManager.createMainWindow()
    windowManager.closeWindow()
    expect(windowManager.mainWindow.close).toHaveBeenCalled()
  })

  test("should set always on top", () => {
    windowManager.createMainWindow()
    windowManager.setAlwaysOnTop(true)
    expect(windowManager.isAlwaysOnTop).toBe(true)
    expect(windowManager.mainWindow.setAlwaysOnTop).toHaveBeenCalledWith(true)
  })

  test("should get always on top", () => {
    windowManager.isAlwaysOnTop = true
    expect(windowManager.getAlwaysOnTop()).toBe(true)
  })

  test("should set theme", () => {
    windowManager.setTheme("dark")
    expect(windowManager.currentTheme).toBe("dark")
  })
})
