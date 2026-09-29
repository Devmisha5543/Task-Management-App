Set-Location -Path $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "1. Staging and Committing Changes..." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
git add .
git commit -m "feat: Implement Task Activity Logs and Due Dates Management across Web and Mobile"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "2. Pushing to GitHub (origin main)..." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Pushed to GitHub successfully!" -ForegroundColor Green
    Write-Host "Shutting down system in 15 seconds... (Run 'shutdown /a' to cancel)" -ForegroundColor Yellow
    shutdown /s /t 15 /c "GitHub push complete. Shutting down system."
} else {
    Write-Host "`n[ERROR] Git push failed. Shutdown aborted." -ForegroundColor Red
}
