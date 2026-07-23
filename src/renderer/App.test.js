const { shallowMount } = require("@vue/test-utils")

jest.mock("./composables/useTheme", () => ({ useTheme: () => ({ theme: { value: "system" } }) }))
jest.mock("./constants", () => ({ THEME_IDS: { LIGHT: "light", DARK: "dark", SYSTEM: "system" } }))
jest.mock("vue-i18n", () => ({ useI18n: () => ({ locale: { value: "zh" } }) }))
jest.mock("./layout/index.vue", () => ({ default: { name: "Layout", template: "<div class=\"layout\"></div>" } }))

const App = require("./App.vue").default

describe("App", () => {
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(App, {
      global: { stubs: { NConfigProvider: { template: "<div class=\"n-config-provider\"><slot /></div>" }, Layout: { template: "<div class=\"layout\"></div>" } } }
    })
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(App, {
      global: { stubs: { NConfigProvider: { template: "<div class=\"n-config-provider\"><slot /></div>" }, Layout: { template: "<div class=\"layout\"></div>" } } }
    })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})