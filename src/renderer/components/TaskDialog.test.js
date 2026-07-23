const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("naive-ui", () => ({
  useMessage: () => ({ warning: jest.fn() }),
  NModal: { template: "<div class=\"n-modal\"><slot /></div>" },
  NForm: { template: "<div class=\"n-form\"><slot /></div>" },
  NInput: { template: "<div class=\"n-input\"></div>" },
  NButton: { template: "<div class=\"n-button\"><slot /></div>" }
}))

const TaskDialog = require("./TaskDialog.vue").default

describe("TaskDialog", () => {
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount successfully", async () => {
    const wrapper = shallowMount(TaskDialog, { props: { visible: true, editData: null }, global: { stubs: { NModal: { template: "<div class=\"n-modal\"><slot /></div>" }, NForm: { template: "<div class=\"n-form\"><slot /></div>" } } } })
    await waitForNextTick()
    expect(wrapper.exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(TaskDialog, { props: { visible: true, editData: null }, global: { stubs: { NModal: { template: "<div class=\"n-modal\"><slot /></div>" }, NForm: { template: "<div class=\"n-form\"><slot /></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})