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

describe("StoreManager", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test("should get default window bounds", () => {
    const storeManager = require("./index.js").default
    const bounds = storeManager.getWindowBounds()

    expect(bounds).toEqual({
      width: 800,
      height: 550,
      x: null,
      y: null
    })
  })

  test("should save window bounds", () => {
    const storeManager = require("./index.js").default
    const testBounds = { width: 1000, height: 600, x: 100, y: 50 }

    storeManager.saveWindowBounds(testBounds)
    const bounds = storeManager.getWindowBounds()

    expect(bounds).toEqual(testBounds)
  })

  test("should get default alwaysOnTop state", () => {
    const storeManager = require("./index.js").default
    const result = storeManager.getAlwaysOnTop()

    expect(result).toBe(false)
  })

  test("should set alwaysOnTop state", () => {
    const storeManager = require("./index.js").default

    storeManager.setAlwaysOnTop(true)
    expect(storeManager.getAlwaysOnTop()).toBe(true)

    storeManager.setAlwaysOnTop(false)
    expect(storeManager.getAlwaysOnTop()).toBe(false)
  })

  test("should get store instance", () => {
    const storeManager = require("./index.js").default
    const store = storeManager.getStore()

    expect(store).toBeDefined()
    expect(typeof store.get).toBe("function")
    expect(typeof store.set).toBe("function")
  })
})
