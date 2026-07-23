const { mount } = require("@vue/test-utils")
const ScreenResolution = require("./ScreenResolution.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "screen.currentResolution": "当前分辨率",
      "screen.pixels": "像素",
      "screen.availableResolutions": "可用分辨率",
      "screen.selectResolution": "选择分辨率",
      "screen.current": "当前",
      "screen.setFailed": "设置失败: {error}",
      "common.refresh": "刷新",
      "common.apply": "应用",
      "common.setting": "设置中",
      "common.retry": "重试",
      "common.loading": "加载中"
    }[key] || key)
  })
}))

jest.mock("naive-ui", () => ({
  NButton: { template: "<button class=\"n-button\"><slot /></button>" },
  NSelect: { template: "<div class=\"n-select\"><slot /></div>" }
}))

describe("ScreenResolution", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.alert = jest.fn()
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render current resolution when data is available", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [{ width: 1920, height: 1080 }]
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    expect(wrapper.find(".current-resolution-card").exists()).toBe(true)
    expect(wrapper.find(".resolution-value").text()).toBe("1920")
  })

  test("should render error state when current resolution fetch fails", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: false,
      error: "获取失败"
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: []
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    expect(wrapper.find(".error-card").exists()).toBe(true)
    expect(wrapper.find(".error-message").text()).toBe("获取失败")
  })

  test("should render available resolutions list", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 1366, height: 768 }
      ]
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    expect(wrapper.find(".select-container").exists()).toBe(true)
  })

  test("should render error state when resolutions fetch fails", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: false,
      error: "获取分辨率列表失败"
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    expect(wrapper.find(".error-card").exists()).toBe(true)
    expect(wrapper.find(".error-message").text()).toBe("获取分辨率列表失败")
  })

  test("should call refresh when refresh button is clicked", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [{ width: 1920, height: 1080 }]
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    const sections = wrapper.findAll(".section")
    const secondSection = sections[1]
    const refreshBtn = secondSection.find(".n-button")
    await refreshBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.getScreenResolution).toHaveBeenCalledTimes(2)
    expect(global.electronAPI.getAllScreenResolutions).toHaveBeenCalledTimes(2)
  })

  test("should call applyResolution when apply button is clicked", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }]
    })
    global.electronAPI.setScreenResolution.mockResolvedValue({ success: true })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    const applyBtn = wrapper.find(".apply-btn")
    await applyBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.setScreenResolution).toHaveBeenCalled()
  })

  test("should handle apply resolution failure", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [{ width: 1920, height: 1080 }]
    })
    global.electronAPI.setScreenResolution.mockResolvedValue({
      success: false,
      error: "设置失败"
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    const applyBtn = wrapper.find(".apply-btn")
    await applyBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.setScreenResolution).toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalled()
  })

  test("should match snapshot", async () => {
    global.electronAPI.getScreenResolution.mockResolvedValue({
      success: true,
      data: { width: 1920, height: 1080 }
    })
    global.electronAPI.getAllScreenResolutions.mockResolvedValue({
      success: true,
      data: [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 }
      ]
    })

    const wrapper = mount(ScreenResolution)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
