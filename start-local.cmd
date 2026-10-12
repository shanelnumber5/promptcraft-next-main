@echo off
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node server\index.js
) else (
  set ELECTRON_RUN_AS_NODE=1
  "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" server\index.js
)
pause
