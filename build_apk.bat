@echo off
echo ===================================================
echo   AI Resume Builder - APK Builder (No Android Studio)
echo ===================================================
echo.
echo [1/3] Building Next.js frontend assets and syncing to Capacitor...
cd /d "%~dp0\frontend"
call npm run android:build

echo.
echo [2/3] Compiling Android app into APK...
cd /d "%~dp0\frontend\android"
call gradlew.bat assembleDebug

echo.
echo [3/3] Copying APK to project root...
cd /d "%~dp0"
if exist "frontend\android\app\build\outputs\apk\debug\app-debug.apk" (
    copy "frontend\android\app\build\outputs\apk\debug\app-debug.apk" "AI_Resume_Builder.apk" /y
    echo.
    echo ===================================================
    echo   [SUCCESS] APK build complete!
    echo   You can find the APK file in the root folder as:
    echo   AI_Resume_Builder.apk
    echo   
    echo   Simply share this file to your mobile phone (via USB, 
    echo   WhatsApp, Google Drive, etc.) and tap it to install!
    echo ===================================================
    explorer.exe /select,"AI_Resume_Builder.apk"
) else (
    echo.
    echo ===================================================
    echo   [ERROR] Could not find the compiled APK.
    echo   Please check the logs above for build errors.
    echo ===================================================
)
pause
