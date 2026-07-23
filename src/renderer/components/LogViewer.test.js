const { mount } = require("@vue/test-utils")
const LogViewer = require("./LogViewer.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "logViewer.refresh": "刷新",
      "logViewer.clear": "清空",
      "logViewer.lines": "行数",
      "logViewer.size": "大小",
      "logViewer.logLimitHint": "限制显示最近500条",
      "logViewer.empty": "暂无日志",
      "logViewer.loadError": "加载日志失败",
      "logViewer.clearSuccess": "清空成功",
      "logViewer.clearError": "清空失败"
    }[key] || key)
  })
}))

jest.mock("naive-ui", () => ({
  NButton: { template: "<button><slot /></button>" },
  NMessageProvider: { template: "<div><slot /></div>" },
  useMessage: () => ({
    error: jest.fn(),
    success: jest.fn()
  })
}))

describe("LogViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render log viewer with empty state", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    expect(wrapper.find(".log-viewer").exists()).toBe(true)
    expect(wrapper.find(".log-empty").exists()).toBe(true)
    expect(wrapper.find(".log-empty").text()).toBe("暂无日志")
  })

  test("should render logs when data is available", async () => {
    const mockLogs = [
      { timestamp: Date.now(), level: "info", message: "Application started" },
      { timestamp: Date.now(), level: "warn", message: "Low memory warning" },
      { timestamp: Date.now(), level: "error", message: "Failed to connect" }
    ]
    global.electronAPI.readLogs.mockResolvedValue(mockLogs)
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 3, size: 1024, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    expect(wrapper.find(".log-empty").exists()).toBe(false)
    
    const logLines = wrapper.findAll(".log-line")
    expect(logLines.length).toBe(3)
    
    expect(logLines[0].find(".log-level").text()).toBe("[INFO]")
    expect(logLines[1].find(".log-level").text()).toBe("[WARN]")
    expect(logLines[2].find(".log-level").text()).toBe("[ERROR]")
  })

  test("should display correct log stats", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 100, size: 2048, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const stats = wrapper.find(".log-stats")
    expect(stats.text()).toContain("行数: 100")
    expect(stats.text()).toContain("大小: 2.00 KB")
  })

  test("should display DEV badge when in dev mode", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: true })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const badge = wrapper.find(".log-mode-badge")
    expect(badge.classes()).toContain("dev")
    expect(badge.text()).toBe("DEV")
  })

  test("should display PROD badge when in production mode", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const badge = wrapper.find(".log-mode-badge")
    expect(badge.classes()).toContain("prod")
    expect(badge.text()).toBe("PROD")
  })

  test("should call refreshLogs when refresh button is clicked", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const refreshBtn = wrapper.findAll("button")[0]
    await refreshBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.readLogs).toHaveBeenCalledTimes(2)
  })

  test("should call clearLogs when clear button is clicked", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")
    global.electronAPI.clearLogs.mockResolvedValue({ success: true })

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const clearBtn = wrapper.findAll("button")[1]
    await clearBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.clearLogs).toHaveBeenCalled()
  })

  test("should handle log path display with long paths", async () => {
    const longPath = "C:\\Users\\User\\AppData\\Roaming\\Application\\Logs\\app.log"
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue(longPath)

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const logPath = wrapper.find(".log-path")
    expect(logPath.text()).toContain("...")
  })

  test("should format time correctly", async () => {
    const timestamp = new Date("2024-01-15T10:30:45").getTime()
    const mockLogs = [
      { timestamp, level: "info", message: "Test log" }
    ]
    global.electronAPI.readLogs.mockResolvedValue(mockLogs)
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 1, size: 100, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    const logTime = wrapper.find(".log-time")
    expect(logTime.text()).toBe("01/15/2024 10:30:45")
  })

  test("should match snapshot with logs", async () => {
    const mockLogs = [
      { timestamp: Date.now(), level: "info", message: "Application started" },
      { timestamp: Date.now(), level: "warn", message: "Low memory warning" }
    ]
    global.electronAPI.readLogs.mockResolvedValue(mockLogs)
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 2, size: 1024, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  test("should match snapshot with empty state", async () => {
    global.electronAPI.readLogs.mockResolvedValue([])
    global.electronAPI.getLogInfo.mockResolvedValue({ lineCount: 0, size: 0, isDev: false })
    global.electronAPI.getLogPath.mockResolvedValue("C:\\logs\\app.log")

    const wrapper = mount(LogViewer)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
