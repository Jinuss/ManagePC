const { shallowMount } = require("@vue/test-utils")

const mockT = (key) => ({
  "settings.updateAvailable": "Update Available",
  "settings.noReleaseNotes": "No release notes",
  "settings.downloadNow": "Download Now",
  "settings.remindLater": "Remind Later",
  "settings.downloadComplete": "Download Complete",
  "settings.exitAndInstall": "Exit and install?",
  "settings.exitInstall": "Exit and Install",
  "settings.installLater": "Install Later",
  "settings.downloadingTitle": "Downloading",
  "settings.downloadingDescription": "Please wait..."
}[key] || key)

const mockConfirm = jest.fn()
const mockNotificationCreate = jest.fn(() => ({ destroy: jest.fn() }))

jest.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mockT })
}))

jest.mock("@/composables/usePlatform", () => ({
  usePlatform: () => ({ isMac: false })
}))

jest.mock("@/composables/useDialog", () => ({
  useDialog: () => ({ confirm: mockConfirm })
}))

jest.mock("naive-ui", () => ({
  useNotification: jest.fn(() => ({
    create: mockNotificationCreate
  })),
  NProgress: {
    template: "<div></div>",
    props: { value: { type: [String, Number], default: 0 } }
  }
}))

describe("useAppUpdate", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.electronAPI = global.electronAPI || {}
    global.electronAPI.onUpdateAvailable = jest.fn().mockReturnValue(jest.fn())
    global.electronAPI.onDownloadProgress = jest.fn()
    global.electronAPI.onUpdateDownloaded = jest.fn()
    global.electronAPI.downloadUpdate = jest.fn()
    global.electronAPI.installUpdate = jest.fn()
  })

  test("should return update handler functions", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const result = require("./useAppUpdate").useAppUpdate()
        return { result }
      }
    }

    const wrapper = shallowMount(TestComponent)

    const { result } = wrapper.vm
    expect(result).toBeDefined()
    expect(typeof result.handleUpdateAvailable).toBe("function")
    expect(typeof result.handleDownloadComplete).toBe("function")
    expect(typeof result.handleDownloadProgress).toBe("function")
    expect(typeof result.setupUpdateListener).toBe("function")
    expect(typeof result.cleanupUpdateListener).toBe("function")
  })

  test("handleUpdateAvailable should call confirm dialog", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { handleUpdateAvailable } = require("./useAppUpdate").useAppUpdate()
        return { handleUpdateAvailable }
      }
    }

    const wrapper = shallowMount(TestComponent)
    const updateInfo = { version: "1.0.1", releaseNotes: "<p>New features</p>" }

    wrapper.vm.handleUpdateAvailable(updateInfo)

    expect(mockConfirm).toHaveBeenCalled()
  })

  test("setupUpdateListener should set up update available listener on non-Mac", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { setupUpdateListener } = require("./useAppUpdate").useAppUpdate()
        return { setupUpdateListener }
      }
    }

    const wrapper = shallowMount(TestComponent)
    wrapper.vm.setupUpdateListener()

    expect(global.electronAPI.onUpdateAvailable).toHaveBeenCalled()
  })

  test("cleanupUpdateListener should remove listener", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { setupUpdateListener, cleanupUpdateListener } = require("./useAppUpdate").useAppUpdate()
        return { setupUpdateListener, cleanupUpdateListener }
      }
    }

    const removeListener = jest.fn()
    global.electronAPI.onUpdateAvailable.mockReturnValue(removeListener)

    const wrapper = shallowMount(TestComponent)
    wrapper.vm.setupUpdateListener()
    wrapper.vm.cleanupUpdateListener()

    expect(removeListener).toHaveBeenCalled()
  })

  test("cleanupUpdateListener should handle null listener", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { cleanupUpdateListener } = require("./useAppUpdate").useAppUpdate()
        return { cleanupUpdateListener }
      }
    }

    const wrapper = shallowMount(TestComponent)
    
    expect(() => {
      wrapper.vm.cleanupUpdateListener()
    }).not.toThrow()
  })

  test("handleDownloadComplete should call confirm dialog", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { handleDownloadComplete } = require("./useAppUpdate").useAppUpdate()
        return { handleDownloadComplete }
      }
    }

    const wrapper = shallowMount(TestComponent)
    wrapper.vm.handleDownloadComplete()

    expect(mockConfirm).toHaveBeenCalled()
  })

  test("handleDownloadProgress should create notification", () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        const { handleDownloadProgress } = require("./useAppUpdate").useAppUpdate()
        return { handleDownloadProgress }
      }
    }

    const wrapper = shallowMount(TestComponent)
    wrapper.vm.handleDownloadProgress()

    expect(mockNotificationCreate).toHaveBeenCalled()
    expect(global.electronAPI.downloadUpdate).toHaveBeenCalled()
  })
})
