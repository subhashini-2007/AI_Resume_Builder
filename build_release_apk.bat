@echo off

:: Auto-detect JAVA_HOME from standard Android Studio path if not set
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Android\Android Studio\jbr" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    ) else if exist "C:\Program Files\Android\Android Studio\jre" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    )
)

:: If JAVA_HOME is set, add its bin directory to PATH for keytool/gradlew
if not "%JAVA_HOME%"=="" (
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

echo ===================================================
echo   AI Resume Builder - Release APK Builder
echo ===================================================
echo.

set KEYSTORE_PATH=%~dp0frontend\android\app\release-key.jks
set ALIAS=airesumekey
set PASS=airesumebuilder123

echo [1/4] Verifying signing keystore...
if not exist "%KEYSTORE_PATH%" (
    echo [INFO] Keystore not found. Automatically generating a new release key...
    echo.
    :: Check if keytool is available
    where keytool >nul 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] 'keytool' is not in your system PATH.
        echo Please ensure Java JDK is installed and added to your environment variables.
        echo If you have JDK installed, you can generate the keystore manually using:
        echo keytool -genkeypair -v -keystore "%KEYSTORE_PATH%" -alias %ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %PASS% -keypass %PASS% -dname "CN=Subhashini, O=AI Resume Builder, C=US"
        echo.
        pause
        exit /b 1
    )
    
    :: Generate release keystore
    keytool -genkeypair -v -keystore "%KEYSTORE_PATH%" -alias %ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %PASS% -keypass %PASS% -dname "CN=Subhashini, O=AI Resume Builder, C=US"
    if %errorlevel% equ 0 (
        echo [SUCCESS] Release keystore generated successfully!
    ) else (
        echo [ERROR] Keystore generation failed.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Release keystore already exists.
)

echo.
echo [2/4] Building Next.js frontend assets and syncing to Capacitor...
cd /d "%~dp0frontend"
call npm run android:build

echo.
echo [3/4] Compiling Android release app into signed APK...
cd /d "%~dp0frontend\android"
call gradlew.bat assembleRelease

echo.
echo [4/4] Copying release APK to project root...
cd /d "%~dp0"
if exist "frontend\android\app\build\outputs\apk\release\app-release.apk" (
    copy "frontend\android\app\build\outputs\apk\release\app-release.apk" "AI_Resume_Builder_Release.apk" /y
    echo.
    echo ===================================================
    echo   [SUCCESS] Release APK build complete!
    echo   You can find the signed APK file in the root folder as:
    echo   AI_Resume_Builder_Release.apk
    echo   
    echo   This APK is fully signed and optimized for distribution!
    echo ===================================================
    explorer.exe /select,"AI_Resume_Builder_Release.apk"
) else (
    echo.
    echo ===================================================
    echo   [ERROR] Could not find the compiled release APK.
    echo   Please check the logs above for build errors.
    echo ===================================================
)
pause
