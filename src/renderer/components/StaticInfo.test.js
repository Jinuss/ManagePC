const { mount } = require("@vue/test-utils")
const StaticInfo = require("./StaticInfo.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "system.title": "系统信息",
      "system.hostname": "主机名",
      "system.os": "操作系统",
      "system.platform": "平台",
      "system.cpu": "CPU",
      "system.cores": "核心数",
      "system.uptime": "运行时间",
      "system.memory": "内存",
      "common.unknown": "未知"
    }[key] || key)
  })
}))

jest.mock("../utils/helpers", () => ({
  formatUptime: (seconds) => {
    if (seconds === 93660) return "1天 2小时 1分钟"
    if (seconds === 3660) return "1小时 1分钟"
    if (seconds === 60) return "1分钟"
    if (seconds === 0) return "0秒"
    return `${seconds}秒`
  }
}))

describe("StaticInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render system info correctly", async () => {
    global.electronAPI.getSystemInfo.mockResolvedValue({
      hostname: "DESKTOP-ABC123",
      distro: "Windows 10",
      platform: "win32",
      cpuModel: "Intel i7-10700K",
      cpuCores: 8,
      uptime: 93660,
      totalMemory: "16 GB"
    })

    const wrapper = mount(StaticInfo)
    await waitForNextTick()

    expect(wrapper.find(".system-card").exists()).toBe(true)
    
    const infoRows = wrapper.findAll(".info-row")
    expect(infoRows.length).toBe(7)
    
    expect(infoRows[0].find(".info-value").text()).toBe("DESKTOP-ABC123")
    expect(infoRows[1].find(".info-value").text()).toBe("Windows 10")
    expect(infoRows[2].find(".info-value").text()).toBe("win32")
    expect(infoRows[3].find(".info-value").text()).toBe("Intel i7-10700K")
    expect(infoRows[4].find(".info-value").text()).toBe("8")
    expect(infoRows[5].find(".info-value").text()).toBe("1天 2小时 1分钟")
    expect(infoRows[6].find(".info-value").text()).toBe("16 GB")
  })

  test("should render unknown when system info is empty", async () => {
    global.electronAPI.getSystemInfo.mockResolvedValue({})

    const wrapper = mount(StaticInfo)
    await waitForNextTick()

    const infoRows = wrapper.findAll(".info-row")
    expect(infoRows[0].find(".info-value").text()).toBe("未知")
    expect(infoRows[1].find(".info-value").text()).toBe("未知")
  })

  test("should handle fetch error gracefully", async () => {
    global.electronAPI.getSystemInfo.mockRejectedValue(new Error("Network error"))

    const wrapper = mount(StaticInfo)
    await waitForNextTick()

    expect(wrapper.find(".system-card").exists()).toBe(true)
    
    const infoRows = wrapper.findAll(".info-row")
    expect(infoRows[0].find(".info-value").text()).toBe("未知")
  })

  test("should format uptime correctly", async () => {
    global.electronAPI.getSystemInfo.mockResolvedValue({
      uptime: 3660
    })

    const wrapper = mount(StaticInfo)
    await waitForNextTick()

    const uptimeRow = wrapper.findAll(".info-row").find(row => row.text().includes("运行时间"))
    expect(uptimeRow.find(".info-value").text()).toBe("1小时 1分钟")
  })

  test("should match snapshot", async () => {
    global.electronAPI.getSystemInfo.mockResolvedValue({
      hostname: "DESKTOP-ABC123",
      distro: "Windows 10",
      platform: "win32",
      cpuModel: "Intel i7-10700K",
      cpuCores: 8,
      uptime: 93660,
      totalMemory: "16 GB"
    })

    const wrapper = mount(StaticInfo)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
