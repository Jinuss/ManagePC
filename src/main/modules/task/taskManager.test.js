jest.mock("node-schedule", () => ({
  scheduleJob: jest.fn().mockReturnValue({
    cancel: jest.fn()
  }),
  RecurrenceRule: jest.fn().mockReturnValue({}),
  Range: jest.fn().mockReturnValue({})
}))

jest.mock("electron", () => ({
  Notification: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    show: jest.fn()
  }))
}))

jest.mock("../../database/task.db", () => ({
  getAll: jest.fn().mockReturnValue([]),
  create: jest.fn().mockImplementation((data) => ({ ...data, id: "1" })),
  update: jest.fn().mockImplementation((id, data) => ({ id, ...data })),
  delete: jest.fn().mockReturnValue(true),
  toggle: jest.fn().mockImplementation((id, enabled) => ({ id, enabled })),
  getById: jest.fn().mockReturnValue({ id: "1", content: "Test" }),
  close: jest.fn()
}))

jest.mock("../log/logManager", () => ({
  __esModule: true,
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

describe("TaskManager", () => {
  let taskManager
  let originalNotification

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    originalNotification = require("electron").Notification
    require("electron").Notification.isSupported = jest.fn().mockReturnValue(true)
    taskManager = require("./taskManager.js").default
  })

  afterEach(() => {
    require("electron").Notification.isSupported = originalNotification.isSupported
  })

  test("should initialize with no tasks", async () => {
    await taskManager.init()
    expect(taskManager.scheduledJobs.size).toBe(0)
  })

  test("should add task", () => {
    const taskData = { content: "Test task", schedule_type: "cron", cron_expression: "* * * * *", enabled: true }
    const task = taskManager.addTask(taskData)
    expect(task.id).toBe("1")
    expect(task.content).toBe("Test task")
  })

  test("should update task", () => {
    const task = taskManager.updateTask("1", { content: "Updated task" })
    expect(task.id).toBe("1")
    expect(task.content).toBe("Updated task")
  })

  test("should delete task", () => {
    const result = taskManager.deleteTask("1")
    expect(result).toBe(true)
  })

  test("should toggle task", () => {
    const task = taskManager.toggleTask("1", true)
    expect(task.enabled).toBe(true)
  })

  test("should cancel task", () => {
    const mockJob = { cancel: jest.fn() }
    taskManager.scheduledJobs.set("1", mockJob)
    taskManager.cancelTask("1")
    expect(mockJob.cancel).toHaveBeenCalled()
    expect(taskManager.scheduledJobs.has("1")).toBe(false)
  })

  test("should get all tasks", () => {
    const tasks = taskManager.getAllTasks()
    expect(Array.isArray(tasks)).toBe(true)
  })

  test("should get task by id", () => {
    const task = taskManager.getTaskById("1")
    expect(task.id).toBe("1")
  })

  test("should shutdown", () => {
    const mockJob = { cancel: jest.fn() }
    taskManager.scheduledJobs.set("1", mockJob)
    taskManager.shutdown()
    expect(mockJob.cancel).toHaveBeenCalled()
    expect(taskManager.scheduledJobs.size).toBe(0)
  })

  test("should schedule cron task", () => {
    const task = { id: "2", content: "Cron task", schedule_type: "cron", cron_expression: "* * * * *", enabled: true }
    taskManager.scheduleTask(task)
    expect(taskManager.scheduledJobs.has("2")).toBe(true)
  })

  test("should handle unknown schedule type", () => {
    const task = { id: "3", content: "Unknown task", schedule_type: "unknown" }
    taskManager.scheduleTask(task)
    expect(taskManager.scheduledJobs.has("3")).toBe(false)
  })

  test("should execute task with notification", () => {
    const task = { id: "4", content: "Execute test", schedule_type: "cron", cron_expression: "* * * * *", enabled: true }
    taskManager.executeTask(task)
    expect(require("electron").Notification).toHaveBeenCalledWith({
      title: "定时提醒",
      body: "Execute test",
      silent: false
    })
  })

  test("should handle unsupported notification", () => {
    require("electron").Notification.isSupported = jest.fn().mockReturnValue(false)
    const task = { id: "5", content: "No notification", schedule_type: "cron", cron_expression: "* * * * *", enabled: true }
    taskManager.executeTask(task)
    expect(require("electron").Notification).not.toHaveBeenCalled()
  })

  test("should handle past trigger time for once task", () => {
    const pastTime = new Date(Date.now() - 10000).toISOString()
    const task = { id: "6", content: "Past task", schedule_type: "once", trigger_time: pastTime }
    const job = taskManager.scheduleTask(task)
    expect(job).toBeUndefined()
  })

  test("should handle missing cron expression", () => {
    const task = { id: "7", content: "No cron", schedule_type: "cron" }
    const job = taskManager.scheduleTask(task)
    expect(job).toBeUndefined()
  })
})
