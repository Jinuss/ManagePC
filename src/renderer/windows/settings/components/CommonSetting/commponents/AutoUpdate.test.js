const { mount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))

const AutoUpdate = require("./AutoUpdate.vue").default

describe("AutoUpdate", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render auto update switch", async () => {
    global.electronAPI.getAutoUpdate.mockResolvedValue({ autoUpdate: false })
    const wrapper = mount(AutoUpdate, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getAutoUpdate.mockResolvedValue({ autoUpdate: false })
    const wrapper = mount(AutoUpdate, { global: { stubs: { NSwitch: { template: "<div class=\"n-switch\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})