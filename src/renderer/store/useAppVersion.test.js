const { createPinia, setActivePinia } = require("pinia")
const { useAppVersionStore } = require("./useAppVersion")

describe("useAppVersionStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test("should have default state", () => {
    const store = useAppVersionStore()
    expect(store.hasUpdate).toBe(false)
  })

  test("should update hasUpdate state", () => {
    const store = useAppVersionStore()
    expect(store.hasUpdate).toBe(false)

    store.setHasUpdate(true)
    expect(store.hasUpdate).toBe(true)

    store.setHasUpdate(false)
    expect(store.hasUpdate).toBe(false)
  })

  test("setHasUpdate should accept boolean values", () => {
    const store = useAppVersionStore()

    store.setHasUpdate(true)
    expect(store.hasUpdate).toBe(true)

    store.setHasUpdate(false)
    expect(store.hasUpdate).toBe(false)
  })
})
