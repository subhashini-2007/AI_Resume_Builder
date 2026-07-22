@echo off
echo ===================================================
echo   AI Resume Builder - ADB Port Forwarding Setup
echo ===================================================
echo.
echo Attempting to set up port forwarding to your phone...
echo.

:: Try running with global adb first
adb reverse tcp:5000 tcp:5000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] ADB port forwarding set up successfully using global adb!
    goto end
)

:: Try running from default LocalAppData path
if exist "%LocalAppData%\Android\Sdk\platform-tools\adb.exe" (
    "%LocalAppData%\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
    if not errorlevel 1 (
        echo.
        echo [SUCCESS] ADB port forwarding set up successfully using Android SDK path!
    ) else (
        echo.
        echo [WARNING] Found ADB, but could not forward port. 
        echo Please make sure your phone is connected via USB and USB Debugging is enabled.
    )
    goto end
)

echo [ERROR] Could not find 'adb' on your system PATH or in the default Android SDK location.
echo Please make sure Android Studio / Android SDK is installed.
echo.

:end
echo ===================================================
pause
