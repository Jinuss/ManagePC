const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("@/composables/useTheme", () => ({ useTheme: () => ({ theme: { value: "system" } }) }))
jest.mock("@/constants", () => ({ THEME_IDS: { LIGHT: "light", DARK: "dark", SYSTEM: "system" }, THEME_ICONS: { LIGHT: "☀️", DARK: "🌙", SYSTEM: "🖥️" } }))

const ThemeSettings = require("./ThemeSettings.vue").default

describe("ThemeSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render theme options", async () => {
    const wrapper = shallowMount(ThemeSettings)
    await waitForNextTick()
    expect(wrapper.find(".theme-options").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(ThemeSettings)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})