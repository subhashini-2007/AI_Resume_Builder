@echo off
echo ===================================================
echo   AI Resume Builder - Self-Healing Launcher
echo ===================================================
echo.
echo [1/2] Launching Backend Express API Server...
start "AI Resume Builder - Backend API" cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting Backend Server... && npm run dev"

echo.
echo [2/2] Launching Frontend Next.js Client Web App...
start "AI Resume Builder - Frontend client" cmd /k "cd frontend && echo Restoring default Next.js SWC compiler... && del /f /q .babelrc 2>nul && echo Cleaning compile caches... && rmdir /s /q .next 2>nul && echo Wiping node_modules to fix SWC architecture mismatch... && rmdir /s /q node_modules 2>nul && echo Installing fresh dependencies... && npm install && echo Starting Frontend Client... && npm run dev"

echo.
echo ===================================================
echo   Launch commands sent!
echo   A fresh installation is starting in the frontend window.
echo   - Backend API: http://localhost:5000
echo   - Frontend Client: http://localhost:3000
echo ===================================================
pause
