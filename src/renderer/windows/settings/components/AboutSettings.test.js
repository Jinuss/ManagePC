const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("./UpdateSettings.vue", () => ({ default: { name: "UpdateSettings", template: "<div class=\"update-settings\"></div>" } }))

const AboutSettings = require("./AboutSettings.vue").default

describe("AboutSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render version info", async () => {
    global.electronAPI.getAppVersion.mockResolvedValue("1.0.50")
    const wrapper = shallowMount(AboutSettings)
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getAppVersion.mockResolvedValue("1.0.50")
    const wrapper = shallowMount(AboutSettings)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})