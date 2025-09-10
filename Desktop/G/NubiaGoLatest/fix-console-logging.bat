@echo off
echo.
echo ========================================
echo   CONSOLE LOGGING FIX SCRIPT
echo ========================================
echo.
echo This script will fix HIGH PRIORITY ISSUE #5:
echo "Extensive Console Logging in Production"
echo.
echo The script will:
echo - Replace console.log statements with production-safe logger
echo - Add proper logger imports to files
echo - Ensure logging only occurs in development/test environments
echo.
pause

echo.
echo Starting console logging fix...
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
echo Running console logging fix script...
node scripts/fix-console-logging.js

echo.
echo ========================================
echo   FIX COMPLETED
echo ========================================
echo.
echo Please review the changes and test your application.
echo.
echo Environment variables you can set:
echo - ENABLE_LOGGING=true (enables all logging in production)
echo - ENABLE_DEBUG_LOGS=true (enables debug logs in development)
echo.
pause
