const { mount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key, locale: { value: "zh" } }) }))
jest.mock("../../../../../constants", () => ({ LANGUAGES: [{ label: "Chinese", value: "zh" }, { label: "English", value: "en" }] }))

const LanguageSettings = require("./LanguageSettings.vue").default

describe("LanguageSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render language selector", async () => {
    global.electronAPI.getSavedLanguage.mockResolvedValue({ language: "zh" })
    const wrapper = mount(LanguageSettings, { global: { stubs: { NSelect: { template: "<div class=\"n-select\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getSavedLanguage.mockResolvedValue({ language: "zh" })
    const wrapper = mount(LanguageSettings, { global: { stubs: { NSelect: { template: "<div class=\"n-select\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})