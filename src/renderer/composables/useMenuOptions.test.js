jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "menu.system": "System",
      "menu.network": "Network",
      "menu.disk": "Disk",
      "menu.battery": "Battery",
      "menu.monitor": "Monitor",
      "menu.screen": "Screen",
      "menu.audio": "Audio"
    }[key] || key)
  })
}))

const { useMenuOptions } = require("./useMenuOptions")

describe("useMenuOptions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should return activeTab ref", () => {
    const { activeTab } = useMenuOptions()
    expect(activeTab).toBeDefined()
    expect(activeTab.value).toBe("system")
  })

  test("should return menuOptions computed", () => {
    const { menuOptions } = useMenuOptions()
    expect(menuOptions).toBeDefined()
    expect(Array.isArray(menuOptions.value)).toBe(true)
    expect(menuOptions.value.length).toBe(7)
  })

  test("menuOptions should have correct keys", () => {
    const { menuOptions } = useMenuOptions()
    const keys = menuOptions.value.map(item => item.key)
    expect(keys).toEqual(["system", "network", "disk", "battery", "monitor", "screen", "audio"])
  })

  test("menuOptions should have correct labels", () => {
    const { menuOptions } = useMenuOptions()
    const labels = menuOptions.value.map(item => item.label)
    expect(labels).toEqual(["System", "Network", "Disk", "Battery", "Monitor", "Screen", "Audio"])
  })

  test("menuOptions should have icon functions", () => {
    const { menuOptions } = useMenuOptions()
    menuOptions.value.forEach(item => {
      expect(typeof item.icon).toBe("function")
    })
  })

  test("handleMenuSelect should update activeTab", () => {
    const { activeTab, handleMenuSelect } = useMenuOptions()
    expect(activeTab.value).toBe("system")

    handleMenuSelect("network")
    expect(activeTab.value).toBe("network")

    handleMenuSelect("disk")
    expect(activeTab.value).toBe("disk")
  })

  test("activeTab should be reactive", () => {
    const { activeTab } = useMenuOptions()
    activeTab.value = "monitor"
    expect(activeTab.value).toBe("monitor")
  })
})
