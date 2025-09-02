@echo off
echo =================================
echo LockifyHub Authentication Testing
echo =================================
echo.

echo Checking if application is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Application is not running on localhost:3000
    echo Please start the application with: npm run dev
    pause
    exit /b 1
)

echo ✅ Application is running
echo.

echo Creating test results directory...
if not exist "test-results\screenshots" mkdir test-results\screenshots

echo.
echo Choose test to run:
echo 1. Visual Test (Quick screenshots of all pages)
echo 2. Comprehensive Auth Test (Full registration and login flows)  
echo 3. Simple Test (Basic functionality check)
echo 4. All Tests
echo.

set /p choice=Enter your choice (1-4): 

if "%choice%"=="1" (
    echo Running Visual Test...
    npx playwright test tests/playwright/minimal-test.spec.js --project=chromium --timeout=20000
) else if "%choice%"=="2" (
    echo Running Comprehensive Auth Test...
    npx playwright test tests/playwright/final-auth-test.spec.js --project=chromium --timeout=30000
) else if "%choice%"=="3" (
    echo Running Simple Test...
    npx playwright test tests/playwright/auth-simple.spec.js --project=chromium --timeout=30000
) else if "%choice%"=="4" (
    echo Running All Tests...
    npx playwright test tests/playwright/ --project=chromium --timeout=30000
) else (
    echo Invalid choice
    pause
    exit /b 1
)

echo.
echo =================================
echo Test completed!
echo =================================
echo.
echo Screenshots saved in: test-results/screenshots/
echo Test report available: AUTH_TEST_REPORT.md
echo.
pause