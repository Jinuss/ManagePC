const { mount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))

const AutoStartSettings = require("./AutoStartSettings.vue").default

describe("AutoStartSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render auto start switch", async () => {
    global.electronAPI.getAutoStart.mockResolvedValue({ autoStart: false })
    const wrapper = mount(AutoStartSettings, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getAutoStart.mockResolvedValue({ autoStart: false })
    const wrapper = mount(AutoStartSettings, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})