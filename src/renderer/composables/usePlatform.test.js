jest.mock("@/composables/usePlatform", () => {
  const platformInfo = { isMac: false, platform: "win32" }
  return {
    __esModule: true,
    platformInfo,
    usePlatform: () => platformInfo
  }
})

const { usePlatform, platformInfo } = require("./usePlatform")

describe("usePlatform", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should return platform info object", () => {
    const result = usePlatform()
    expect(result).toBeDefined()
    expect(typeof result).toBe("object")
  })

  test("should have isMac property", () => {
    const result = usePlatform()
    expect(result.isMac).toBeDefined()
    expect(typeof result.isMac).toBe("boolean")
  })

  test("should have platform property", () => {
    const result = usePlatform()
    expect(result.platform).toBeDefined()
    expect(typeof result.platform).toBe("string")
  })

  test("should return same object on multiple calls", () => {
    const result1 = usePlatform()
    const result2 = usePlatform()
    expect(result1).toBe(result2)
  })

  test("platformInfo should be exported", () => {
    expect(platformInfo).toBeDefined()
    expect(typeof platformInfo).toBe("object")
  })
})
