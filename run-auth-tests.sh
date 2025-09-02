#!/bin/bash

echo "================================="
echo "LockifyHub Authentication Testing"
echo "================================="
echo

echo "Checking if application is running..."
if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "ERROR: Application is not running on localhost:3000"
    echo "Please start the application with: npm run dev"
    exit 1
fi

echo "✅ Application is running"
echo

echo "Creating test results directory..."
mkdir -p test-results/screenshots

echo
echo "Choose test to run:"
echo "1. Visual Test (Quick screenshots of all pages)"
echo "2. Comprehensive Auth Test (Full registration and login flows)"  
echo "3. Simple Test (Basic functionality check)"
echo "4. All Tests"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Running Visual Test..."
        npx playwright test tests/playwright/minimal-test.spec.js --project=chromium --timeout=20000
        ;;
    2)
        echo "Running Comprehensive Auth Test..."
        npx playwright test tests/playwright/final-auth-test.spec.js --project=chromium --timeout=30000
        ;;
    3)
        echo "Running Simple Test..."
        npx playwright test tests/playwright/auth-simple.spec.js --project=chromium --timeout=30000
        ;;
    4)
        echo "Running All Tests..."
        npx playwright test tests/playwright/ --project=chromium --timeout=30000
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo
echo "================================="
echo "Test completed!"
echo "================================="
echo
echo "Screenshots saved in: test-results/screenshots/"
echo "Test report available: AUTH_TEST_REPORT.md"
echo