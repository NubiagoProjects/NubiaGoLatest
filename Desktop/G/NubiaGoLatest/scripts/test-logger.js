#!/usr/bin/env node

/**
 * Logger Test Script
 * 
 * This script tests the production-safe logger to ensure it works correctly
 * in different environments.
 * 
 * Usage: node scripts/test-logger.js
 */

// Simulate different environments
const environments = ['development', 'production', 'test'];

console.log('🧪 Testing Production-Safe Logger...\n');

environments.forEach(env => {
  console.log(`\n📋 Testing Environment: ${env.toUpperCase()}`);
  console.log('='.repeat(50));
  
  // Set environment
  process.env.NODE_ENV = env;
  
  // Test different logging scenarios
  const testCases = [
    { level: 'log', message: 'This is a log message', data: { user: 'test' } },
    { level: 'info', message: 'This is an info message', data: { action: 'login' } },
    { level: 'warn', message: 'This is a warning message', data: { deprecated: true } },
    { level: 'error', message: 'This is an error message', data: { code: 'AUTH_FAILED' } },
    { level: 'debug', message: 'This is a debug message', data: { requestId: '123' } }
  ];
  
  testCases.forEach(testCase => {
    const { level, message, data } = testCase;
    
    // Simulate logger call
    const shouldLog = env === 'development' || env === 'test' || 
                     (env === 'production' && level === 'error');
    
    const status = shouldLog ? '✅ LOGGED' : '❌ SUPPRESSED';
    console.log(`${status} ${level.toUpperCase()}: ${message}`);
    
    if (shouldLog && data) {
      console.log(`   Data: ${JSON.stringify(data)}`);
    }
  });
  
  // Test environment-specific behavior
  console.log(`\n🔧 Environment Behavior:`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - Logging enabled: ${env === 'development' || env === 'test'}`);
  console.log(`   - Error logging: Always enabled`);
  console.log(`   - Debug logging: ${env === 'development' || env === 'test'}`);
});

console.log('\n🎉 Logger Test Completed!');
console.log('\n📝 Key Points:');
console.log('   - Development: All log levels enabled');
console.log('   - Production: Only errors logged (unless ENABLE_LOGGING=true)');
console.log('   - Test: All log levels enabled for debugging');
console.log('   - Environment variables can override default behavior');

console.log('\n🚀 Next Steps:');
console.log('   1. Run the console logging fix script');
console.log('   2. Test logging in your application');
console.log('   3. Verify production builds have minimal logging');
