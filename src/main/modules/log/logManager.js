import _log from 'electron-log'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { isWindows, isMac } from '../../utils/helps'

/** 日志管理器类
 * 负责日志的初始化、配置、读取和监听
 */
class LogManager {
    constructor() {
        this.log = _log
        this.watcher = null
        this.lastSize = 0
        this.isWatching = false
        this.initLogger()
    }

        /** 初始化日志系统
     * 根据开发/生产环境配置不同的日志行为
     */
    initLogger() {
        const isDev = !app.isPackaged
        this.isDev = isDev

        if (isDev) {
            this.configureDevLogger()
        } else {
            this.configureProdLogger()
        }
    }

        /** 配置开发环境日志
     * 日志级别为 debug，输出到控制台和 debug.log 文件
     */
    configureDevLogger() {
        const rootDir = app.getAppPath()
        const debugLogPath = path.join(rootDir, 'debug.log')

        this.log.transports.file.resolvePathFn = () => debugLogPath
        this.log.transports.file.level = 'debug'
        this.log.transports.console.level = 'debug'
        this.log.transports.file.format = '[{m}/{d}/{y} {h}:{i}:{s}] [{level}] {text}'

        if (fs.existsSync(debugLogPath)) {
            fs.writeFileSync(debugLogPath, '', 'utf-8')
        }

        this.log.info('=== Development Mode ===')
        this.log.info('Debug log path:', debugLogPath)
    }

        /** 配置生产环境日志
     * 日志级别为 info，根据平台选择不同的日志目录
     */
    configureProdLogger() {
        this.log.transports.file.level = 'info'
        this.log.transports.console.level = 'info'
        this.log.transports.file.resolvePathFn = () => {
            let logDir
            if (isWindows()) {
                logDir = path.join(app.getPath('userData'), 'logs')
            } else if (isMac()) {
                logDir = app.getPath('logs')
            } else {
                logDir = path.join(app.getPath('userData'), 'logs')
            }

            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true })
            }

            return path.join(logDir, 'main.log')
        }

        this.log.transports.file.format = '[{m}/{d}/{y} {h}:{i}:{s}] [{level}] {text}'

        this.log.info('=== Production Mode ===')
        this.log.info('Main log path:', this.log.transports.file.resolvePathFn())
    }

        /** 获取日志文件路径
     * @returns {string} - 日志文件的绝对路径
     */
    getLogPath() {
        if (this.isDev) {
            return path.join(app.getAppPath(), 'debug.log')
        }
        return this.log.transports.file.resolvePathFn()
    }

        /** 读取日志内容
     * @param {number} maxLines - 最大读取行数，默认 500
     * @returns {Array} - 解析后的日志对象数组
     */
    async readLogs(maxLines = 500) {
        const logPath = this.getLogPath()
        const logs = []

        try {
            if (fs.existsSync(logPath)) {
                const content = fs.readFileSync(logPath, 'utf-8')
                const lines = content.split('\n').filter(line => line.trim())

                const startIndex = Math.max(0, lines.length - maxLines)
                for (let i = startIndex; i < lines.length; i++) {
                    const line = lines[i]
                    const parsed = this.parseLogLine(line)
                    if (parsed) {
                        logs.push(parsed)
                    }
                }
            }
        } catch (error) {
            this.log.error('Failed to read logs:', error)
        }

        return logs
    }

        /** 解析日志行
     * @param {string} line - 日志行文本
     * @returns {Object} - 解析后的日志对象 { timestamp, level, message, raw }
     */
    parseLogLine(line) {
        const regex = /\[(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})\] \[(\w+)\] (.+)/
        const match = line.match(regex)

        if (match) {
            const [, month, day, year, hour, minute, second, level, message] = match
            return {
                timestamp: new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`),
                level: level.toLowerCase(),
                message: message,
                raw: line
            }
        }

        return {
            timestamp: new Date(),
            level: 'info',
            message: line,
            raw: line
        }
    }

        /** 清空日志文件
     * @returns {Object} - { success: boolean, error?: string }
     */
    async clearLogs() {
        const logPath = this.getLogPath()
        try {
            fs.writeFileSync(logPath, '', 'utf-8')
            this.log.info('Logs cleared')
            return { success: true }
        } catch (error) {
            this.log.error('Failed to clear logs:', error)
            return { success: false, error: error.message }
        }
    }

        /** 获取日志文件信息
     * @returns {Object} - { path, size, lineCount, isDev }
     */
    getLogInfo() {
        const logPath = this.getLogPath()
        let size = 0
        let lineCount = 0

        try {
            if (fs.existsSync(logPath)) {
                const stats = fs.statSync(logPath)
                size = stats.size
                const content = fs.readFileSync(logPath, 'utf-8')
                lineCount = content.split('\n').filter(line => line.trim()).length
            }
        } catch (error) {
            this.log.error('Failed to get log info:', error)
        }

        return {
            path: logPath,
            size,
            lineCount,
            isDev: this.isDev
        }
    }

        /** 开始监听日志文件变化
     * @param {BrowserWindow} window - 要发送日志更新的窗口
     */
    startWatching(window) {
        if (this.isWatching) {
            return
        }

        const logPath = this.getLogPath()

        if (!fs.existsSync(logPath)) {
            this.log.warn('Log file not found:', logPath)
            return
        }

        try {
            const stats = fs.statSync(logPath)
            this.lastSize = stats.size
            this.isWatching = true

            this.watcher = fs.watch(logPath, (eventType) => {
                if (eventType === 'change') {
                    this.handleLogFileChange(window, logPath)
                }
            })

            this.watcher.on('error', (error) => {
                this.log.error('Log watcher error:', error)
                this.isWatching = false
            })

            this.log.info('Log watcher started')
        } catch (error) {
            this.log.error('Failed to start log watcher:', error)
        }
    }

        /** 处理日志文件变化
     * 读取新增的日志内容并发送给渲染进程
     * @param {BrowserWindow} window - 目标窗口
     * @param {string} logPath - 日志文件路径
     */
    handleLogFileChange(window, logPath) {
        try {
            const stats = fs.statSync(logPath)
            const currentSize = stats.size

            if (currentSize > this.lastSize) {
                const fd = fs.openSync(logPath, 'r')
                const buffer = Buffer.alloc(currentSize - this.lastSize)
                fs.readSync(fd, buffer, 0, buffer.length, this.lastSize)
                fs.closeSync(fd)

                const newContent = buffer.toString('utf-8')
                const newLines = newContent.split('\n').filter(line => line.trim())

                const newLogs = newLines.map(line => this.parseLogLine(line)).filter(log => log)

                if (newLogs.length > 0 && window && !window.isDestroyed()) {
                    window.webContents.send('log-updated', newLogs)
                }

                this.lastSize = currentSize
            } else if (currentSize < this.lastSize) {
                this.lastSize = 0
            }
        } catch (error) {
            this.log.error('Failed to handle log file change:', error)
        }
    }

        /** 停止监听日志文件
     */
    stopWatching() {
        if (this.watcher) {
            this.watcher.close()
            this.watcher = null
        }
        this.isWatching = false
        this.lastSize = 0
        this.log.info('Log watcher stopped')
    }
}

const logManager = new LogManager()

export default logManager

export const log = logManager.log

/** 创建日志处理器
 * @returns {Object} - 包含日志操作方法的对象
 */
export function createLogHandler() {
    return {
        getLogPath: () => logManager.getLogPath(),
        getLogInfo: () => logManager.getLogInfo(),
        readLogs: (maxLines) => logManager.readLogs(maxLines),
        clearLogs: () => logManager.clearLogs(),
        startWatching: (window) => logManager.startWatching(window),
        stopWatching: () => logManager.stopWatching()
    }
}