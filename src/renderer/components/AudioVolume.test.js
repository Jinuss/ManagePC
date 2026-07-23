const { mount } = require("@vue/test-utils")
const AudioVolume = require("./AudioVolume.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "audio.speakerVolume": "扬声器音量", "audio.microphoneVolume": "麦克风音量",
      "audio.mute": "静音", "audio.unmute": "取消静音", "audio.muted": "已静音"
    }[key] || key)
  })
}))

jest.mock("naive-ui", () => ({
  NButton: { template: "<button><slot /></button>" },
  NSlider: { template: "<input type='range' />" }
}))

describe("AudioVolume", () => {
  beforeEach(() => jest.clearAllMocks())
  const waitForNextTick = async () => await new Promise(resolve => setTimeout(resolve, 0))

  test("should render speaker volume when loaded", async () => {
    global.electronAPI.getSpeakerVolume.mockResolvedValue({ success: true, data: { volume: 75, isMuted: false } })
    global.electronAPI.getMicrophoneVolume.mockResolvedValue({ success: true, data: { volume: 50, isMuted: false } })
    const wrapper = mount(AudioVolume)
    await waitForNextTick()
    expect(wrapper.find(".volume-card").exists()).toBe(true)
  })

  test("should match snapshot", async () => {
    global.electronAPI.getSpeakerVolume.mockResolvedValue({ success: true, data: { volume: 75, isMuted: false } })
    global.electronAPI.getMicrophoneVolume.mockResolvedValue({ success: true, data: { volume: 50, isMuted: false } })
    const wrapper = mount(AudioVolume)
    await waitForNextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})