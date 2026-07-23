jest.mock("../../utils/nativeModuleLoader", () => ({
  loadNativeModule: jest.fn().mockReturnValue({
    success: true,
    module: {
      getScreenSize: jest.fn().mockReturnValue({ width: 1920, height: 1080 }),
      setScreenResolution: jest.fn().mockReturnValue(true),
      getAllScreenResolutions: jest.fn().mockReturnValue([{ width: 1920, height: 1080 }, { width: 1280, height: 720 }]),
      startResolutionNotification: jest.fn().mockReturnValue(true),
      stopResolutionNotification: jest.fn().mockReturnValue(true)
    }
  })
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe("ScreenManager", () => {
  let ScreenManager

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ScreenManager = require("./screenManager.js").default
  })

  test("should initialize with native module available", () => {
    const screenManager = new ScreenManager()
    expect(screenManager.isNativeAvailable()).toBe(true)
    expect(screenManager.getLoadError()).toBeUndefined()
  })

  test("should get screen resolution", () => {
    const screenManager = new ScreenManager()
    const result = screenManager.getScreenResolution()
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ width: 1920, height: 1080 })
  })

  test("should set screen resolution with valid values", () => {
    const screenManager = new ScreenManager()
    const result = screenManager.setScreenResolution(1920, 1080)
    expect(result.success).toBe(true)
  })

  test("should reject invalid screen resolution", () => {
    const screenManager = new ScreenManager()
    expect(screenManager.setScreenResolution("invalid", 1080).success).toBe(false)
    expect(screenManager.setScreenResolution(1920, "invalid").success).toBe(false)
    expect(screenManager.setScreenResolution(-100, 1080).success).toBe(false)
    expect(screenManager.setScreenResolution(1920, -100).success).toBe(false)
  })

  test("should get all screen resolutions", () => {
    const screenManager = new ScreenManager()
    const result = screenManager.getAllScreenResolutions()
    expect(result.success).toBe(true)
    expect(result.data).toEqual([{ width: 1920, height: 1080 }, { width: 1280, height: 720 }])
  })

  test("should start resolution listen", () => {
    const screenManager = new ScreenManager()
    const result = screenManager.startResolutionListen()
    expect(result.success).toBe(true)
    expect(screenManager.isListening).toBe(true)
  })

  test("should not start resolution listen if already listening", () => {
    const screenManager = new ScreenManager()
    screenManager.isListening = true
    const result = screenManager.startResolutionListen()
    expect(result.success).toBe(true)
  })

  test("should stop resolution listen", () => {
    const screenManager = new ScreenManager()
    screenManager.isListening = true
    const result = screenManager.stopResolutionListen()
    expect(result.success).toBe(true)
    expect(screenManager.isListening).toBe(false)
  })

  test("should not stop resolution listen if not listening", () => {
    const screenManager = new ScreenManager()
    screenManager.isListening = false
    const result = screenManager.stopResolutionListen()
    expect(result.success).toBe(true)
  })

  test("should emit resolution-changed event", () => {
    const screenManager = new ScreenManager()
    const mockCallback = jest.fn()
    screenManager.on("resolution-changed", mockCallback)
    screenManager.emit("resolution-changed", { width: 1920, height: 1080 })
    expect(mockCallback).toHaveBeenCalledWith({ width: 1920, height: 1080 })
  })

  test("should handle native module not available", () => {
    jest.resetModules()
    jest.mock("../../utils/nativeModuleLoader", () => ({
      loadNativeModule: jest.fn().mockReturnValue({
        success: false,
        error: new Error("Native module not loaded")
      })
    }))
    ScreenManager = require("./screenManager.js").default
    const screenManager = new ScreenManager()

    expect(screenManager.isNativeAvailable()).toBe(false)
    expect(screenManager.getScreenResolution().success).toBe(false)
    expect(screenManager.setScreenResolution(1920, 1080).success).toBe(false)
  })
})
