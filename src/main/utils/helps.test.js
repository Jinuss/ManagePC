const { formatSize, isWindows, isMac } = require("./helps")

describe("formatSize", () => {
  test("should return '0 B' for 0 or invalid input", () => {
    expect(formatSize(0)).toBe("0 B")
    expect(formatSize(null)).toBe("0 B")
    expect(formatSize(undefined)).toBe("0 B")
  })

  test("should format bytes correctly", () => {
    expect(formatSize(1023)).toBe("1023 B")
    expect(formatSize(1024)).toBe("1 KB")
    expect(formatSize(1536)).toBe("1.5 KB")
    expect(formatSize(1048576)).toBe("1 MB")
    expect(formatSize(1572864)).toBe("1.5 MB")
    expect(formatSize(1073741824)).toBe("1 GB")
    expect(formatSize(1610612736)).toBe("1.5 GB")
    expect(formatSize(1099511627776)).toBe("1 TB")
  })

  test("should handle large numbers", () => {
    expect(formatSize(9999999999)).toBe("9.31 GB")
  })
})

describe("isWindows", () => {
  test("should return true for win32 platform", () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, "platform", { value: "win32" })
    expect(isWindows()).toBe(true)
    Object.defineProperty(process, "platform", { value: originalPlatform })
  })

  test("should return false for non-win32 platform", () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, "platform", { value: "darwin" })
    expect(isWindows()).toBe(false)
    Object.defineProperty(process, "platform", { value: originalPlatform })
  })
})

describe("isMac", () => {
  test("should return true for darwin platform", () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, "platform", { value: "darwin" })
    expect(isMac()).toBe(true)
    Object.defineProperty(process, "platform", { value: originalPlatform })
  })

  test("should return false for non-darwin platform", () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, "platform", { value: "win32" })
    expect(isMac()).toBe(false)
    Object.defineProperty(process, "platform", { value: originalPlatform })
  })
})
