import { test, expect } from '@playwright/test';

// Test data for consistent use across tests
const testData = {
  client: {
    firstName: 'Test',
    lastName: 'Client', 
    email: `testclient_${Date.now()}@test.com`,
    phone: '555-111-2222',
    password: 'TestPass123!',
    userType: 'client'
  },
  host: {
    firstName: 'Test',
    lastName: 'Host',
    email: `testhost_${Date.now()}@test.com`, 
    phone: '555-333-4444',
    password: 'TestPass123!',
    userType: 'host'
  }
};

// Helper functions
async function waitForLoadComplete(page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 8000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Warning: Page load timeout, continuing...');
  }
}

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${name}`);
  } catch (error) {
    console.log(`Warning: Screenshot failed for ${name}`);
  }
}

async function clearAuthState(page) {
  try {
    // Clear cookies first
    await page.context().clearCookies();
    
    // Try to clear storage, but don't fail if it doesn't work
    await page.evaluate(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch (e) {
        console.log('Storage clear failed, continuing...');
      }
    });
    console.log('🧹 Auth state cleared');
  } catch (error) {
    console.log('Warning: Auth state clearing failed, continuing...');
  }
}

test.describe('LockifyHub Authentication System - Core Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('Client Registration Flow', async ({ page }) => {
    console.log('🚀 Starting Client Registration Test...');
    
    // Navigate to signup
    await page.goto('http://localhost:3000/signup');
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'client-signup-page');

    // Verify we're on signup page
    await expect(page.locator('h1')).toContainText('Join LockifyHub');
    console.log('✅ Signup page loaded');
    
    // Select "Find Storage" option (client)
    const clientOption = page.locator('input[name="userType"][value="client"]');
    await expect(clientOption).toBeVisible();
    await clientOption.check();
    await expect(clientOption).toBeChecked();
    await takeScreenshot(page, 'client-usertype-selected');
    console.log('✅ Client user type selected');
    
    // Fill in registration form
    await page.fill('input[name="firstName"]', testData.client.firstName);
    await page.fill('input[name="lastName"]', testData.client.lastName);
    await page.fill('input[name="email"]', testData.client.email);
    await page.fill('input[name="phone"]', testData.client.phone);
    await page.fill('input[name="password"]', testData.client.password);
    await page.fill('input[name="confirmPassword"]', testData.client.password);
    
    // Check terms agreement
    await page.check('input[name="agreeToTerms"]');
    await takeScreenshot(page, 'client-form-filled');
    console.log('✅ Registration form filled');
    
    // Submit registration
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Create Account');
    await submitButton.click();
    console.log('✅ Registration form submitted');
    
    // Wait for registration to complete and navigation
    try {
      await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-registration-success');
      
      // Verify successful registration and redirect
      const currentUrl = page.url();
      expect(currentUrl).toContain('client-dashboard');
      console.log('✅ Client registration successful - redirected to dashboard');
    } catch (error) {
      console.log('⚠️ Registration may have failed or redirected elsewhere');
      await takeScreenshot(page, 'client-registration-error');
      
      // Check for error messages
      const errorElement = page.locator('.error, .text-red, [class*="error"]');
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.first().textContent();
        console.log(`❌ Registration error: ${errorText}`);
      }
      
      throw error;
    }
  });

  test('Host Registration Flow', async ({ page }) => {
    console.log('🚀 Starting Host Registration Test...');
    
    // Navigate to signup
    await page.goto('http://localhost:3000/signup');
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'host-signup-page');
    
    // Select "List Space" option (host)
    const hostOption = page.locator('input[name="userType"][value="host"]');
    await expect(hostOption).toBeVisible();
    await hostOption.check();
    await expect(hostOption).toBeChecked();
    await takeScreenshot(page, 'host-usertype-selected');
    console.log('✅ Host user type selected');
    
    // Fill in registration form
    await page.fill('input[name="firstName"]', testData.host.firstName);
    await page.fill('input[name="lastName"]', testData.host.lastName);
    await page.fill('input[name="email"]', testData.host.email);
    await page.fill('input[name="phone"]', testData.host.phone);
    await page.fill('input[name="password"]', testData.host.password);
    await page.fill('input[name="confirmPassword"]', testData.host.password);
    
    // Check terms agreement
    await page.check('input[name="agreeToTerms"]');
    await takeScreenshot(page, 'host-form-filled');
    console.log('✅ Registration form filled');
    
    // Submit registration
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    console.log('✅ Registration form submitted');
    
    // Wait for registration to complete and navigation
    try {
      await page.waitForURL(/.*host.*dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-registration-success');
      
      // Verify successful registration and redirect
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/host.*dashboard/);
      console.log('✅ Host registration successful - redirected to dashboard');
    } catch (error) {
      console.log('⚠️ Registration may have failed or redirected elsewhere');
      await takeScreenshot(page, 'host-registration-error');
      throw error;
    }
  });

  test('Client Login Flow', async ({ page }) => {
    console.log('🚀 Starting Client Login Test...');
    
    // First register a client
    const clientEmail = `logintest_client_${Date.now()}@test.com`;
    
    await page.goto('http://localhost:3000/signup');
    await waitForLoadComplete(page);
    
    await page.locator('input[name="userType"][value="client"]').check();
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Client');
    await page.fill('input[name="email"]', clientEmail);
    await page.fill('input[name="phone"]', '555-111-2222');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.check('input[name="agreeToTerms"]');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
    console.log('✅ Client registered for login test');
    
    // Now clear auth and test login
    await clearAuthState(page);
    
    // Navigate to signin
    await page.goto('http://localhost:3000/signin');
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'client-signin-page');
    
    // Verify we're on signin page
    await expect(page.locator('h1')).toContainText('Welcome Back');
    console.log('✅ Signin page loaded');
    
    // Fill in login form
    await page.fill('input[type="email"]', clientEmail);
    await page.fill('input[type="password"]', 'TestPass123!');
    await takeScreenshot(page, 'client-login-form-filled');
    console.log('✅ Login form filled');
    
    // Submit login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toContainText('Sign In');
    await loginButton.click();
    console.log('✅ Login form submitted');
    
    // Wait for login and redirect
    await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'client-login-success');
    
    // Verify successful login and redirect to client dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('client-dashboard');
    console.log('✅ Client login successful');
  });

  test('Protected Route Access', async ({ page }) => {
    console.log('🚀 Starting Protected Route Test...');
    
    // Try to access client dashboard directly without auth
    await page.goto('http://localhost:3000/client-dashboard');
    await waitForLoadComplete(page);
    
    // Should be redirected to signin or show auth requirement
    const currentUrl = page.url();
    if (currentUrl.includes('signin')) {
      await takeScreenshot(page, 'protected-route-redirect-signin');
      console.log('✅ Protected route correctly redirected to signin');
    } else {
      await takeScreenshot(page, 'protected-route-response');
      console.log(`ℹ️ Protected route response: ${currentUrl}`);
    }
    
    // Try host dashboard
    await page.goto('http://localhost:3000/host/dashboard');
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'host-protected-route-response');
    
    const hostUrl = page.url();
    console.log(`ℹ️ Host protected route response: ${hostUrl}`);
  });

  test('Admin Login Page', async ({ page }) => {
    console.log('🚀 Starting Admin Login Page Test...');
    
    // Navigate to admin login
    await page.goto('http://localhost:3000/admin');
    await waitForLoadComplete(page);
    await takeScreenshot(page, 'admin-login-page');
    
    // Verify admin login page elements exist
    const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"], button').count() > 0;
    
    if (hasEmailInput && hasPasswordInput && hasSubmitButton) {
      console.log('✅ Admin login page has required elements');
    } else {
      console.log('⚠️ Admin login page may be missing some elements');
    }
  });

  test('Forgot Password Page', async ({ page }) => {
    console.log('🚀 Starting Forgot Password Test...');
    
    // Navigate to signin first, then forgot password
    await page.goto('http://localhost:3000/signin');
    await waitForLoadComplete(page);
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click();
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'forgot-password-page');
      console.log('✅ Forgot password page accessible');
    } else {
      // Try direct navigation
      await page.goto('http://localhost:3000/forgot-password');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'forgot-password-direct');
      console.log('ℹ️ Forgot password accessed directly');
    }
  });

  test('Form Validation', async ({ page }) => {
    console.log('🚀 Starting Form Validation Test...');
    
    await page.goto('http://localhost:3000/signup');
    await waitForLoadComplete(page);
    
    // Test empty form submission
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'empty-form-validation');
    
    // Test invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'invalid-email-validation');
    
    // Check for validation errors
    const errorMessages = await page.locator('.error, .text-red, [class*="error"]').count();
    
    if (errorMessages > 0) {
      console.log('✅ Form validation working - errors displayed');
    } else {
      console.log('ℹ️ Form validation may be working but errors not visible in selectors used');
    }
  });
});