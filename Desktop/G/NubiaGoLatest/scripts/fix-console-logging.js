#!/usr/bin/env node

/**
 * Console Logging Fix Script
 * 
 * This script automatically replaces console statements with production-safe logger calls
 * throughout the codebase to fix HIGH PRIORITY ISSUE #5.
 * 
 * Usage: node scripts/fix-console-logging.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Directories to process
  sourceDirs: [
    'src',
    'components',
    'hooks',
    'lib',
    'store'
  ],
  
  // File extensions to process
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Files to exclude
  excludeFiles: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    'scripts',
    'test',
    '__tests__',
    '*.test.*',
    '*.spec.*'
  ],
  
  // Console methods to replace
  consoleMethods: ['log', 'info', 'warn', 'error', 'debug'],
  
  // Import statement to add
  loggerImport: "import { logger } from '@/lib/utils/logger'",
  
  // Logger method mapping
  methodMapping: {
    'console.log': 'logger.log',
    'console.info': 'logger.info',
    'console.warn': 'logger.warn',
    'console.error': 'logger.error',
    'console.debug': 'logger.debug'
  }
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleStatementsReplaced: 0,
  importsAdded: 0,
  errors: []
};

/**
 * Check if file should be excluded
 */
function shouldExcludeFile(filePath) {
  return CONFIG.excludeFiles.some(exclude => {
    if (exclude.includes('*')) {
      const pattern = exclude.replace(/\*/g, '.*');
      return new RegExp(pattern).test(path.basename(filePath));
    }
    return filePath.includes(exclude);
  });
}

/**
 * Check if file has the specified extension
 */
function hasValidExtension(filePath) {
  return CONFIG.extensions.some(ext => filePath.endsWith(ext));
}

/**
 * Find all source files recursively
 */
function findSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!shouldExcludeFile(fullPath)) {
        findSourceFiles(fullPath, files);
      }
    } else if (stat.isFile() && hasValidExtension(fullPath)) {
      if (!shouldExcludeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Check if file already has logger import
 */
function hasLoggerImport(content) {
  return content.includes('@/lib/utils/logger') || 
         content.includes('./lib/utils/logger') ||
         content.includes('../lib/utils/logger');
}

/**
 * Add logger import to file
 */
function addLoggerImport(content, filePath) {
  // Determine relative path to logger
  const relativePath = path.relative(path.dirname(filePath), 'src/lib/utils/logger');
  const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  
  // Find the best place to add import (after existing imports)
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    }
  }
  
  // Add logger import
  const importStatement = `import { logger } from '${importPath.replace(/\\/g, '/')}'`;
  lines.splice(insertIndex, 0, '', importStatement);
  
  return lines.join('\n');
}

/**
 * Replace console statements with logger calls
 */
function replaceConsoleStatements(content) {
  let modified = false;
  let newContent = content;
  
  for (const [consoleMethod, loggerMethod] of Object.entries(CONFIG.methodMapping)) {
    // Regex to match console.method calls with various argument patterns
    const regex = new RegExp(`${consoleMethod.replace('.', '\\.')}\\s*\\(([^)]*)\\)`, 'g');
    
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, (match, args) => {
        modified = true;
        stats.consoleStatementsReplaced++;
        return `${loggerMethod}(${args})`;
      });
    }
  }
  
  return { content: newContent, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Check if file contains console statements
    const hasConsoleStatements = CONFIG.consoleMethods.some(method => 
      newContent.includes(`console.${method}`)
    );
    
    if (!hasConsoleStatements) {
      return; // No console statements to fix
    }
    
    // Replace console statements
    const replacementResult = replaceConsoleStatements(newContent);
    if (replacementResult.modified) {
      newContent = replacementResult.content;
      modified = true;
    }
    
    // Add logger import if needed
    if (modified && !hasLoggerImport(newContent)) {
      newContent = addLoggerImport(newContent, filePath);
      stats.importsAdded++;
    }
    
    // Write file if modified
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      stats.filesModified++;
      console.log(`✅ Fixed: ${filePath}`);
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting Console Logging Fix Script...\n');
  console.log('This script will fix HIGH PRIORITY ISSUE #5: Extensive Console Logging in Production\n');
  
  // Find all source files
  console.log('📁 Scanning for source files...');
  const sourceFiles = [];
  
  for (const dir of CONFIG.sourceDirs) {
    if (fs.existsSync(dir)) {
      const files = findSourceFiles(dir);
      sourceFiles.push(...files);
    }
  }
  
  console.log(`Found ${sourceFiles.length} source files to process\n`);
  
  // Process each file
  console.log('🔧 Processing files...\n');
  
  for (const file of sourceFiles) {
    processFile(file);
  }
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Console statements replaced: ${stats.consoleStatementsReplaced}`);
  console.log(`Logger imports added: ${stats.importsAdded}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
  
  console.log('\n🎉 Console logging fix completed!');
  console.log('\nNext steps:');
  console.log('1. Review the changes in modified files');
  console.log('2. Test the application to ensure logging works correctly');
  console.log('3. Set environment variables if you want to enable logging in production:');
  console.log('   - ENABLE_LOGGING=true (enables all logging in production)');
  console.log('   - ENABLE_DEBUG_LOGS=true (enables debug logs in development)');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, replaceConsoleStatements, addLoggerImport };
