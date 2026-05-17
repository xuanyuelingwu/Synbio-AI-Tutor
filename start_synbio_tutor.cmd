@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE="

if exist "%LOCALAPPDATA%\OpenAI\Codex\bin\node.exe" (
  set "NODE_EXE=%LOCALAPPDATA%\OpenAI\Codex\bin\node.exe"
)

if not defined NODE_EXE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not defined NODE_EXE (
  where node >nul 2>nul
  if not errorlevel 1 set "NODE_EXE=node"
)

if not defined NODE_EXE (
  echo Node.js was not found.
  echo Install Node.js, or run this project inside Codex with its bundled runtime.
  pause
  exit /b 1
)

echo Starting SynBio AI Tutor...
echo Open http://localhost:3000 in your browser.
"%NODE_EXE%" "src\server.js"
pause
