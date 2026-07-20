@echo off
echo ===================================================
echo   AI Resume Builder - Push to GitHub
echo ===================================================
echo.
echo [1/4] Initializing Git and remote configuration...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/subhashini-2007/AI_Resume_Builder.git
git branch -M main

echo.
echo [2/4] Staging project files...
git add .

echo.
echo [3/4] Committing code checkpoints...
git commit -m "Complete AI Resume Builder App"

echo.
echo [4/4] Pushing to GitHub repository...
echo (If prompted, please log in through the pop-up window)
git push -u origin main

echo.
echo ===================================================
echo   Git push completed!
echo   Go to: https://github.com/subhashini-2007/AI_Resume_Builder
echo   to verify your files are uploaded.
===================================================
pause
