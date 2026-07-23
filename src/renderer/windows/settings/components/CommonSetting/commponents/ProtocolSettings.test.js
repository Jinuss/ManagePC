const { mount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))

const ProtocolSettings = require("./ProtocolSettings.vue").default

describe("ProtocolSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render protocol switch", async () => {
    global.electronAPI.getCustomProtocol.mockResolvedValue({ customProtocol: false })
    const wrapper = mount(ProtocolSettings, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getCustomProtocol.mockResolvedValue({ customProtocol: false })
    const wrapper = mount(ProtocolSettings, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})