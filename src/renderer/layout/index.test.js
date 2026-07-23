const { shallowMount } = require("@vue/test-utils")

jest.mock("@/composables/usePlatform", () => ({ usePlatform: () => ({ isMac: false }) }))
jest.mock("@/composables/useMenuOptions", () => ({ useMenuOptions: () => ({ activeTab: { value: "system" }, menuOptions: [], handleMenuSelect: jest.fn() }) }))
jest.mock("@/composables/useAppUpdate", () => ({ useAppUpdate: jest.fn() }))
jest.mock("@/config.js", () => ({ componentMap: { system: { name: "PCMonitor", template: "<div class=\"pc-monitor\"></div>" } } }))
jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("./CustomTitleBar.vue", () => ({ default: { name: "CustomTitleBar", template: "<div class=\"custom-titlebar\"></div>" } }))

const Layout = require("./index.vue").default

describe("Layout", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(Layout, {
      global: { stubs: { CustomTitleBar: { template: "<div class=\"custom-titlebar\"></div>" }, PCMonitor: { template: "<div class=\"pc-monitor\"></div>" } } }
    })
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(Layout, {
      global: { stubs: { CustomTitleBar: { template: "<div class=\"custom-titlebar\"></div>" }, PCMonitor: { template: "<div class=\"pc-monitor\"></div>" } } }
    })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})