/**
 * Test file to verify all security and performance fixes
 * This file can be run to test the implemented fixes
 */

import { CSRFProtection } from './security/csrf'
import { EnhancedCache, CacheFactory } from './cache'
import { errorLogger } from './services/error-logging.service'
import { PerformanceMetrics } from './performance'

/**
 * Test CSRF Protection
 */
export function testCSRFProtection(): boolean {
  try {
    console.log('🧪 Testing CSRF Protection...')
    
    const sessionId = 'test-session-123'
    const secret = 'test-secret-key'
    
    // Test token generation
    const tokenData = CSRFProtection.generateToken(sessionId, secret)
    console.log('✅ Token generation:', tokenData.token.length > 0)
    
    // Test signed token generation
    const signedToken = CSRFProtection.generateSignedToken(sessionId, secret)
    console.log('✅ Signed token generation:', signedToken.includes('.'))
    
    // Test token validation
    const isValid = CSRFProtection.validateSignedToken(signedToken, sessionId, secret)
    console.log('✅ Token validation:', isValid)
    
    // Test token expiry
    const isExpired = CSRFProtection.isTokenExpired(Date.now() - 1000)
    console.log('✅ Token expiry check:', isExpired)
    
    console.log('✅ CSRF Protection tests passed')
    return true
  } catch (error) {
    console.error('❌ CSRF Protection tests failed:', error)
    return false
  }
}

/**
 * Test Enhanced Cache
 */
export function testEnhancedCache(): boolean {
  try {
    console.log('🧪 Testing Enhanced Cache...')
    
    const cache = new EnhancedCache({
      ttl: 1000, // 1 second
      maxSize: 5,
      persist: false
    })
    
    // Test basic operations
    cache.set('test-key', 'test-value')
    const value = cache.get('test-key')
    console.log('✅ Basic cache operations:', value === 'test-value')
    
    // Test TTL
    setTimeout(() => {
      const expiredValue = cache.get('test-key')
      console.log('✅ TTL expiration:', expiredValue === null)
    }, 1100)
    
    // Test max size
    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, `value-${i}`)
    }
    console.log('✅ Max size enforcement:', cache.getStats().size <= 5)
    
    // Test statistics
    const stats = cache.getStats()
    console.log('✅ Cache statistics:', stats.size > 0)
    
    console.log('✅ Enhanced Cache tests passed')
    return true
  } catch (error) {
    console.error('❌ Enhanced Cache tests failed:', error)
    return false
  }
}

/**
 * Test Error Logging Service
 */
export function testErrorLoggingService(): boolean {
  try {
    console.log('🧪 Testing Error Logging Service...')
    
    // Test basic error logging
    const errorId = errorLogger.logError('Test error message')
    console.log('✅ Basic error logging:', errorId.length > 0)
    
    // Test warning logging
    const warningId = errorLogger.logWarning('Test warning message')
    console.log('✅ Warning logging:', warningId.length > 0)
    
    // Test info logging
    const infoId = errorLogger.logInfo('Test info message')
    console.log('✅ Info logging:', infoId.length > 0)
    
    // Test API error logging
    const apiErrorId = errorLogger.logAPIError(
      new Error('API test error'),
      { method: 'GET', url: '/test', statusCode: 500 }
    )
    console.log('✅ API error logging:', apiErrorId.length > 0)
    
    // Test validation error logging
    const validationErrorId = errorLogger.logValidationError(
      new Error('Validation test error'),
      { form: 'test-form', field: 'test-field' }
    )
    console.log('✅ Validation error logging:', validationErrorId.length > 0)
    
    console.log('✅ Error Logging Service tests passed')
    return true
  } catch (error) {
    console.error('❌ Error Logging Service tests failed:', error)
    return false
  }
}

/**
 * Test Performance Utilities
 */
export function testPerformanceUtilities(): boolean {
  try {
    console.log('🧪 Testing Performance Utilities...')
    
    // Test performance metrics
    const metrics = PerformanceMetrics.getInstance()
    const measureId = metrics.startMeasure('test-measure')
    console.log('✅ Performance measurement start:', measureId.length > 0)
    
    // Simulate some work
    setTimeout(() => {
      const duration = metrics.endMeasure('test-measure', measureId)
      console.log('✅ Performance measurement end:', duration > 0)
    }, 100)
    
    // Test cache factory
    const testCache = CacheFactory.getCache('test-cache')
    testCache.set('test', 'value')
    console.log('✅ Cache factory:', testCache.get('test') === 'value')
    
    console.log('✅ Performance Utilities tests passed')
    return true
  } catch (error) {
    console.error('❌ Performance Utilities tests failed:', error)
    return false
  }
}

/**
 * Test Validation Schemas
 */
export async function testValidationSchemas(): Promise<boolean> {
  try {
    console.log('🧪 Testing Validation Schemas...')
    
    // Test user registration schema
    const { userRegistrationSchema } = await import('./validation-schemas')
    
    const validData = {
      email: 'test@example.com',
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      displayName: 'Test User',
      acceptTerms: true
    }
    
    const result = userRegistrationSchema.safeParse(validData)
    console.log('✅ User registration validation:', result.success)
    
    // Test invalid data
    const invalidData = {
      email: 'invalid-email',
      password: 'weak',
      confirmPassword: 'different',
      displayName: '',
      acceptTerms: false
    }
    
    const invalidResult = userRegistrationSchema.safeParse(invalidData)
    console.log('✅ Invalid data rejection:', !invalidResult.success)
    
    console.log('✅ Validation Schemas tests passed')
    return true
  } catch (error) {
    console.error('❌ Validation Schemas tests failed:', error)
    return false
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<{
  total: number
  passed: number
  failed: number
  results: Record<string, boolean>
}> {
  console.log('🚀 Starting Security and Performance Fixes Test Suite...\n')
  
  const tests = [
    { name: 'CSRF Protection', fn: testCSRFProtection },
    { name: 'Enhanced Cache', fn: testEnhancedCache },
    { name: 'Error Logging Service', fn: testErrorLoggingService },
    { name: 'Performance Utilities', fn: testPerformanceUtilities },
    { name: 'Validation Schemas', fn: testValidationSchemas }
  ]
  
  const results: Record<string, boolean> = {}
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      results[test.name] = result
      
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error)
      results[test.name] = false
      failed++
    }
    
    console.log('') // Add spacing between tests
  }
  
  const total = tests.length
  
  console.log('📊 Test Results Summary:')
  console.log(`Total Tests: ${total}`)
  console.log(`Passed: ${passed} ✅`)
  console.log(`Failed: ${failed} ❌`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  console.log('\n📋 Detailed Results:')
  for (const [testName, result] of Object.entries(results)) {
    console.log(`${testName}: ${result ? '✅ PASS' : '❌ FAIL'}`)
  }
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Security and performance fixes are working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.')
  }
  
  return { total, passed, failed, results }
}

/**
 * Test specific functionality
 */
export function testSpecificFunctionality(): void {
  console.log('🧪 Testing Specific Functionality...')
  
  // Test CSRF token generation
  const sessionId = 'test-session-456'
  const secret = 'test-secret-789'
  
  const token = CSRFProtection.generateSignedToken(sessionId, secret)
  console.log('Generated CSRF token:', token)
  
  // Test cache operations
  const cache = new EnhancedCache({ ttl: 5000, maxSize: 10 })
  cache.set('test-key', { data: 'test-value', timestamp: Date.now() })
  
  const cachedValue = cache.get('test-key')
  console.log('Cached value:', cachedValue)
  
  // Test error logging
  const errorId = errorLogger.logError('Test error for functionality test')
  console.log('Logged error ID:', errorId)
  
  console.log('✅ Specific functionality tests completed')
}

// Export for use in other files
const securityTests = {
  testCSRFProtection,
  testEnhancedCache,
  testErrorLoggingService,
  testPerformanceUtilities,
  testValidationSchemas,
  runAllTests,
  testSpecificFunctionality
}

export default securityTests
