@echo off
setlocal
cd /d "%~dp0"

echo =======================================================
echo 1. Staging and Committing Changes...
echo =======================================================
git add .
git commit -m "feat: Implement Task Activity Logs and Due Dates Management across Web and Mobile"

echo.
echo =======================================================
echo 2. Pushing to GitHub (origin main)...
echo =======================================================
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo [SUCCESS] Pushed to GitHub successfully!
    echo Initiating system shutdown in 15 seconds...
    echo (To abort shutdown, open a prompt and run: shutdown /a)
    echo =======================================================
    shutdown /s /t 15 /c "GitHub push complete. Shutting down system."
) else (
    echo.
    echo =======================================================
    echo [ERROR] Git push failed. System shutdown cancelled.
    echo Please resolve any Git errors shown above.
    echo =======================================================
    pause
)
