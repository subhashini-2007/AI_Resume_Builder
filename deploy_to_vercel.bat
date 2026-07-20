@echo off
echo ===================================================
echo   AI Resume Builder - Deploy to Vercel
echo ===================================================
echo.
echo [1/3] Logging in to Vercel...
echo Please choose "Continue with GitHub" in the browser tab that opens.
echo.
cd frontend
call npx vercel login

echo.
echo [2/3] Linking and deploying project to Vercel...
echo (Answer the questions in the console. Press Enter to select defaults)
echo.
call npx vercel

echo.
echo [3/3] Deploying to Production environment...
echo.
call npx vercel --prod

echo.
echo ===================================================
echo   Deployment finished!
echo   Vercel should now print your production app URL.
echo ===================================================
pause
