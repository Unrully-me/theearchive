@echo off
:: 🔍 THEE ARCHIVE - Deployment Verification Script (Windows)
:: This script verifies that your deployment is working correctly

setlocal enabledelayedexpansion

:: Configuration
set PROJECT_ID=avvwsbiqgtjcwphadypu
set FUNCTION_NAME=make-server-4d451974
set BASE_URL=https://%PROJECT_ID%.supabase.co/functions/v1/%FUNCTION_NAME%

echo.
echo ════════════════════════════════════════════════
echo    🎬 THEE ARCHIVE - Deployment Verifier
echo ════════════════════════════════════════════════
echo.

:: Counter for passed/failed tests
set PASSED=0
set FAILED=0

:: Test Health Check
echo Testing: Health Check
echo    URL: %BASE_URL%/health
curl -s -w "%%{http_code}" -o response.txt "%BASE_URL%/health" > status.txt 2>&1
set /p STATUS=<status.txt
if "%STATUS%"=="200" (
    echo    ✅ Status: 200 OK
    set /a PASSED+=1
) else if "%STATUS%"=="000" (
    echo    ❌ Connection failed - Server not accessible
    echo    ❌ This means the function is NOT deployed
    set /a FAILED+=1
) else (
    echo    ❌ Status: %STATUS%
    set /a FAILED+=1
)
echo.

:: Test Movies Endpoint
echo Testing: Movies Endpoint
echo    URL: %BASE_URL%/movies
curl -s -w "%%{http_code}" -o response.txt "%BASE_URL%/movies" > status.txt 2>&1
set /p STATUS=<status.txt
if "%STATUS%"=="200" (
    echo    ✅ Status: 200 OK
    set /a PASSED+=1
) else (
    echo    ❌ Status: %STATUS%
    set /a FAILED+=1
)
echo.

:: Test GM Posts Endpoint
echo Testing: GM Social Feed
echo    URL: %BASE_URL%/gm-posts
curl -s -w "%%{http_code}" -o response.txt "%BASE_URL%/gm-posts" > status.txt 2>&1
set /p STATUS=<status.txt
if "%STATUS%"=="200" (
    echo    ✅ Status: 200 OK
    set /a PASSED+=1
) else (
    echo    ❌ Status: %STATUS%
    set /a FAILED+=1
)
echo.

:: Clean up temp files
del response.txt 2>nul
del status.txt 2>nul

:: Summary
echo ════════════════════════════════════════════════
echo Test Results Summary
echo ════════════════════════════════════════════════
echo.
echo    Passed: %PASSED%
echo    Failed: %FAILED%
echo.

if %FAILED%==0 (
    echo ════════════════════════════════════════════════
    echo    🎉 ALL TESTS PASSED! Server is running!
    echo ════════════════════════════════════════════════
    echo.
    echo ✅ Your deployment is working correctly!
    echo ✅ You can now build and upload the frontend
    echo.
    echo Next steps:
    echo    1. npm run build
    echo    2. Upload /dist folder to Stellar hosting
    echo    3. Add movies via admin portal
    echo.
) else (
    echo ════════════════════════════════════════════════
    echo    ⚠️  TESTS FAILED - Action Required
    echo ════════════════════════════════════════════════
    echo.
    echo ❌ Server is not accessible or not working properly
    echo.
    echo 🔧 Required Actions:
    echo.
    echo 1. Deploy the Supabase Edge Function:
    echo    supabase login
    echo    supabase link --project-ref %PROJECT_ID%
    echo    supabase functions deploy %FUNCTION_NAME%
    echo.
    echo 2. Set Environment Variables in Supabase Dashboard:
    echo    Navigate to: Edge Functions ^> %FUNCTION_NAME% ^> Settings
    echo    Add these secrets:
    echo    - SUPABASE_URL
    echo    - SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo 3. Wait 30 seconds after deployment, then run this script again
    echo.
    echo 📚 For detailed instructions, see:
    echo    - /DEPLOYMENT_INSTRUCTIONS.md
    echo    - /QUICK_START.md
    echo.
    echo 🧪 Alternative: Open test-server.html in your browser
    echo.
)

pause
