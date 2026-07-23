const { shallowMount } = require("@vue/test-utils")

jest.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key) => key }) }))

const TaskTable = require("./TaskTable.vue").default

describe("TaskTable", () => {
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should render empty state when no tasks", async () => {
    const wrapper = shallowMount(TaskTable, { props: { tasks: [] }, global: { stubs: { NDataTable: { template: "<div class=\"n-data-table\"><slot /></div>" } } } })
    await waitForNextTick()
    expect(wrapper.find(".empty-state").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    const wrapper = shallowMount(TaskTable, { props: { tasks: [] }, global: { stubs: { NDataTable: { template: "<div class=\"n-data-table\"><slot /></div>" } } } })
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})