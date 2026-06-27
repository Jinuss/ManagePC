import _log from 'electron-log'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { isWindows, isMac } from '../../utils/helps'

class LogManager {
    constructor() {
        this.log = _log
        this.watcher = null
        this.lastSize = 0
        this.isWatching = false
        this.initLogger()
    }

    initLogger() {
        const isDev = !app.isPackaged
        this.isDev = isDev

        if (isDev) {
            this.configureDevLogger()
        } else {
            this.configureProdLogger()
        }
    }

    configureDevLogger() {
        const rootDir = app.getAppPath()
        const debugLogPath = path.join(rootDir, 'debug.log')

        this.log.transports.file.resolvePathFn = () => debugLogPath
        this.log.transports.file.level = 'debug'
        this.log.transports.console.level = 'debug'
        this.log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

        if (fs.existsSync(debugLogPath)) {
            fs.writeFileSync(debugLogPath, '', 'utf-8')
        }

        this.log.info('=== Development Mode ===')
        this.log.info('Debug log path:', debugLogPath)
    }

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

        this.log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

        this.log.info('=== Production Mode ===')
        this.log.info('Main log path:', this.log.transports.file.resolvePathFn())
    }

    getLogPath() {
        if (this.isDev) {
            return path.join(app.getAppPath(), 'debug.log')
        }
        return this.log.transports.file.resolvePathFn()
    }

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

    parseLogLine(line) {
        const regex = /\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})\] \[(\w+)\] (.+)/
        const match = line.match(regex)

        if (match) {
            const [, year, month, day, hour, minute, second, ms, level, message] = match
            return {
                timestamp: new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`),
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