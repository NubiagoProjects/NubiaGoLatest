@echo off
echo ========================================
echo    NubiaGo Vercel Deployment Script
echo ========================================
echo.

REM Colors for output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%✓%NC% %~1
goto :eof

:print_error
echo %RED%✗%NC% %~1
goto :eof

:print_warning
echo %YELLOW%⚠%NC% %~1
goto :eof

echo Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js not found!"
    echo Please install Node.js first from https://nodejs.org/
    pause
    exit /b 1
)
call :print_status "Node.js found"

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    call :print_error "npm not found!"
    echo Please install npm first
    pause
    exit /b 1
)
call :print_status "npm found"

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Vercel CLI not found!"
    echo Installing Vercel CLI...
    npm install -g vercel
    if errorlevel 1 (
        call :print_error "Failed to install Vercel CLI!"
        pause
        exit /b 1
    )
)
call :print_status "Vercel CLI found"

REM Check if logged in to Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    call :print_error "Please login to Vercel first:"
    echo vercel login
    pause
    exit /b 1
)
call :print_status "Logged in to Vercel"
echo.

echo Installing dependencies...
if npm install (
    call :print_status "Dependencies installed successfully"
) else (
    call :print_error "Failed to install dependencies!"
    pause
    exit /b 1
)

echo.
echo Building project...
if npm run build (
    call :print_status "Build completed successfully"
) else (
    call :print_error "Build failed!"
    pause
    exit /b 1
)

echo.
echo Deploying to Vercel...
if vercel --prod (
    echo.
    call :print_status "Deployment completed successfully!"
    echo.
    echo Your NubiaGo app is now live on Vercel!
    echo Check the deployment URL in the output above
) else (
    call :print_error "Deployment failed!"
    pause
    exit /b 1
)

echo.
echo Deployment script completed!
pause
