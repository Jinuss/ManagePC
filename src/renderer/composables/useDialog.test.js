jest.mock("naive-ui", () => ({
  useDialog: jest.fn(() => ({
    warning: jest.fn(() => ({ destroy: jest.fn() })),
    info: jest.fn(() => ({ destroy: jest.fn() })),
    success: jest.fn(() => ({ destroy: jest.fn() })),
    error: jest.fn(() => ({ destroy: jest.fn() }))
  }))
}))

const { useDialog } = require("./useDialog")

describe("useDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should return dialog object", () => {
    const { dialog } = useDialog()
    expect(dialog).toBeDefined()
    expect(typeof dialog).toBe("object")
  })

  test("should return confirm function", () => {
    const { confirm } = useDialog()
    expect(typeof confirm).toBe("function")
  })

  test("should return info function", () => {
    const { info } = useDialog()
    expect(typeof info).toBe("function")
  })

  test("should return success function", () => {
    const { success } = useDialog()
    expect(typeof success).toBe("function")
  })

  test("should return warning function", () => {
    const { warning } = useDialog()
    expect(typeof warning).toBe("function")
  })

  test("should return error function", () => {
    const { error } = useDialog()
    expect(typeof error).toBe("function")
  })

  test("confirm should call dialog.warning with correct parameters", () => {
    const { confirm, dialog } = useDialog()
    const onPositive = jest.fn()
    const onNegative = jest.fn()

    confirm({
      title: "Test Title",
      content: "Test Content",
      positiveText: "OK",
      negativeText: "Cancel",
      onPositive,
      onNegative
    })

    expect(dialog.warning).toHaveBeenCalled()
    const callArgs = dialog.warning.mock.calls[0][0]
    expect(callArgs.title).toBe("Test Title")
    expect(callArgs.content).toBe("Test Content")
    expect(callArgs.positiveText).toBe("OK")
    expect(callArgs.negativeText).toBe("Cancel")
    expect(typeof callArgs.onPositiveClick).toBe("function")
    expect(typeof callArgs.onNegativeClick).toBe("function")
  })

  test("confirm should return dialog instance", () => {
    const { confirm } = useDialog()
    const result = confirm({ title: "Test" })
    expect(result).toBeDefined()
    expect(typeof result.destroy).toBe("function")
  })

  test("info should call dialog.info with correct parameters", () => {
    const { info, dialog } = useDialog()

    info({
      title: "Info Title",
      content: "Info Content",
      positiveText: "OK"
    })

    expect(dialog.info).toHaveBeenCalled()
    const callArgs = dialog.info.mock.calls[0][0]
    expect(callArgs.title).toBe("Info Title")
    expect(callArgs.content).toBe("Info Content")
    expect(callArgs.positiveText).toBe("OK")
  })

  test("success should call dialog.success with correct parameters", () => {
    const { success, dialog } = useDialog()

    success({
      title: "Success Title",
      content: "Success Content"
    })

    expect(dialog.success).toHaveBeenCalled()
  })

  test("warning should call dialog.warning with correct parameters", () => {
    const { warning, dialog } = useDialog()

    warning({
      title: "Warning Title",
      content: "Warning Content"
    })

    expect(dialog.warning).toHaveBeenCalled()
  })

  test("error should call dialog.error with correct parameters", () => {
    const { error, dialog } = useDialog()

    error({
      title: "Error Title",
      content: "Error Content"
    })

    expect(dialog.error).toHaveBeenCalled()
  })

  test("onPositiveClick should call onPositive callback", () => {
    const { confirm, dialog } = useDialog()
    const onPositive = jest.fn()

    confirm({
      title: "Test",
      onPositive
    })

    const callArgs = dialog.warning.mock.calls[0][0]
    callArgs.onPositiveClick()

    expect(onPositive).toHaveBeenCalled()
  })

  test("onNegativeClick should call onNegative callback", () => {
    const { confirm, dialog } = useDialog()
    const onNegative = jest.fn()

    confirm({
      title: "Test",
      onNegative
    })

    const callArgs = dialog.warning.mock.calls[0][0]
    callArgs.onNegativeClick()

    expect(onNegative).toHaveBeenCalled()
  })
})
