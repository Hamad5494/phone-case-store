@echo off
cd /d "%~dp0"
title CaseCraft - starting
echo.
echo ==== Step 1 of 3: installing (needs internet, takes 2-5 minutes) ====
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 goto fail
)
echo.
echo ==== Step 2 of 3: creating the database ====
if not exist prisma\dev.db (
  call npm.cmd run setup
  if errorlevel 1 goto fail
)
echo.
echo ==== Step 3 of 3: starting the website ====
echo Admin panel: http://localhost:3000/admin  (password: admin123)
echo Your browser will open in a few seconds. KEEP THIS WINDOW OPEN while presenting.
start "" cmd /c "timeout /t 10 >nul & start http://localhost:3000"
call npm.cmd run dev
goto end
:fail
echo.
echo SOMETHING WENT WRONG. Take a photo or copy the red text above and send it to Claude.
:end
pause
