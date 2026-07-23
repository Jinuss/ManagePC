jest.mock("../../utils/nativeModuleLoader", () => ({
  loadNativeModule: jest.fn().mockReturnValue({
    success: true,
    module: {
      getSpeakerVolume: jest.fn().mockReturnValue({ success: true, volume: 50, isMuted: false }),
      setSpeakerVolume: jest.fn().mockReturnValue(true),
      getMicrophoneVolume: jest.fn().mockReturnValue({ success: true, volume: 70, isMuted: false }),
      setMicrophoneVolume: jest.fn().mockReturnValue(true),
      startVolumeNotification: jest.fn().mockReturnValue(true),
      stopVolumeNotification: jest.fn().mockReturnValue(true)
    }
  })
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe("AudioManager", () => {
  let AudioManager

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    AudioManager = require("./audioManager.js").default
  })

  test("should initialize with native module available", () => {
    const audioManager = new AudioManager()
    expect(audioManager.isNativeAvailable()).toBe(true)
    expect(audioManager.getLoadError()).toBeUndefined()
  })

  test("should get speaker volume", () => {
    const audioManager = new AudioManager()
    const result = audioManager.getSpeakerVolume()
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ volume: 50, isMuted: false })
  })

  test("should set speaker volume with valid value", () => {
    const audioManager = new AudioManager()
    const result = audioManager.setSpeakerVolume(75)
    expect(result.success).toBe(true)
  })

  test("should reject invalid speaker volume", () => {
    const audioManager = new AudioManager()
    expect(audioManager.setSpeakerVolume("not-a-number").success).toBe(false)
    expect(audioManager.setSpeakerVolume(-1).success).toBe(false)
    expect(audioManager.setSpeakerVolume(101).success).toBe(false)
  })

  test("should get microphone volume", () => {
    const audioManager = new AudioManager()
    const result = audioManager.getMicrophoneVolume()
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ volume: 70, isMuted: false })
  })

  test("should set microphone volume with valid value", () => {
    const audioManager = new AudioManager()
    const result = audioManager.setMicrophoneVolume(60)
    expect(result.success).toBe(true)
  })

  test("should reject invalid microphone volume", () => {
    const audioManager = new AudioManager()
    expect(audioManager.setMicrophoneVolume("invalid").success).toBe(false)
    expect(audioManager.setMicrophoneVolume(-5).success).toBe(false)
    expect(audioManager.setMicrophoneVolume(150).success).toBe(false)
  })

  test("should start volume listen", () => {
    const audioManager = new AudioManager()
    const result = audioManager.startVolumeListen()
    expect(result.success).toBe(true)
    expect(audioManager.isListening).toBe(true)
  })

  test("should not start volume listen if already listening", () => {
    const audioManager = new AudioManager()
    audioManager.isListening = true
    const result = audioManager.startVolumeListen()
    expect(result.success).toBe(true)
  })

  test("should stop volume listen", () => {
    const audioManager = new AudioManager()
    audioManager.isListening = true
    const result = audioManager.stopVolumeListen()
    expect(result.success).toBe(true)
    expect(audioManager.isListening).toBe(false)
  })

  test("should not stop volume listen if not listening", () => {
    const audioManager = new AudioManager()
    audioManager.isListening = false
    const result = audioManager.stopVolumeListen()
    expect(result.success).toBe(true)
  })

  test("should emit volume-changed event", () => {
    const audioManager = new AudioManager()
    const mockCallback = jest.fn()
    audioManager.on("volume-changed", mockCallback)
    audioManager.emit("volume-changed", { volume: 80, isMuted: false })
    expect(mockCallback).toHaveBeenCalledWith({ volume: 80, isMuted: false })
  })

  test("should handle native module not available", () => {
    jest.resetModules()
    jest.mock("../../utils/nativeModuleLoader", () => ({
      loadNativeModule: jest.fn().mockReturnValue({
        success: false,
        error: new Error("Native module not loaded")
      })
    }))
    AudioManager = require("./audioManager.js").default
    const audioManager = new AudioManager()

    expect(audioManager.isNativeAvailable()).toBe(false)
    expect(audioManager.getSpeakerVolume().success).toBe(false)
    expect(audioManager.setSpeakerVolume(50).success).toBe(false)
  })
})
