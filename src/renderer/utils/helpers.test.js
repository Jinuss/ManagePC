const { formatUptime, getDiskColor, updateHistory, clamp, debounce, throttle } = require("./helpers")

describe("formatUptime", () => {
  test("should return '-' for invalid input", () => {
    expect(formatUptime(null)).toBe("-")
    expect(formatUptime(undefined)).toBe("-")
    expect(formatUptime("string")).toBe("-")
    expect(formatUptime({})).toBe("-")
  })

  test("should format seconds correctly", () => {
    expect(formatUptime(30)).toBe("0分钟")
    expect(formatUptime(60)).toBe("1分钟")
    expect(formatUptime(3600)).toBe("1小时 0分钟")
    expect(formatUptime(3660)).toBe("1小时 1分钟")
    expect(formatUptime(86400)).toBe("1天 0小时 0分钟")
    expect(formatUptime(90000)).toBe("1天 1小时 0分钟")
    expect(formatUptime(93660)).toBe("1天 2小时 1分钟")
  })
})

describe("getDiskColor", () => {
  test("should return danger color for >= 90%", () => {
    expect(getDiskColor(90)).toBe("linear-gradient(90deg, #dc3545, #ff6b6b)")
    expect(getDiskColor(95)).toBe("linear-gradient(90deg, #dc3545, #ff6b6b)")
    expect(getDiskColor(100)).toBe("linear-gradient(90deg, #dc3545, #ff6b6b)")
  })

  test("should return warning color for >= 70% and < 90%", () => {
    expect(getDiskColor(70)).toBe("linear-gradient(90deg, #ffc107, #ffec8b)")
    expect(getDiskColor(80)).toBe("linear-gradient(90deg, #ffc107, #ffec8b)")
    expect(getDiskColor(89)).toBe("linear-gradient(90deg, #ffc107, #ffec8b)")
  })

  test("should return success color for < 70%", () => {
    expect(getDiskColor(69)).toBe("linear-gradient(90deg, #28a745, #98fb98)")
    expect(getDiskColor(50)).toBe("linear-gradient(90deg, #28a745, #98fb98)")
    expect(getDiskColor(0)).toBe("linear-gradient(90deg, #28a745, #98fb98)")
  })
})

describe("updateHistory", () => {
  test("should not modify non-array input", () => {
    const result = updateHistory(null)
    expect(result).toBeUndefined()

    const result2 = updateHistory(undefined)
    expect(result2).toBeUndefined()

    const result3 = updateHistory("string")
    expect(result3).toBeUndefined()
  })

  test("should add value to history array", () => {
    const history = []
    updateHistory(history, 10)
    expect(history).toEqual([10])

    updateHistory(history, 20)
    expect(history).toEqual([10, 20])
  })

  test("should maintain maxLength constraint", () => {
    const history = []
    const maxLength = 3

    for (let i = 1; i <= 5; i++) {
      updateHistory(history, i, maxLength)
    }

    expect(history.length).toBe(maxLength)
    expect(history).toEqual([3, 4, 5])
  })

  test("should use default maxLength of 30", () => {
    const history = []

    for (let i = 1; i <= 35; i++) {
      updateHistory(history, i)
    }

    expect(history.length).toBe(30)
    expect(history[0]).toBe(6)
    expect(history[29]).toBe(35)
  })
})

describe("clamp", () => {
  test("should return value within min and max", () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })

  test("should handle negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })
})

describe("debounce", () => {
  jest.useFakeTimers()

  test("should delay function execution", () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("should reset timer on repeated calls", () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    jest.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("should pass arguments correctly", () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn("arg1", "arg2", 3)
    jest.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith("arg1", "arg2", 3)
  })
})

describe("throttle", () => {
  jest.useFakeTimers()

  test("should limit function execution frequency", () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  test("should pass arguments correctly", () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn("test", 123)
    expect(fn).toHaveBeenCalledWith("test", 123)
  })

  test("should allow calls after throttle period", () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    jest.advanceTimersByTime(50)
    throttledFn()
    jest.advanceTimersByTime(60)
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
