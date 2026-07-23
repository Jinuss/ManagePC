const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))

const ShortcutSettings = require("./ShortcutSettings.vue").default

describe("ShortcutSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render shortcut input", async () => {
    global.electronAPI.getShortcut.mockResolvedValue({ shortcut: "Ctrl+Shift+A" })
    const wrapper = shallowMount(ShortcutSettings)
    await waitForNextTick()
    expect(wrapper.find(".settings-section").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getShortcut.mockResolvedValue({ shortcut: "Ctrl+Shift+A" })
    const wrapper = shallowMount(ShortcutSettings)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})