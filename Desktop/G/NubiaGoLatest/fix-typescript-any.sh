#!/bin/bash

echo
echo "========================================"
echo "  TYPESCRIPT ANY TYPE FIX SCRIPT"
echo "========================================"
echo
echo "This script will fix HIGH PRIORITY ISSUE #6:"
echo "TypeScript \"any\" Type Usage"
echo
echo "The script will:"
echo "- Replace TypeScript any types with proper type definitions"
echo "- Add proper type imports to files"
echo "- Improve type safety and reduce runtime errors"
echo

read -p "Press Enter to continue..."

echo
echo "Starting TypeScript any type fix..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js and try again"
    exit 1
fi

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    echo "Creating scripts directory..."
    mkdir -p scripts
fi

# Make the script executable
chmod +x scripts/fix-typescript-any.js

# Run the fix script
echo "Running TypeScript any type fix script..."
node scripts/fix-typescript-any.js

echo
echo "========================================"
echo "  FIX COMPLETED"
echo "========================================"
echo
echo "Please review the changes and test your application."
echo
echo "Next steps:"
echo "1. Review the changes in modified files"
echo "2. Test the application to ensure type safety"
echo "3. Fix any remaining type errors manually"
echo "4. Run TypeScript compiler to verify: npx tsc --noEmit"
echo
