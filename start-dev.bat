@echo off
REM Navigate to project directory
cd /d "c:\Users\jinzs\OneDrive\Desktop\EMARAFTA\EFTAXAE-1.worktrees\copilot-worktree-2026-03-25T22-38-18"

REM Check Node.js version
echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm version
echo.
echo Checking npm installation...
npm --version
if errorlevel 1 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

REM Check if node_modules exists
echo.
if not exist node_modules (
    echo Installing dependencies with npm install...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

REM Start the development server
echo.
echo Starting development server...
echo Server will run on http://localhost:3000
echo.
npm run dev

pause
