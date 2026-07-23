const { shallowMount } = require("@vue/test-utils")

jest.mock("./commponents/LanguageSettings.vue", () => ({ default: { name: "LanguageSettings", template: "<div class=\"language-settings\"></div>" } }))
jest.mock("./commponents/ProtocolSettings.vue", () => ({ default: { name: "ProtocolSettings", template: "<div class=\"protocol-settings\"></div>" } }))
jest.mock("./commponents/AutoUpdate.vue", () => ({ default: { name: "AutoUpdate", template: "<div class=\"auto-update\"></div>" } }))
jest.mock("./commponents/AutoStartSettings.vue", () => ({ default: { name: "AutoStartSettings", template: "<div class=\"auto-start-settings\"></div>" } }))

const CommonSetting = require("./index.vue").default

describe("CommonSetting", () => {
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(CommonSetting)
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(CommonSetting)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})