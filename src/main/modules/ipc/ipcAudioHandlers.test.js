jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    GET_SPEAKER_VOLUME: "get-speaker-volume",
    SET_SPEAKER_VOLUME: "set-speaker-volume",
    GET_MICROPHONE_VOLUME: "get-microphone-volume",
    SET_MICROPHONE_VOLUME: "set-microphone-volume",
    START_VOLUME_LISTEN: "start-volume-listen",
    STOP_VOLUME_LISTEN: "stop-volume-listen",
    VOLUME_CHANGED: "volume-changed"
  }
}))

jest.mock("../audio/audioManager", () => ({
  audioManager: {
    getSpeakerVolume: jest.fn().mockReturnValue({ success: true, data: { volume: 50, isMuted: false } }),
    setSpeakerVolume: jest.fn().mockReturnValue({ success: true }),
    getMicrophoneVolume: jest.fn().mockReturnValue({ success: true, data: { volume: 70, isMuted: false } }),
    setMicrophoneVolume: jest.fn().mockReturnValue({ success: true }),
    startVolumeListen: jest.fn().mockReturnValue({ success: true }),
    stopVolumeListen: jest.fn().mockReturnValue({ success: true }),
    on: jest.fn(),
    off: jest.fn()
  }
}))

jest.mock("../log/logManager", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe("ipcAudioHandlers", () => {
  let registerIpcAudioHandlers
  let ipcMain

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ipcMain = require("electron").ipcMain
    registerIpcAudioHandlers = require("./ipcAudioHandlers.js").registerIpcAudioHandlers
  })

  test("should register all audio IPC handlers", () => {
    registerIpcAudioHandlers()

    expect(ipcMain.handle).toHaveBeenCalledWith("get-speaker-volume", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-speaker-volume", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("get-microphone-volume", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("set-microphone-volume", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("start-volume-listen", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("stop-volume-listen", expect.any(Function))
  })

  test("should handle get-speaker-volume request", async () => {
    registerIpcAudioHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-speaker-volume")[1]
    const result = await handler()

    expect(result).toEqual({ success: true, data: { volume: 50, isMuted: false } })
  })

  test("should handle set-speaker-volume request", async () => {
    registerIpcAudioHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-speaker-volume")[1]
    const result = await handler(null, 75)

    expect(result).toEqual({ success: true })
  })

  test("should handle get-microphone-volume request", async () => {
    registerIpcAudioHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "get-microphone-volume")[1]
    const result = await handler()

    expect(result).toEqual({ success: true, data: { volume: 70, isMuted: false } })
  })

  test("should handle set-microphone-volume request", async () => {
    registerIpcAudioHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "set-microphone-volume")[1]
    const result = await handler(null, 60)

    expect(result).toEqual({ success: true })
  })

  test("should handle start-volume-listen request", async () => {
    const mockWindowManager = {
      getMainWindow: jest.fn().mockReturnValue({ isDestroyed: jest.fn().mockReturnValue(false), webContents: { send: jest.fn() } })
    }
    registerIpcAudioHandlers({ windowManager: mockWindowManager })

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "start-volume-listen")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })

  test("should handle stop-volume-listen request", async () => {
    registerIpcAudioHandlers()

    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "stop-volume-listen")[1]
    const result = await handler()

    expect(result).toEqual({ success: true })
  })
})
