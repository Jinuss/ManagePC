const { shallowMount } = require("@vue/test-utils")

jest.mock("./TrendCharts.vue", () => ({
  default: { name: "TrendCharts", template: "<div class=\"trend-charts\"></div>", props: ["cpuHistory", "memoryHistory", "networkHistory"] }
}))

jest.mock("./TrendChart.vue", () => ({
  default: { name: "TrendChart", template: "<div class=\"trend-chart\"></div>", props: ["title", "icon", "data", "color", "colors", "hasMultipleSeries", "seriesNames"] }
}))

jest.mock("../utils/helpers", () => ({
  updateHistory: jest.fn((arr, value, max) => { arr.push(value); if (arr.length > max) arr.shift(); })
}))

const PCMonitor = require("./PCMonitor.vue").default

describe("PCMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.requestAnimationFrame = jest.fn((cb) => { cb(); return 1; })
    global.cancelAnimationFrame = jest.fn()
  })

  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and set up event listener", async () => {
    global.electronAPI.onSystemStats.mockReturnValue(jest.fn())
    const wrapper = shallowMount(PCMonitor)
    await waitForNextTick()
    expect(wrapper.find(".pc-monitor").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    let callbackFn = null
    global.electronAPI.onSystemStats.mockImplementation((callback) => { callbackFn = callback; return jest.fn(); })
    const wrapper = shallowMount(PCMonitor)
    await waitForNextTick()
    if (callbackFn) callbackFn(null, { cpu: { usage: "50" }, mem: { used: "60" }, network: { recvKbps: 100, sentKbps: 50 } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})