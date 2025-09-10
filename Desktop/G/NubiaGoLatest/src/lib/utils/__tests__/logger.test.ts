import { Logger } from '../logger'

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
}

// Mock process.env
const originalEnv = process.env

describe('Logger', () => {
  let logger: Logger

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock console
    global.console = mockConsole as any
    
    // Reset environment
    process.env = { ...originalEnv }
    
    // Create new logger instance
    logger = new Logger()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('Environment Detection', () => {
    it('detects development environment', () => {
      process.env.NODE_ENV = 'development'
      logger = new Logger()
      
      expect(logger.getEnvironment()).toBe('development')
      expect(logger.getConfig().isDevelopment).toBe(true)
      expect(logger.getConfig().isProduction).toBe(false)
      expect(logger.getConfig().isTest).toBe(false)
    })

    it('detects production environment', () => {
      process.env.NODE_ENV = 'production'
      logger = new Logger()
      
      expect(logger.getEnvironment()).toBe('production')
      expect(logger.getConfig().isDevelopment).toBe(false)
      expect(logger.getConfig().isProduction).toBe(true)
      expect(logger.getConfig().isTest).toBe(false)
    })

    it('detects test environment', () => {
      process.env.NODE_ENV = 'test'
      logger = new Logger()
      
      expect(logger.getEnvironment()).toBe('test')
      expect(logger.getConfig().isDevelopment).toBe(false)
      expect(logger.getConfig().isProduction).toBe(false)
      expect(logger.getConfig().isTest).toBe(true)
    })

    it('defaults to development environment', () => {
      delete process.env.NODE_ENV
      logger = new Logger()
      
      expect(logger.getEnvironment()).toBe('development')
    })
  })

  describe('Logging Methods', () => {
    it('logs info messages in all environments', () => {
      logger.info('Test info message')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      )
    })

    it('logs warn messages in all environments', () => {
      logger.warn('Test warning message')
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      )
    })

    it('logs error messages in all environments', () => {
      logger.error('Test error message')
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      )
    })


  })

  describe('Message Formatting', () => {
    it('formats messages with timestamp', () => {
      const before = Date.now()
      logger.info('Test message')
      const after = Date.now()
      
      const logCall = mockConsole.info.mock.calls[0][0]
      expect(logCall).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z INFO  Test message$/)
      
      // Check if timestamp is within reasonable range
      const timestampMatch = logCall.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/)
      if (timestampMatch) {
        const timestamp = new Date(timestampMatch[1]).getTime()
        expect(timestamp).toBeGreaterThanOrEqual(before)
        expect(timestamp).toBeLessThanOrEqual(after)
      }
    })

    it('formats messages with log level', () => {
      logger.info('Test message')
      logger.warn('Test warning')
      logger.error('Test error')
      
      expect(mockConsole.info.mock.calls[0][0]).toContain('INFO')
      expect(mockConsole.warn.mock.calls[0][0]).toContain('WARN')
      expect(mockConsole.error.mock.calls[0][0]).toContain('ERROR')
    })

    it('includes message content', () => {
      logger.info('Test message content')
      
      expect(mockConsole.info.mock.calls[0][0]).toContain('Test message content')
    })

    it('handles additional arguments', () => {
      const extraData = { key: 'value', number: 42 }
      logger.info('Test message', extraData)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        extraData
      )
    })
  })





  describe('Error Logging', () => {
    it('logs error objects with stack traces', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred'),
        error
      )
    })

    it('handles non-Error objects', () => {
      const errorObj = { message: 'Custom error', code: 'ERR001' }
      logger.error('Custom error occurred', errorObj)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Custom error occurred'),
        errorObj
      )
    })
  })




})
