const mockTaskManager = {
  getAllTasks: jest.fn(),
  getTaskById: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTask: jest.fn()
}

const mockLog = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}

jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn()
  }
}))

jest.mock("../../constants", () => ({
  IPC_CHANNELS: {
    TASK_GET_ALL: "task-get-all",
    TASK_GET_BY_ID: "task-get-by-id",
    TASK_ADD: "task-add",
    TASK_UPDATE: "task-update",
    TASK_DELETE: "task-delete",
    TASK_TOGGLE: "task-toggle"
  }
}))

jest.mock("../task/taskManager", () => ({
  __esModule: true,
  default: mockTaskManager
}))

jest.mock("../log/logManager", () => ({
  __esModule: true,
  log: mockLog
}))

const { ipcMain } = require("electron")
const { registerTaskHandlers } = require("./ipcTaskHandlers.js")

describe("ipcTaskHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    registerTaskHandlers()
  })

  test("should register all task IPC handlers", () => {
    expect(ipcMain.handle).toHaveBeenCalledWith("task-get-all", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("task-get-by-id", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("task-add", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("task-update", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("task-delete", expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith("task-toggle", expect.any(Function))
  })

  test("TASK_GET_ALL handler should return tasks", async () => {
    const mockTasks = [{ id: "1", content: "Test task" }]
    mockTaskManager.getAllTasks.mockReturnValue(mockTasks)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-get-all")[1]
    const result = await handler()
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockTasks)
    expect(mockLog.info).toHaveBeenCalled()
  })

  test("TASK_GET_ALL handler should return error on exception", async () => {
    const mockError = new Error("DB error")
    mockTaskManager.getAllTasks.mockImplementation(() => { throw mockError })
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-get-all")[1]
    const result = await handler()
    
    expect(result.success).toBe(false)
    expect(result.error).toBe("DB error")
    expect(mockLog.error).toHaveBeenCalled()
  })

  test("TASK_GET_BY_ID handler should return task", async () => {
    const mockTask = { id: "1", content: "Test task" }
    mockTaskManager.getTaskById.mockReturnValue(mockTask)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-get-by-id")[1]
    const result = await handler(null, "1")
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockTask)
    expect(mockLog.info).toHaveBeenCalled()
  })

  test("TASK_GET_BY_ID handler should return null when task not found", async () => {
    mockTaskManager.getTaskById.mockReturnValue(null)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-get-by-id")[1]
    const result = await handler(null, "999")
    
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
    expect(mockLog.warn).toHaveBeenCalled()
  })

  test("TASK_ADD handler should add task", async () => {
    const mockTaskData = { content: "New task" }
    const mockTask = { id: "1", ...mockTaskData }
    mockTaskManager.addTask.mockReturnValue(mockTask)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-add")[1]
    const result = await handler(null, mockTaskData)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockTask)
    expect(mockTaskManager.addTask).toHaveBeenCalledWith(mockTaskData)
    expect(mockLog.info).toHaveBeenCalled()
  })

  test("TASK_UPDATE handler should update task", async () => {
    const mockTaskData = { content: "Updated task" }
    const mockTask = { id: "1", ...mockTaskData }
    mockTaskManager.updateTask.mockReturnValue(mockTask)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-update")[1]
    const result = await handler(null, "1", mockTaskData)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockTask)
    expect(mockTaskManager.updateTask).toHaveBeenCalledWith("1", mockTaskData)
    expect(mockLog.info).toHaveBeenCalled()
  })

  test("TASK_DELETE handler should delete task", async () => {
    mockTaskManager.deleteTask.mockReturnValue(true)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-delete")[1]
    const result = await handler(null, "1")
    
    expect(result.success).toBe(true)
    expect(mockTaskManager.deleteTask).toHaveBeenCalledWith("1")
    expect(mockLog.info).toHaveBeenCalled()
  })

  test("TASK_TOGGLE handler should toggle task", async () => {
    const mockTask = { id: "1", content: "Test task", enabled: true }
    mockTaskManager.toggleTask.mockReturnValue(mockTask)
    
    const handler = ipcMain.handle.mock.calls.find(call => call[0] === "task-toggle")[1]
    const result = await handler(null, "1", true)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockTask)
    expect(mockTaskManager.toggleTask).toHaveBeenCalledWith("1", true)
    expect(mockLog.info).toHaveBeenCalled()
  })
})