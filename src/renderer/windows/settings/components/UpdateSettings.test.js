const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("naive-ui", () => ({ useMessage: () => ({ info: jest.fn(), success: jest.fn(), error: jest.fn() }), NButton: { template: "<div class=\"n-button\"><slot /></div>" }, NBadge: { template: "<div class=\"n-badge\"><slot /></div>" } }))
jest.mock("@/composables/usePlatform", () => ({ usePlatform: () => ({ isMac: false }) }))
jest.mock("@/store/useAppVersion", () => ({ useAppVersionStore: () => ({ hasUpdate: false, setHasUpdate: jest.fn(), currentVersion: "1.0.0", latestVersion: "1.0.0" }) }))
jest.mock("@/composables/useDialog", () => ({ useDialog: () => ({ confirm: jest.fn() }) }))

const UpdateSettings = require("./UpdateSettings.vue").default

describe("UpdateSettings", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(UpdateSettings)
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(UpdateSettings)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})