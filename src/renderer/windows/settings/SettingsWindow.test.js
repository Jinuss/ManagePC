const { shallowMount } = require("@vue/test-utils")

jest.mock("./config.js", () => ({ componentMap: { common: { name: "CommonSetting", template: "<div class=\"common-setting\"></div>" } } }))
jest.mock("../../composables/useTheme", () => ({ useTheme: () => ({ theme: { value: "system" } }) }))
jest.mock("../../composables/usePlatform", () => ({ usePlatform: () => ({ isMac: false }) }))
jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key, locale: { value: "zh" } }) }))
jest.mock("@/store/useAppVersion", () => ({ useAppVersionStore: () => ({ setHasUpdate: jest.fn() }) }))

const SettingsWindow = require("./SettingsWindow.vue").default

describe("SettingsWindow", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(SettingsWindow)
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(SettingsWindow)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})