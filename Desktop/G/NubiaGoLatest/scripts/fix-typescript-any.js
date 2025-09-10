#!/usr/bin/env node

/**
 * TypeScript Any Type Fix Script
 * 
 * This script automatically replaces TypeScript `any` types with proper type definitions
 * throughout the codebase to fix HIGH PRIORITY ISSUE #6.
 * 
 * Usage: node scripts/fix-typescript-any.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Directories to process
  sourceDirs: [
    'src',
    'src/components',
    'src/hooks',
    'src/lib',
    'src/store'
  ],
  
  // File extensions to process
  extensions: ['.ts', '.tsx'],
  
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
    '*.spec.*',
    'types/common.ts' // Don't process the types file itself
  ],
  
  // Type mappings for common any patterns
  typeMappings: {
    // Error handling
    'error: any': 'error: unknown',
    'err: any': 'err: unknown',
    
    // Function parameters
    '...args: any[]': '...args: unknown[]',
    'args: any[]': 'args: unknown[]',
    
    // Generic object types
    'data: any': 'data: Record<string, unknown>',
    'metadata: any': 'metadata: Record<string, unknown>',
    'properties: any': 'properties: Record<string, unknown>',
    'details: any': 'details: Record<string, unknown>',
    'config: any': 'config: Record<string, unknown>',
    'options: any': 'options: Record<string, unknown>',
    'settings: any': 'settings: Record<string, unknown>',
    
    // Product and business types
    'product: any': 'product: Product',
    'products: any[]': 'products: Product[]',
    'item: any': 'item: CartItem | OrderItem',
    'items: any[]': 'items: (CartItem | OrderItem)[]',
    'user: any': 'user: User',
    'order: any': 'order: Order',
    'cart: any': 'cart: Cart',
    
    // Array types
    'array: any[]': 'array: unknown[]',
    'list: any[]': 'list: unknown[]',
    'results: any[]': 'results: unknown[]',
    
    // Function types
    'fn: any': 'fn: AnyFunction',
    'callback: any': 'callback: AnyFunction',
    'handler: any': 'handler: AnyFunction',
    
    // Event types
    'event: any': 'event: Event',
    'payload: any': 'payload: unknown',
    
    // Generic catch blocks
    '} catch (error: any) {': '} catch (error: unknown) {',
    '} catch (err: any) {': '} catch (err: unknown) {',
    
    // Object literal types
    '{ [key: string]: any }': '{ [key: string]: unknown }',
    'Record<string, any>': 'Record<string, unknown>',
    
    // Generic function constraints
    'T extends (...args: any[]) => any': 'T extends (...args: unknown[]) => unknown',
    'T extends any[]': 'T extends unknown[]'
  },
  
  // Import statements to add
  imports: {
    'src/types/common': [
      'AppError',
      'ValidationError', 
      'ApiError',
      'User',
      'Product',
      'Cart',
      'Order',
      'CartItem',
      'OrderItem',
      'Address',
      'PaymentMethod',
      'Notification',
      'AnalyticsEvent',
      'ApiResponse',
      'PaginatedResponse',
      'AnyFunction',
      'EventHandler',
      'ErrorHandler'
    ]
  }
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  anyTypesReplaced: 0,
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
 * Check if file already has types import
 */
function hasTypesImport(content) {
  return content.includes('@/types/common') || 
         content.includes('./types/common') ||
         content.includes('../types/common');
}

/**
 * Add types import to file
 */
function addTypesImport(content, filePath) {
  // Determine relative path to types
  const relativePath = path.relative(path.dirname(filePath), 'src/types/common');
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
  
  // Add types import
  const importStatement = `import { ${CONFIG.imports['src/types/common'].join(', ')} } from '${importPath.replace(/\\/g, '/')}'`;
  lines.splice(insertIndex, 0, '', importStatement);
  
  return lines.join('\n');
}

/**
 * Replace any types with proper types
 */
function replaceAnyTypes(content) {
  let modified = false;
  let newContent = content;
  
  // Replace specific type mappings
  for (const [anyPattern, properType] of Object.entries(CONFIG.typeMappings)) {
    if (newContent.includes(anyPattern)) {
      newContent = newContent.replace(new RegExp(anyPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), properType);
      modified = true;
      stats.anyTypesReplaced++;
    }
  }
  
  // Replace generic any patterns
  const genericPatterns = [
    // Replace : any with : unknown for simple cases
    { pattern: /:\s*any\b(?!\s*[\[\]])/g, replacement: ': unknown' },
    // Replace : any[] with : unknown[]
    { pattern: /:\s*any\[\]/g, replacement: ': unknown[]' },
    // Replace generic any in function parameters
    { pattern: /<T\s+extends\s+any>/g, replacement: '<T extends unknown>' },
    // Replace any in catch blocks
    { pattern: /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, replacement: 'catch ($1: unknown)' }
  ];
  
  genericPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
      stats.anyTypesReplaced++;
    }
  });
  
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
    
    // Check if file contains any types
    const hasAnyTypes = newContent.includes(': any') || 
                       newContent.includes('any[]') ||
                       newContent.includes('<any>');
    
    if (!hasAnyTypes) {
      return; // No any types to fix
    }
    
    // Replace any types
    const replacementResult = replaceAnyTypes(newContent);
    if (replacementResult.modified) {
      newContent = replacementResult.content;
      modified = true;
    }
    
    // Add types import if needed
    if (modified && !hasTypesImport(newContent)) {
      newContent = addTypesImport(newContent, filePath);
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
  console.log('🚀 Starting TypeScript Any Type Fix Script...\n');
  console.log('This script will fix HIGH PRIORITY ISSUE #6: TypeScript `any` Type Usage\n');
  
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
  console.log(`Any types replaced: ${stats.anyTypesReplaced}`);
  console.log(`Type imports added: ${stats.importsAdded}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
  
  console.log('\n🎉 TypeScript any type fix completed!');
  console.log('\nNext steps:');
  console.log('1. Review the changes in modified files');
  console.log('2. Test the application to ensure type safety');
  console.log('3. Fix any remaining type errors manually');
  console.log('4. Run TypeScript compiler to verify: npx tsc --noEmit');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, replaceAnyTypes, addTypesImport };
