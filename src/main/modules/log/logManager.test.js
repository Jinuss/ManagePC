const fs = require("fs")

jest.mock("electron", () => ({
  app: {
    isPackaged: false,
    getAppPath: jest.fn().mockReturnValue("/app"),
    getPath: jest.fn().mockReturnValue("/userData")
  }
}))

jest.mock("electron-log", () => {
  const mockLog = {
    transports: {
      file: {
        resolvePathFn: jest.fn(),
        level: "debug",
        format: "[{m}/{d}/{y} {h}:{i}:{s}] [{level}] {text}"
      },
      console: {
        level: "debug"
      }
    },
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
  return mockLog
})

jest.mock("../../utils/helps", () => ({
  isWindows: jest.fn().mockReturnValue(true),
  isMac: jest.fn().mockReturnValue(false)
}))

// Import once at the top
const logManager = require("./logManager.js").default

describe("LogManager", () => {
  let originalExistsSync
  let originalWriteFileSync
  let originalReadFileSync
  let originalStatSync

  beforeEach(() => {
    jest.clearAllMocks()
    originalExistsSync = fs.existsSync
    originalWriteFileSync = fs.writeFileSync
    originalReadFileSync = fs.readFileSync
    originalStatSync = fs.statSync

    fs.existsSync = jest.fn().mockReturnValue(true)
    fs.writeFileSync = jest.fn()
    fs.readFileSync = jest.fn().mockReturnValue("[01/01/2024 12:00:00] [INFO] Test log\n[01/01/2024 12:01:00] [ERROR] Error log")
    fs.statSync = jest.fn().mockReturnValue({ size: 100 })
  })

  afterEach(() => {
    fs.existsSync = originalExistsSync
    fs.writeFileSync = originalWriteFileSync
    fs.readFileSync = originalReadFileSync
    fs.statSync = originalStatSync
  })

  test("should parse log line correctly", () => {
    var parsed = logManager.parseLogLine("[01/15/2024 14:30:45] [INFO] Test message")
    expect(parsed.timestamp).toEqual(new Date("2024-01-15T14:30:45"))
    expect(parsed.level).toBe("info")
    expect(parsed.message).toBe("Test message")
  })

  test("should parse unformatted log line", () => {
    var parsed = logManager.parseLogLine("Plain text log")
    expect(parsed.level).toBe("info")
    expect(parsed.message).toBe("Plain text log")
  })

  test("should read logs", async () => {
    var logs = await logManager.readLogs()
    expect(logs.length).toBe(2)
    expect(logs[0].level).toBe("info")
    expect(logs[1].level).toBe("error")
  })

  test("should return empty array when log file does not exist", async () => {
    fs.existsSync = jest.fn().mockReturnValue(false)
    var logs = await logManager.readLogs()
    expect(logs.length).toBe(0)
  })

  test("should clear logs", async () => {
    var result = await logManager.clearLogs()
    expect(result.success).toBe(true)
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  test("should get log info", () => {
    var info = logManager.getLogInfo()
    expect(info.path).toBeDefined()
    expect(info.size).toBe(100)
    expect(info.lineCount).toBe(2)
  })

  test("should get log path", () => {
    var logPath = logManager.getLogPath()
    expect(logPath).toBeDefined()
  })
})
