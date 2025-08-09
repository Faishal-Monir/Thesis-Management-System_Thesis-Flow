@echo off
cd /d "D:\CSE-471 Project"
start "Backend" cmd /k "cd /d Thesis-Management-System\backend && node index.js"
start "Frontend" cmd /k "cd /d Thesis-Management-System\frontend && npm start"
echo Launched Backend and Frontend terminals.
pause