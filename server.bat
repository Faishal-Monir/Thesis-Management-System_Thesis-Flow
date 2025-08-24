@echo off
setlocal enabledelayedexpansion
:: Ask user which to use for Backend
echo Choose how to run the Backend:
echo   1) nodemon (npm run dev)
echo   2) basic node.js (npm start)
set /p choice=Enter 1 or 2: 

if "%choice%"=="1" (
    echo Starting Backend with nodemon...
    start "Backend" cmd /k "cd /d backend && npm run dev"
) else (
    echo Starting Backend with npm start...
    start "Backend" cmd /k "cd /d backend && node index.js"
)

:: Frontend always starts with npm start (adjust if you want a choice here too)
echo Starting Frontend with npm start...
start "Frontend" cmd /k "cd /d frontend && npm start"

echo Launched Backend and Frontend terminals.
pause
endlocal
