@echo off
echo ===================================================
echo   AI Resume Builder - Android Frontend Syncer
echo ===================================================
echo.
echo [1/3] Navigating to frontend directory...
cd /d "%~dp0\frontend"

echo.
echo [2/3] Installing/verifying dependencies...
call npm install

echo.
echo [3/3] Building Next.js static assets and syncing to Android...
call npm run android:build

echo.
echo ===================================================
echo   Sync completed successfully!
echo   Now go back to Android Studio and click Run (Play icon).
echo ===================================================
pause
