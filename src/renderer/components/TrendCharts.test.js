const { shallowMount } = require("@vue/test-utils")

jest.mock("./TrendCharts.vue", () => ({
  default: {
    name: "TrendCharts",
    template: "<div class=\"trend-charts\"><div class=\"trend-chart\"></div><div class=\"trend-chart\"></div><div class=\"trend-chart\"></div></div>",
    props: ["cpuHistory", "memoryHistory", "networkHistory"]
  }
}))

jest.mock("./TrendChart.vue", () => ({
  default: {
    name: "TrendChart",
    template: "<div class=\"trend-chart\"></div>",
    props: ["title", "icon", "data", "color", "colors", "hasMultipleSeries", "seriesNames"]
  }
}))

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "cpu.title": "CPU",
      "memory.title": "内存",
      "network.title": "网络",
      "network.received": "接收",
      "network.sent": "发送"
    }[key] || key)
  })
}))

const TrendCharts = require("./TrendCharts.vue").default

describe("TrendCharts", () => {
  test("should render component with all props", async () => {
    const wrapper = shallowMount(TrendCharts, {
      props: {
        cpuHistory: [25, 30, 45],
        memoryHistory: [50, 55, 60],
        networkHistory: [{ recv: 100, sent: 50 }]
      }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.find(".trend-charts").exists()).toBe(true)
    const charts = wrapper.findAll(".trend-chart")
    expect(charts.length).toBe(3)
  })

  test("should work with empty data arrays", async () => {
    const wrapper = shallowMount(TrendCharts, {
      props: {
        cpuHistory: [],
        memoryHistory: [],
        networkHistory: []
      }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const charts = wrapper.findAll(".trend-chart")
    expect(charts.length).toBe(3)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(TrendCharts, {
      props: {
        cpuHistory: [25, 30, 45],
        memoryHistory: [50, 55, 60],
        networkHistory: [{ recv: 100, sent: 50 }]
      }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.html()).toMatchSnapshot()
  })
})
