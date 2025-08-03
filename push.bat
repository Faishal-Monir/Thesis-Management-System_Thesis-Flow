@echo off
echo Git Push Automation Script
echo ==========================

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo Error: This is not a git repository.
    echo Please run this script from the root of your git repository.
    echo.
    pause
    exit /b 1
)

REM Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set branch=%%i

echo Current branch: %branch%
echo.

REM Add all changes
echo Adding all changes...
git add .

REM Check if there are changes to commit
git diff-index --quiet HEAD || (
    REM Get commit message from user or use default
    set /p commit_message="Enter commit message (or press Enter for default): "
    
    if "%commit_message%"=="" (
        for /f "tokens=*" %%d in ('date /t') do set datevar=%%d
        for /f "tokens=*" %%t in ('time /t') do set timevar=%%t
        set commit_message=Automated commit - %datevar% %timevar%
    )
    
    REM Commit changes
    echo Committing changes...
    git commit -m "%commit_message%"
    
    if errorlevel 1 (
        echo Error: Failed to commit changes.
        echo Please check your Git status.
        echo.
        pause
        exit /b 1
    )
    
    REM Push to current branch
    echo Pushing to branch '%branch%'...
    git push origin %branch%
    
    if errorlevel 1 (
        echo Error: Failed to push to remote repository.
        echo Please check your internet connection and Git configuration.
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo Success! Changes have been pushed to branch '%branch%'.
) || (
    echo.
    echo No changes to commit.
)

echo.
echo Script completed.
pause
