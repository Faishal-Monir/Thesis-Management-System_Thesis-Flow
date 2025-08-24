@echo off
start "Backend" cmd /k "cd /d backend && npm run dev"
start "Frontend" cmd /k "cd /d frontend && npm start"
echo Launched Backend and Frontend terminals.
pause
endlocal