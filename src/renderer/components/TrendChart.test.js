const { mount } = require("@vue/test-utils")
const TrendChart = require("./TrendChart.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "network.unit": "KB/s",
      "cpu.unit": "%",
      "network.received": "接收",
      "network.sent": "发送"
    }[key] || key)
  })
}))

jest.mock("vue-echarts", () => ({
  default: { template: "<div class=\"v-chart\"></div>" }
}))

jest.mock("echarts/core", () => ({
  use: jest.fn()
}))

jest.mock("echarts/renderers", () => ({
  CanvasRenderer: {}
}))

jest.mock("echarts/charts", () => ({
  LineChart: {}
}))

jest.mock("echarts/components", () => ({
  TitleComponent: {},
  TooltipComponent: {},
  GridComponent: {},
  LegendComponent: {}
}))

describe("TrendChart", () => {
  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render chart with single series", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "CPU",
        icon: "🖥️",
        data: [25, 30, 45, 35, 50]
      }
    })
    await waitForNextTick()

    expect(wrapper.find(".trend-chart").exists()).toBe(true)
    expect(wrapper.find(".chart-title").text()).toBe("CPU")
    expect(wrapper.find(".chart-icon").text()).toBe("🖥️")
    expect(wrapper.find(".chart-value").text()).toBe("50.0%")
  })

  test("should render chart with multiple series", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "网络",
        icon: "🌐",
        data: [
          { recv: 100, sent: 50 },
          { recv: 150, sent: 75 },
          { recv: 200, sent: 100 }
        ],
        hasMultipleSeries: true,
        colors: ["#28a745", "#17a2b8"]
      }
    })
    await waitForNextTick()

    expect(wrapper.find(".trend-chart").exists()).toBe(true)
    expect(wrapper.find(".chart-values").exists()).toBe(true)
    
    const valueItems = wrapper.findAll(".value-item")
    expect(valueItems.length).toBe(2)
    expect(valueItems[0].find(".value-num").text()).toBe("200.0 KB/s")
    expect(valueItems[1].find(".value-num").text()).toBe("100.0 KB/s")
  })

  test("should show 0.0 when data is empty", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "CPU",
        data: []
      }
    })
    await waitForNextTick()

    expect(wrapper.find(".chart-value").text()).toBe("0.0%")
  })

  test("should show 0.0 for multiple series when data is empty", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "网络",
        data: [],
        hasMultipleSeries: true
      }
    })
    await waitForNextTick()

    const valueItems = wrapper.findAll(".value-item")
    expect(valueItems[0].find(".value-num").text()).toBe("0.0 KB/s")
    expect(valueItems[1].find(".value-num").text()).toBe("0.0 KB/s")
  })

  test("should use custom series names", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "网络",
        data: [{ recv: 100, sent: 50 }],
        hasMultipleSeries: true,
        seriesNames: ["下载", "上传"]
      }
    })
    await waitForNextTick()

    const valueLabels = wrapper.findAll(".value-label")
    expect(valueLabels[0].text()).toBe("下载")
    expect(valueLabels[1].text()).toBe("上传")
  })

  test("should use default series names when not provided", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "网络",
        data: [{ recv: 100, sent: 50 }],
        hasMultipleSeries: true
      }
    })
    await waitForNextTick()

    const valueLabels = wrapper.findAll(".value-label")
    expect(valueLabels[0].text()).toBe("接收")
    expect(valueLabels[1].text()).toBe("发送")
  })

  test("should match snapshot with single series", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "CPU",
        icon: "🖥️",
        data: [25, 30, 45, 35, 50]
      }
    })
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  test("should match snapshot with multiple series", async () => {
    const wrapper = mount(TrendChart, {
      props: {
        title: "网络",
        icon: "🌐",
        data: [
          { recv: 100, sent: 50 },
          { recv: 150, sent: 75 }
        ],
        hasMultipleSeries: true,
        colors: ["#28a745", "#17a2b8"]
      }
    })
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
