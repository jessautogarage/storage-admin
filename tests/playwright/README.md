# LockifyHub Authentication Testing with Playwright

This directory contains comprehensive browser automation tests for the LockifyHub authentication system using Playwright.

## Test Coverage

### 1. Client Registration & Login
- ✅ Register new client account
- ✅ Login with client credentials
- ✅ Verify redirect to client dashboard
- ✅ Form validation testing

### 2. Host Registration & Login
- ✅ Register new host account
- ✅ Login with host credentials
- ✅ Verify redirect to host dashboard
- ✅ Form validation testing

### 3. Admin Login
- ✅ Navigate to admin login page
- ✅ Test admin credentials (if available)
- ✅ Verify admin dashboard access

### 4. Password Reset Flow
- ✅ Navigate to forgot password page
- ✅ Submit password reset request
- ✅ Verify form functionality

### 5. Protected Routes
- ✅ Test unauthorized access to client dashboard
- ✅ Test unauthorized access to host dashboard
- ✅ Verify proper redirects to login

### 6. Role-Based Access Control
- ✅ Client cannot access host routes
- ✅ Host cannot access admin routes
- ✅ Proper role enforcement

### 7. UI & Accessibility
- ✅ Form accessibility attributes
- ✅ Responsive design testing
- ✅ Error message display

## Running Tests

### Prerequisites
1. Make sure the application is running on `http://localhost:3000`
2. Ensure Firebase is properly configured
3. Have test data ready

### Test Commands

```bash
# Install Playwright browsers (first time only)
npm run test:install

# Run all authentication tests
npm run test:auth

# Run tests with browser UI visible
npm run test:headed

# Run tests in debug mode (step through)
npm run test:debug

# View test results report
npm run test:report
```

### Test Data

Tests use dynamically generated email addresses to avoid conflicts:
- Client: `testclient_{timestamp}@test.com`
- Host: `testhost_{timestamp}@test.com`
- Admin: `admin@lockifyhub.com` (if configured)

## Test Results

### Screenshots
All major test steps are automatically screenshotted and saved to:
`test-results/screenshots/`

### Videos
Failed tests automatically record videos saved to:
`test-results/videos/`

### HTML Report
Comprehensive test report with timeline, screenshots, and logs:
`playwright-report/index.html`

## Test Scenarios Covered

### Registration Flow
1. Navigate to signup page
2. Select user type (Client/Host)
3. Fill registration form with test data
4. Submit form and wait for completion
5. Verify successful registration
6. Verify redirect to appropriate dashboard

### Login Flow
1. Navigate to signin page
2. Fill login credentials
3. Submit form
4. Verify successful authentication
5. Verify redirect to correct dashboard

### Error Handling
1. Invalid email format
2. Password mismatch
3. Missing required fields
4. Weak password validation
5. Terms agreement required

### Security Testing
1. Protected route access without authentication
2. Cross-role access attempts
3. Session persistence
4. Logout functionality

## Configuration

### Playwright Config
- Sequential execution (no parallel auth tests)
- Multiple browser support (Chrome, Firefox, Safari)
- Automatic video/screenshot capture on failure
- Built-in retry mechanism

### Test Environment
- Base URL: `http://localhost:3000`
- Timeout: 15 seconds for navigation
- Screenshots: Full page captures
- Network: Wait for idle state

## Debugging

### Common Issues

1. **Test Timeout**: Increase timeout in config or check if app is running
2. **Element Not Found**: Wait for elements to load with `waitForLoadComplete`
3. **Firebase Errors**: Ensure Firebase config is correct and rules allow test operations
4. **Port Conflicts**: Make sure app is running on port 3000

### Debug Tips
- Use `npm run test:debug` for step-by-step debugging
- Check screenshots in `test-results/screenshots/`
- Review browser console logs in test output
- Use `page.pause()` in tests for manual inspection

## Maintenance

### Adding New Tests
1. Follow existing test structure
2. Use utility functions from `test-utils.js`
3. Generate unique test data
4. Take screenshots at key steps
5. Include proper error handling

### Test Data Cleanup
Tests use unique email addresses to avoid conflicts, but you may want to:
1. Clean up Firebase test users periodically
2. Monitor storage usage for screenshots/videos
3. Archive old test results

## Continuous Integration

For CI/CD integration:
```bash
# CI-optimized test run
CI=true npm run test

# Generate JUnit report
npm run test -- --reporter=junit
```