@echo off
rem Double-click to start Lock Back on Windows.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org then run this file again.
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules call npm install
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3080/admin"
node launcher.js
pause
