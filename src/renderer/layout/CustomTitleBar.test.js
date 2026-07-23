const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "header.title": "System Monitor",
      "common.pin": "Pin",
      "common.unpin": "Unpin",
      "common.minimize": "Minimize",
      "common.maximize": "Maximize",
      "common.restore": "Restore",
      "common.close": "Close"
    }[key] || key)
  })
}))

const CustomTitleBar = require("./CustomTitleBar.vue").default

describe("CustomTitleBar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.electronAPI.minimizeWindow = jest.fn()
    global.electronAPI.maximizeWindow = jest.fn()
    global.electronAPI.closeWindow = jest.fn()
    global.electronAPI.setAlwaysOnTop = jest.fn().mockResolvedValue()
    global.electronAPI.isWindowMaximized = jest.fn().mockResolvedValue({ maximized: false })
    global.electronAPI.getAlwaysOnTop = jest.fn().mockResolvedValue({ alwaysOnTop: false })
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should mount successfully", async () => {
    const wrapper = shallowMount(CustomTitleBar)
    await waitForNextTick()

    expect(wrapper.exists()).toBe(true)
  })

  test("should render app icon and title", async () => {
    const wrapper = shallowMount(CustomTitleBar)
    await waitForNextTick()

    expect(wrapper.find(".app-icon").exists()).toBe(true)
    expect(wrapper.find(".app-title").exists()).toBe(true)
    expect(wrapper.find(".app-title").text()).toBe("System Monitor")
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(CustomTitleBar)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})