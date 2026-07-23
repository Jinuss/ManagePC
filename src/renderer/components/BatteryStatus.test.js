const { mount } = require("@vue/test-utils")
const BatteryStatus = require("./BatteryStatus.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "battery.title": "电池状态", "battery.charging": "充电中", "battery.discharging": "放电中",
      "battery.voltage": "电压", "battery.current": "当前容量", "battery.max": "最大容量",
      "battery.design": "设计容量", "battery.health": "健康度", "battery.noBattery": "未检测到电池"
    }[key] || key)
  })
}))

describe("BatteryStatus", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should render battery info when battery exists", async () => {
    global.electronAPI.getBatteryInfo.mockResolvedValue({ hasBattery: true, percent: 80, isCharging: false })
    const wrapper = mount(BatteryStatus)
    await waitForNextTick()
    expect(wrapper.find(".battery-main").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getBatteryInfo.mockResolvedValue({ hasBattery: true, percent: 80, isCharging: false, voltage: "12.5V", currentCapacity: 4000, maxCapacity: 4500, designedCapacity: 5000 })
    const wrapper = mount(BatteryStatus)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})