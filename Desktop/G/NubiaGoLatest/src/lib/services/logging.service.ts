export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  enableStorage: boolean
  remoteEndpoint?: string
  maxStorageEntries: number
}

class LoggingService {
  private config: LoggerConfig
  private sessionId: string
  private userId?: string

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      enableStorage: true,
      remoteEndpoint: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
      maxStorageEntries: 1000,
      ...config
    }

    this.sessionId = this.generateSessionId()
    this.initializeUserId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeUserId(): void {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('user_id') || undefined
    }
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add stack trace for errors
    if (level >= LogLevel.ERROR && data instanceof Error) {
      entry.stack = data.stack
    }

    return entry
  }

  private async logToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return

    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
    const levelColors = ['#6B7280', '#3B82F6', '#F59E0B', '#EF4444', '#7C2D12']
    
    const style = `color: ${levelColors[entry.level]}; font-weight: bold;`
    const contextStr = entry.context ? ` [${entry.context}]` : ''
    
    console.log(
      `%c[${levelNames[entry.level]}]${contextStr} ${entry.message}`,
      style,
      entry.data || ''
    )
  }

  private async logToStorage(entry: LogEntry): Promise<void> {
    if (!this.config.enableStorage || typeof window === 'undefined') return

    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      existingLogs.push(entry)

      // Keep only the most recent entries
      if (existingLogs.length > this.config.maxStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxStorageEntries)
      }

      localStorage.setItem('app_logs', JSON.stringify(existingLogs))
    } catch (error) {
      console.error('Failed to store log entry:', error)
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote endpoint:', error)
    }
  }

  private async log(level: LogLevel, message: string, context?: string, data?: any): Promise<void> {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, message, context, data)

    // Log to all enabled destinations
    await Promise.all([
      this.logToConsole(entry),
      this.logToStorage(entry),
      this.logToRemote(entry)
    ])
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data)
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data)
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data)
  }

  fatal(message: string, context?: string, data?: any): void {
    this.log(LogLevel.FATAL, message, context, data)
  }

  // Specialized logging methods
  apiCall(method: string, url: string, status: number, duration: number, data?: any): void {
    this.info(
      `API ${method} ${url} - ${status} (${duration}ms)`,
      'API',
      { method, url, status, duration, ...data }
    )
  }

  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, 'USER_ACTION', data)
  }

  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, 'PERFORMANCE', { metric, value, unit })
  }

  security(event: string, data?: any): void {
    this.warn(`Security event: ${event}`, 'SECURITY', data)
  }

  // Get stored logs
  async getLogs(level?: LogLevel, limit?: number): Promise<LogEntry[]> {
    if (typeof window === 'undefined') return []

    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]') as LogEntry[]
      
      let filteredLogs = logs
      if (level !== undefined) {
        filteredLogs = logs.filter(log => log.level >= level)
      }

      if (limit) {
        filteredLogs = filteredLogs.slice(-limit)
      }

      return filteredLogs
    } catch (error) {
      console.error('Failed to retrieve logs:', error)
      return []
    }
  }

  // Clear stored logs
  clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs')
    }
  }

  // Export logs for debugging
  async exportLogs(): Promise<string> {
    const logs = await this.getLogs()
    return JSON.stringify(logs, null, 2)
  }
}

// Create singleton instance
export const logger = new LoggingService()

// Convenience functions for common use cases
export const logApiCall = (method: string, url: string, status: number, duration: number, data?: any) => {
  logger.apiCall(method, url, status, duration, data)
}

export const logUserAction = (action: string, data?: any) => {
  logger.userAction(action, data)
}

export const logError = (message: string, error?: Error, context?: string) => {
  logger.error(message, context, error)
}

export const logPerformance = (metric: string, value: number, unit: string = 'ms') => {
  logger.performance(metric, value, unit)
}

export const logSecurity = (event: string, data?: any) => {
  logger.security(event, data)
}

// Replace console methods in production
if (process.env.NODE_ENV === 'production') {
  const originalConsole = { ...console }
  
  console.log = (...args) => logger.info(args.join(' '), 'CONSOLE')
  console.info = (...args) => logger.info(args.join(' '), 'CONSOLE')
  console.warn = (...args) => logger.warn(args.join(' '), 'CONSOLE')
  console.error = (...args) => logger.error(args.join(' '), 'CONSOLE')
  
  // Keep original console methods available
  console.originalLog = originalConsole.log
  console.originalInfo = originalConsole.info
  console.originalWarn = originalConsole.warn
  console.originalError = originalConsole.error
}
