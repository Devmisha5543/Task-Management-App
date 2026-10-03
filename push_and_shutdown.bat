@echo off
REM Exclude standalone APK build scripts, EAS config, and APK downloads from git tracking
git rm --cached -r -f --ignore-unmatch build_android_apk.* mobile/eas.json client/public/downloads client/app/api/download *.apk >nul 2>&1

REM Stage all files (honoring .gitignore)
git add .

REM Commit all changes except phone APK updates
git commit -m "feat: mobile UI overhaul (Executive Dashboard, My Tasks, Settings), fix task modals, exclude APK builds"

REM Push to remote repository
git push origin main

echo.
echo All mobile UI improvements, modal fixes, and updates pushed to origin main (excluding phone APK updates)!
pause
