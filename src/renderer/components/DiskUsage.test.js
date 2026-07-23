const { mount } = require("@vue/test-utils")
const DiskUsage = require("./DiskUsage.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "disk.usage": "磁盘使用",
      "common.refresh": "刷新",
      "disk.totalSize": "总容量",
      "disk.used": "已用",
      "disk.free": "可用",
      "disk.noDisk": "暂无磁盘信息"
    }[key] || key)
  })
}))

describe("DiskUsage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render empty state when no disk data", async () => {
    global.electronAPI.getDiskUsage.mockResolvedValue([])

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    expect(wrapper.find(".empty-state").exists()).toBe(true)
    expect(wrapper.find(".disk-list").exists()).toBe(false)
  })

  test("should render disk list when disk data is available", async () => {
    const mockDiskData = [
      { drive: "C:", percentage: 50, total: "500 GB", used: "250 GB", free: "250 GB" },
      { drive: "D:", percentage: 85, total: "1 TB", used: "850 GB", free: "150 GB" }
    ]
    global.electronAPI.getDiskUsage.mockResolvedValue(mockDiskData)

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    expect(wrapper.find(".empty-state").exists()).toBe(false)
    expect(wrapper.find(".disk-list").exists()).toBe(true)
    
    const diskCards = wrapper.findAll(".disk-card")
    expect(diskCards.length).toBe(2)
    
    expect(diskCards[0].find(".disk-name").text()).toBe("C:")
    expect(diskCards[1].find(".disk-name").text()).toBe("D:")
  })

  test("should display correct status classes based on percentage", async () => {
    const mockDiskData = [
      { drive: "C:", percentage: 45, total: "500 GB", used: "225 GB", free: "275 GB" },
      { drive: "D:", percentage: 75, total: "1 TB", used: "750 GB", free: "250 GB" },
      { drive: "E:", percentage: 92, total: "500 GB", used: "460 GB", free: "40 GB" }
    ]
    global.electronAPI.getDiskUsage.mockResolvedValue(mockDiskData)

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    const diskCards = wrapper.findAll(".disk-card")
    
    expect(diskCards[0].find(".status").classes()).toContain("normal")
    expect(diskCards[1].find(".status").classes()).toContain("warning")
    expect(diskCards[2].find(".status").classes()).toContain("danger")
  })

  test("should call fetchDiskUsage when refresh button is clicked", async () => {
    global.electronAPI.getDiskUsage.mockResolvedValue([])

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    const refreshBtn = wrapper.find(".refresh-btn")
    await refreshBtn.trigger("click")
    await waitForNextTick()

    expect(global.electronAPI.getDiskUsage).toHaveBeenCalledTimes(2)
  })

  test("should handle fetch error gracefully", async () => {
    global.electronAPI.getDiskUsage.mockRejectedValue(new Error("Network error"))

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    expect(wrapper.find(".empty-state").exists()).toBe(true)
  })

  test("should render disk info correctly", async () => {
    const mockDiskData = [
      { drive: "C:", percentage: 50, total: "500 GB", used: "250 GB", free: "250 GB" }
    ]
    global.electronAPI.getDiskUsage.mockResolvedValue(mockDiskData)

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    const diskInfo = wrapper.find(".disk-info")
    const infoItems = diskInfo.findAll(".info-item")

    expect(infoItems.length).toBe(3)
    expect(infoItems[0].find(".value").text()).toBe("500 GB")
    expect(infoItems[1].find(".value").text()).toBe("250 GB")
    expect(infoItems[2].find(".value").text()).toBe("250 GB")
  })

  test("should match snapshot", async () => {
    const mockDiskData = [
      { drive: "C:", percentage: 50, total: "500 GB", used: "250 GB", free: "250 GB" },
      { drive: "D:", percentage: 85, total: "1 TB", used: "850 GB", free: "150 GB" }
    ]
    global.electronAPI.getDiskUsage.mockResolvedValue(mockDiskData)

    const wrapper = mount(DiskUsage)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
