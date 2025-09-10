@echo off
echo.
echo ========================================
echo   TYPESCRIPT ANY TYPE FIX SCRIPT
echo ========================================
echo.
echo This script will fix HIGH PRIORITY ISSUE #6:
echo "TypeScript `any` Type Usage"
echo.
echo The script will:
echo - Replace TypeScript any types with proper type definitions
echo - Add proper type imports to files
echo - Improve type safety and reduce runtime errors
echo.
pause

echo.
echo Starting TypeScript any type fix...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Check if scripts directory exists
if not exist "scripts" (
    echo Creating scripts directory...
    mkdir scripts
)

REM Run the fix script
echo Running TypeScript any type fix script...
node scripts/fix-typescript-any.js

echo.
echo ========================================
echo   FIX COMPLETED
echo ========================================
echo.
echo Please review the changes and test your application.
echo.
echo Next steps:
echo 1. Review the changes in modified files
echo 2. Test the application to ensure type safety
echo 3. Fix any remaining type errors manually
echo 4. Run TypeScript compiler to verify: npx tsc --noEmit
echo.
pause
