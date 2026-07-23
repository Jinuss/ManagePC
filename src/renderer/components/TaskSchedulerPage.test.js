const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock("naive-ui", () => ({ useMessage: () => ({ error: jest.fn(), success: jest.fn() }), useDialog: () => ({ warning: jest.fn(() => Promise.resolve({ action: "confirm" })) }) }))
jest.mock("./TaskTable.vue", () => ({ default: { name: "TaskTable", template: "<div class=\"task-table\"></div>", props: ["tasks"] } }))
jest.mock("./TaskDialog.vue", () => ({ default: { name: "TaskDialog", template: "<div class=\"task-dialog\"></div>", props: ["visible", "editData"] } }))

const TaskSchedulerPage = require("./TaskSchedulerPage.vue").default

describe("TaskSchedulerPage", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should mount and render page structure", async () => {
    global.electronAPI.getAll.mockResolvedValue({ tasks: [] })
    const wrapper = shallowMount(TaskSchedulerPage, { global: { stubs: { NButton: { template: "<div class=\"n-button\"><slot /></div>" }, TaskTable: { template: "<div class=\"task-table\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".task-scheduler-page").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getAll.mockResolvedValue({ tasks: [] })
    const wrapper = shallowMount(TaskSchedulerPage, { global: { stubs: { NButton: { template: "<div class=\"n-button\"><slot /></div>" }, TaskTable: { template: "<div class=\"task-table\"></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})