@echo off
REM 🚀 THEE ARCHIVE - Deployment Script (Windows)
REM This script builds the frontend and deploys the backend

echo 🎬 THEE ARCHIVE - Deployment Starting...
echo.

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Installation failed!
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Build frontend
echo 🏗️  Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
echo.

REM Step 3: Deploy backend to Supabase
echo ☁️  Deploying backend to Supabase...
echo Make sure you're logged in to Supabase CLI!
echo.
call supabase functions deploy make-server-4d451974
if errorlevel 1 (
    echo ❌ Backend deployment failed!
    echo Run: supabase login
    pause
    exit /b 1
)
echo ✅ Backend deployed successfully
echo.

REM Step 4: Instructions for Stellar upload
echo 🎉 BUILD COMPLETE!
echo.
echo 📁 Your production files are in: ./dist/
echo.
echo 🌐 Next steps:
echo 1. Login to your Stellar hosting dashboard
echo 2. Go to File Manager
echo 3. Upload ALL files from ./dist/ folder
echo 4. Your site will be LIVE on your custom domain!
echo.
echo ⚠️  Don't forget to:
echo - Replace ad countdowns with Google AdSense code
echo - Upload movies to AWS S3
echo - Add movies via admin portal (click red dot 6x)
echo.
echo 🚀 Ready to go live!
echo.
pause
