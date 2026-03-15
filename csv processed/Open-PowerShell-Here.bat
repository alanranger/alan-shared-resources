@echo off
cd /d "G:\Dropbox\alan ranger photography\Website Code\Schema Tools"
echo.
echo ========================================
echo   Schema Tools - Build Desktop App
echo ========================================
echo.
echo Project folder: G:\Dropbox\alan ranger photography\Website Code\Schema Tools
echo.
echo ⚽  IMPORTANT: Build output goes to %LOCALAPPDATA%\SchemaTools
echo    (No more Dropbox lock errors!)
echo.
echo Starting build process...
echo.
powershell.exe -NoExit -Command "Set-Location 'G:\Dropbox\alan ranger photography\Website Code\Schema Tools'; Write-Host ''; Write-Host ' Project folder:' -ForegroundColor Green; Write-Host 'G:\Dropbox\alan ranger photography\Website Code\Schema Tools' -ForegroundColor Cyan; Write-Host ''; Write-Host '⚽  If you see EBUSY/locked errors:' -ForegroundColor Red; Write-Host '   Close Dropbox and wait for sync to finish' -ForegroundColor Yellow; Write-Host ''; Write-Host ' Running build command: npm run build:desktop' -ForegroundColor Yellow; Write-Host ''; npm run build:desktop"