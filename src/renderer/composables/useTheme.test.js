const { useTheme, initTheme, setupSystemThemeListener, setupThemeChangeListener } = require("./useTheme")
const { THEME_IDS } = require("../constants")

describe("useTheme", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 重置 theme ref
    const { theme } = useTheme()
    theme.value = THEME_IDS.SYSTEM
    // Mock matchMedia
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })
  })

  test("should return theme ref", () => {
    const { theme } = useTheme()
    expect(theme).toBeDefined()
    expect(theme.value).toBe(THEME_IDS.SYSTEM)
  })

  test("theme ref should be reactive", () => {
    const { theme } = useTheme()
    theme.value = THEME_IDS.LIGHT
    expect(theme.value).toBe(THEME_IDS.LIGHT)

    theme.value = THEME_IDS.DARK
    expect(theme.value).toBe(THEME_IDS.DARK)

    theme.value = THEME_IDS.SYSTEM
    expect(theme.value).toBe(THEME_IDS.SYSTEM)
  })

  test("should return same theme ref on multiple calls", () => {
    const { theme: theme1 } = useTheme()
    const { theme: theme2 } = useTheme()
    expect(theme1).toBe(theme2)
  })
})

describe("initTheme", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.electronAPI.getSavedTheme = jest.fn().mockResolvedValue({ theme: THEME_IDS.LIGHT })
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })
    global.electronAPI.onThemeChanged = jest.fn().mockReturnValue(jest.fn())
  })

  test("should initialize theme from electronAPI", async () => {
    await initTheme()
    const { theme } = useTheme()
    expect(global.electronAPI.getSavedTheme).toHaveBeenCalled()
    expect(theme.value).toBe(THEME_IDS.LIGHT)
  })

  test("should use SYSTEM theme when API fails", async () => {
    global.electronAPI.getSavedTheme.mockRejectedValue(new Error("Failed to get theme"))
    await initTheme()
    const { theme } = useTheme()
    expect(theme.value).toBe(THEME_IDS.SYSTEM)
  })

  test("should use SYSTEM theme when theme is not provided", async () => {
    global.electronAPI.getSavedTheme.mockResolvedValue({})
    await initTheme()
    const { theme } = useTheme()
    expect(theme.value).toBe(THEME_IDS.SYSTEM)
  })
})

describe("setupSystemThemeListener", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should set up media query listener", () => {
    const addEventListenerMock = jest.fn()
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock
    })

    setupSystemThemeListener()

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)")
    expect(addEventListenerMock).toHaveBeenCalled()
  })
})

describe("setupThemeChangeListener", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should set up theme change listener when electronAPI is available", () => {
    global.electronAPI.onThemeChanged = jest.fn().mockReturnValue(jest.fn())

    setupThemeChangeListener()

    expect(global.electronAPI.onThemeChanged).toHaveBeenCalled()
  })

  test("should not set up listener when electronAPI is not available", () => {
    delete global.electronAPI.onThemeChanged

    expect(() => {
      setupThemeChangeListener()
    }).not.toThrow()
  })
})
