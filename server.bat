@echo off
start "Backend" cmd /k "cd /d backend && node index.js"
start "Frontend" cmd /k "cd /d frontend && npm start"
echo Launched Backend and Frontend terminals.
pause
endlocal