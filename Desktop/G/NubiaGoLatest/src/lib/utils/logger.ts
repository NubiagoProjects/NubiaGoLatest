/**
 * Production-safe logging utility
 * Only logs in development mode to prevent console pollution in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

interface LoggerOptions {
  level?: LogLevel
  context?: string
  production?: boolean
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  private isTest = process.env.NODE_ENV === 'test'
  
  // Allow explicit control via environment variables
  private enableLogging = process.env.ENABLE_LOGGING === 'true'
  private enableDebugLogs = process.env.ENABLE_DEBUG_LOGS === 'true'

  private shouldLog(level: LogLevel): boolean {
    // In test environment, always log for debugging
    if (this.isTest) return true
    
    // In production, only log errors unless explicitly enabled
    if (this.isProduction) {
      if (level === 'error') return true
      if (this.enableLogging) return true
      return false
    }
    
    // In development, log everything unless explicitly disabled
    if (this.isDevelopment) {
      if (level === 'debug' && !this.enableDebugLogs) return false
      return true
    }
    
    return false
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`
  }

  log(message: string, ...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(this.formatMessage('log', message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  // Method to check if logging is enabled
  isEnabled(): boolean {
    return this.shouldLog('log')
  }

  // Method to get current environment
  getEnvironment(): string {
    return process.env.NODE_ENV || 'development'
  }

  // Method to check if specific level is enabled
  isLevelEnabled(level: LogLevel): boolean {
    return this.shouldLog(level)
  }

  // Method to get logging configuration
  getConfig() {
    return {
      environment: this.getEnvironment(),
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      isTest: this.isTest,
      enableLogging: this.enableLogging,
      enableDebugLogs: this.enableDebugLogs,
      logLevels: {
        log: this.shouldLog('log'),
        info: this.shouldLog('info'),
        warn: this.shouldLog('warn'),
        error: this.shouldLog('error'),
        debug: this.shouldLog('debug')
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export individual methods for convenience
export const { log, info, warn, error, debug } = logger

// Export the class for testing
export { Logger }

// Export type for external use
export type { LogLevel, LoggerOptions }
