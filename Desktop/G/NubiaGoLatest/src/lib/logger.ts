// ============================================================================
// PRODUCTION-SAFE LOGGING UTILITY
// ============================================================================

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'performance' | 'api'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: any
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Development-only logging
   */
  log(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...args)
    }
  }

  /**
   * Development-only info logging
   */
  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  /**
   * Development-only debug logging
   */
  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  /**
   * Warning logging (both dev and prod)
   */
  warn(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    } else if (this.isProduction) {
      // In production, send to monitoring service
      this.sendToMonitoring('warn', message, args)
    }
  }

  /**
   * Error logging (always enabled)
   */
  error(message: string, error?: Error, ...args: any[]) {
    const logEntry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      data: args,
      stack: error?.stack
    }

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args)
    }

    if (this.isProduction) {
      // In production, send to monitoring service
      this.sendToMonitoring('error', message, { error, args })
    }
  }

  /**
   * Performance logging
   */
  performance(message: string, duration: number, metadata?: any) {
    if (this.isDevelopment) {
      console.log(`[PERF] ${message}: ${duration.toFixed(2)}ms`, metadata)
    } else if (this.isProduction) {
      // In production, send to analytics
      this.sendToMonitoring('performance', message, { duration, metadata })
    }
  }

  /**
   * API logging
   */
  api(method: string, url: string, status: number, duration: number) {
    const message = `${method} ${url} - ${status} (${duration}ms)`
    
    if (this.isDevelopment) {
      const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m'
      console.log(`${color}[API]${'\x1b[0m'} ${message}`)
    } else if (this.isProduction) {
      this.sendToMonitoring('api', message, { method, url, status, duration })
    }
  }

  /**
   * Send logs to monitoring service in production
   */
  private sendToMonitoring(level: LogLevel, message: string, data?: any) {
    // In a real implementation, this would send to services like:
    // - Sentry for errors
    // - DataDog for performance
    // - Custom analytics endpoint
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'log', {
        level,
        message,
        data: JSON.stringify(data)
      })
    }
  }

  /**
   * Create a scoped logger for specific modules
   */
  scope(scopeName: string) {
    return {
      log: (message: string, ...args: any[]) => this.log(`[${scopeName}] ${message}`, ...args),
      info: (message: string, ...args: any[]) => this.info(`[${scopeName}] ${message}`, ...args),
      debug: (message: string, ...args: any[]) => this.debug(`[${scopeName}] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => this.warn(`[${scopeName}] ${message}`, ...args),
      error: (message: string, error?: Error, ...args: any[]) => this.error(`[${scopeName}] ${message}`, error, ...args),
      performance: (message: string, duration: number, metadata?: any) => this.performance(`[${scopeName}] ${message}`, duration, metadata),
      api: (method: string, url: string, status: number, duration: number) => this.api(method, url, status, duration)
    }
  }
}

// Singleton logger instance
export const logger = new Logger()

// Scoped loggers for different modules
export const apiLogger = logger.scope('API')
export const performanceLogger = logger.scope('PERFORMANCE')
export const componentLogger = logger.scope('COMPONENT')
export const serviceLogger = logger.scope('SERVICE')

export default logger
