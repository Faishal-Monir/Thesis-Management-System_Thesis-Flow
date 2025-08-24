endlocal@echo off
start "Backend" cmd /k "cd /d backend && npm install"
start "Frontend" cmd /k "cd /d frontend && npm install"
echo Launched Backend and Frontend terminals.
pause
endlocal