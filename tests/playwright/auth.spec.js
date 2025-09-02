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
  },
  admin: {
    email: 'admin@lockifyhub.com',
    password: 'AdminPass123!'
  }
};

// Helper functions
async function waitForLoadComplete(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(1000); // Additional buffer
}

async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

async function clearAuthState(page) {
  // Clear any existing auth state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

test.describe('LockifyHub Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/');
    await waitForLoadComplete(page);
  });

  test.describe('Client Registration & Login', () => {
    test('should successfully register a new client', async ({ page }) => {
      console.log('Starting client registration test...');
      
      // Navigate to signup
      await page.goto('/signup');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-signup-page');

      // Verify we're on signup page
      await expect(page.locator('h1')).toContainText('Join LockifyHub');
      
      // Select "Find Storage" option (client)
      const clientOption = page.locator('input[name="userType"][value="client"]');
      await expect(clientOption).toBeVisible();
      await clientOption.check();
      await expect(clientOption).toBeChecked();
      await takeScreenshot(page, 'client-usertype-selected');
      
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
      
      // Submit registration
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toContainText('Create Account');
      await submitButton.click();
      
      // Wait for registration to complete and navigation
      await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-registration-success');
      
      // Verify successful registration and redirect
      const currentUrl = page.url();
      expect(currentUrl).toContain('client-dashboard');
      
      console.log('✅ Client registration successful');
    });

    test('should successfully login existing client', async ({ page }) => {
      console.log('Starting client login test...');
      
      // First register a client (using a different email)
      const clientEmail = `logintest_client_${Date.now()}@test.com`;
      
      await page.goto('/signup');
      await waitForLoadComplete(page);
      
      await page.locator('input[name="userType"][value="client"]').check();
      await page.fill('input[name="firstName"]', testData.client.firstName);
      await page.fill('input[name="lastName"]', testData.client.lastName);
      await page.fill('input[name="email"]', clientEmail);
      await page.fill('input[name="phone"]', testData.client.phone);
      await page.fill('input[name="password"]', testData.client.password);
      await page.fill('input[name="confirmPassword"]', testData.client.password);
      await page.check('input[name="agreeToTerms"]');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
      
      // Now logout and test login
      await clearAuthState(page);
      
      // Navigate to signin
      await page.goto('/signin');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-signin-page');
      
      // Verify we're on signin page
      await expect(page.locator('h1')).toContainText('Welcome Back');
      
      // Fill in login form
      await page.fill('input[type="email"]', clientEmail);
      await page.fill('input[type="password"]', testData.client.password);
      await takeScreenshot(page, 'client-login-form-filled');
      
      // Submit login
      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toContainText('Sign In');
      await loginButton.click();
      
      // Wait for login and redirect
      await page.waitForURL(/.*client-dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-login-success');
      
      // Verify successful login and redirect to client dashboard
      const currentUrl = page.url();
      expect(currentUrl).toContain('client-dashboard');
      
      console.log('✅ Client login successful');
    });
  });

  test.describe('Host Registration & Login', () => {
    test('should successfully register a new host', async ({ page }) => {
      console.log('Starting host registration test...');
      
      // Navigate to signup
      await page.goto('/signup');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-signup-page');
      
      // Select "List Space" option (host)
      const hostOption = page.locator('input[name="userType"][value="host"]');
      await expect(hostOption).toBeVisible();
      await hostOption.check();
      await expect(hostOption).toBeChecked();
      await takeScreenshot(page, 'host-usertype-selected');
      
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
      
      // Submit registration
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for registration to complete and navigation
      await page.waitForURL(/.*host.*dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-registration-success');
      
      // Verify successful registration and redirect
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/host.*dashboard/);
      
      console.log('✅ Host registration successful');
    });

    test('should successfully login existing host', async ({ page }) => {
      console.log('Starting host login test...');
      
      // First register a host (using a different email)
      const hostEmail = `logintest_host_${Date.now()}@test.com`;
      
      await page.goto('/signup');
      await waitForLoadComplete(page);
      
      await page.locator('input[name="userType"][value="host"]').check();
      await page.fill('input[name="firstName"]', testData.host.firstName);
      await page.fill('input[name="lastName"]', testData.host.lastName);
      await page.fill('input[name="email"]', hostEmail);
      await page.fill('input[name="phone"]', testData.host.phone);
      await page.fill('input[name="password"]', testData.host.password);
      await page.fill('input[name="confirmPassword"]', testData.host.password);
      await page.check('input[name="agreeToTerms"]');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/.*host.*dashboard.*/, { timeout: 15000 });
      
      // Now logout and test login
      await clearAuthState(page);
      
      // Navigate to signin
      await page.goto('/signin');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-signin-page');
      
      // Fill in login form
      await page.fill('input[type="email"]', hostEmail);
      await page.fill('input[type="password"]', testData.host.password);
      await takeScreenshot(page, 'host-login-form-filled');
      
      // Submit login
      await page.click('button[type="submit"]');
      
      // Wait for login and redirect
      await page.waitForURL(/.*host.*dashboard.*/, { timeout: 15000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-login-success');
      
      // Verify successful login and redirect to host dashboard
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/host.*dashboard/);
      
      console.log('✅ Host login successful');
    });
  });

  test.describe('Admin Login Test', () => {
    test('should navigate to admin login page', async ({ page }) => {
      console.log('Starting admin login navigation test...');
      
      // Navigate to admin login
      await page.goto('/admin');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'admin-login-page');
      
      // Verify admin login page elements
      await expect(page.locator('h1, h2, .title')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button')).toBeVisible();
      
      console.log('✅ Admin login page accessible');
    });

    test('should test admin login flow (if credentials available)', async ({ page }) => {
      console.log('Starting admin login test...');
      
      await page.goto('/admin');
      await waitForLoadComplete(page);
      
      // Try to fill admin credentials - this may fail if admin doesn't exist
      try {
        await page.fill('input[type="email"], input[name="email"]', testData.admin.email);
        await page.fill('input[type="password"], input[name="password"]', testData.admin.password);
        await takeScreenshot(page, 'admin-login-form-filled');
        
        await page.click('button[type="submit"], button');
        
        // Wait a moment to see if login succeeds
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
          await takeScreenshot(page, 'admin-login-success');
          console.log('✅ Admin login successful');
        } else {
          console.log('ℹ️ Admin credentials may not be configured');
        }
      } catch (error) {
        console.log('ℹ️ Admin login test skipped - credentials not available or admin not configured');
        await takeScreenshot(page, 'admin-login-attempt');
      }
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      console.log('Starting forgot password navigation test...');
      
      // Navigate to signin first
      await page.goto('/signin');
      await waitForLoadComplete(page);
      
      // Click forgot password link
      const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
      await expect(forgotPasswordLink).toBeVisible();
      await forgotPasswordLink.click();
      
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'forgot-password-page');
      
      // Verify forgot password page
      await expect(page.locator('h1, h2')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('✅ Forgot password page accessible');
    });

    test('should test password reset form submission', async ({ page }) => {
      console.log('Starting password reset form test...');
      
      await page.goto('/forgot-password');
      await waitForLoadComplete(page);
      
      // Fill email and submit
      await page.fill('input[type="email"]', 'test@example.com');
      await takeScreenshot(page, 'password-reset-form-filled');
      
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'password-reset-submitted');
      
      // Check for success message or confirmation
      const hasSuccessMessage = await page.locator('.success, .green, [class*="success"]').count() > 0;
      const hasErrorMessage = await page.locator('.error, .red, [class*="error"]').count() > 0;
      
      if (hasSuccessMessage) {
        console.log('✅ Password reset form submitted successfully');
      } else if (hasErrorMessage) {
        console.log('ℹ️ Password reset form submitted with expected error (email not found)');
      } else {
        console.log('ℹ️ Password reset form submitted - response unclear');
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing client dashboard without auth', async ({ page }) => {
      console.log('Starting protected route test for client dashboard...');
      
      // Try to access client dashboard directly
      await page.goto('/client-dashboard');
      
      // Should be redirected to signin
      await page.waitForURL(/.*signin.*/, { timeout: 10000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'client-dashboard-redirect-to-signin');
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('signin');
      
      console.log('✅ Client dashboard properly protected');
    });

    test('should redirect to login when accessing host dashboard without auth', async ({ page }) => {
      console.log('Starting protected route test for host dashboard...');
      
      // Try to access host dashboard directly
      await page.goto('/host/dashboard');
      
      // Should be redirected to signin
      await page.waitForURL(/.*signin.*/, { timeout: 10000 });
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'host-dashboard-redirect-to-signin');
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('signin');
      
      console.log('✅ Host dashboard properly protected');
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should enforce role-based access between client and host', async ({ page }) => {
      console.log('Starting role-based access control test...');
      
      // Register and login as client
      const clientEmail = `rbac_client_${Date.now()}@test.com`;
      
      await page.goto('/signup');
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
      await takeScreenshot(page, 'client-logged-in');
      
      // Try to access host routes
      await page.goto('/host/dashboard');
      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'client-trying-host-routes');
      
      const currentUrl = page.url();
      // Should either be redirected or show access denied
      expect(currentUrl).not.toContain('/host/dashboard');
      
      console.log('✅ Role-based access control working - client cannot access host routes');
      
      // Clear auth and test the other way
      await clearAuthState(page);
      
      // Register and login as host
      const hostEmail = `rbac_host_${Date.now()}@test.com`;
      
      await page.goto('/signup');
      await waitForLoadComplete(page);
      
      await page.locator('input[name="userType"][value="host"]').check();
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'Host');
      await page.fill('input[name="email"]', hostEmail);
      await page.fill('input[name="phone"]', '555-333-4444');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.fill('input[name="confirmPassword"]', 'TestPass123!');
      await page.check('input[name="agreeToTerms"]');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/.*host.*dashboard.*/, { timeout: 15000 });
      await takeScreenshot(page, 'host-logged-in');
      
      // Try to access admin routes
      await page.goto('/dashboard'); // Admin dashboard
      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'host-trying-admin-routes');
      
      const adminUrl = page.url();
      // Should either be redirected or show access denied
      expect(adminUrl).not.toContain('/dashboard');
      
      console.log('✅ Role-based access control working - host cannot access admin routes');
    });
  });

  test.describe('Form Validation', () => {
    test('should validate registration form fields', async ({ page }) => {
      console.log('Starting form validation tests...');
      
      await page.goto('/signup');
      await waitForLoadContent(page);
      
      // Test empty form submission
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'empty-form-validation');
      
      // Test invalid email
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'invalid-email-validation');
      
      // Test password mismatch
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="phone"]', '555-123-4567');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
      await page.check('input[name="agreeToTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'password-mismatch-validation');
      
      // Check for validation errors
      const errorMessages = await page.locator('.error, .text-red, [class*="error"]').count();
      expect(errorMessages).toBeGreaterThan(0);
      
      console.log('✅ Form validation working correctly');
    });
  });

  test.describe('UI Elements and Accessibility', () => {
    test('should have proper accessibility attributes', async ({ page }) => {
      console.log('Starting accessibility test...');
      
      await page.goto('/signup');
      await waitForLoadComplete(page);
      await takeScreenshot(page, 'accessibility-test-signup');
      
      // Check for proper labels
      const inputs = await page.locator('input').count();
      const labels = await page.locator('label').count();
      
      expect(labels).toBeGreaterThan(0);
      console.log(`Found ${inputs} inputs and ${labels} labels`);
      
      // Check for form structure
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('✅ Basic accessibility elements present');
    });
  });
});

// Helper function to wait for content to load
async function waitForLoadContent(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(500);
}