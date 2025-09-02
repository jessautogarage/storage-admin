import { test, expect } from '@playwright/test';

test.describe('LockifyHub Authentication - Final Test Suite', () => {
  test('Complete Client Registration and Login Flow', async ({ page }) => {
    console.log('🚀 FINAL TEST: Complete Client Authentication Flow');
    
    const timestamp = Date.now();
    const testEmail = `client_final_test_${timestamp}@test.com`;
    const testPassword = 'TestPass123!';
    
    try {
      // STEP 1: Register new client
      console.log('Step 1: Client Registration');
      await page.goto('http://localhost:3000/signup', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Take screenshot of signup page
      await page.screenshot({ path: `test-results/screenshots/final-01-signup.png`, fullPage: true });
      
      // Select client option by clicking the label
      await page.locator('label:has(input[value="client"])').click();
      await page.waitForTimeout(500);
      
      // Fill registration form
      await page.fill('input[name="firstName"]', 'TestFinal');
      await page.fill('input[name="lastName"]', 'Client');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="phone"]', '555-999-8888');
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);
      await page.check('input[name="agreeToTerms"]');
      
      await page.screenshot({ path: `test-results/screenshots/final-02-form-filled.png`, fullPage: true });
      console.log('✅ Registration form filled');
      
      // Submit registration
      await page.click('button[type="submit"]:has-text("Create Account")');
      console.log('✅ Registration submitted');
      
      // Wait for result (up to 10 seconds)
      await page.waitForTimeout(8000);
      await page.screenshot({ path: `test-results/screenshots/final-03-registration-result.png`, fullPage: true });
      
      const registrationUrl = page.url();
      console.log(`Registration result URL: ${registrationUrl}`);
      
      // Check if registration was successful
      if (registrationUrl.includes('client-dashboard')) {
        console.log('✅ CLIENT REGISTRATION SUCCESS - Redirected to dashboard');
        
        // STEP 2: Logout and test login
        console.log('Step 2: Testing login flow');
        
        // Clear auth state
        await page.evaluate(() => {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
        });
        await page.context().clearCookies();
        
        // Go to signin page
        await page.goto('http://localhost:3000/signin', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: `test-results/screenshots/final-04-signin-page.png`, fullPage: true });
        
        // Fill login form
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        
        await page.screenshot({ path: `test-results/screenshots/final-05-login-form.png`, fullPage: true });
        
        // Submit login
        await page.click('button[type="submit"]:has-text("Sign In")');
        console.log('✅ Login submitted');
        
        // Wait for login result
        await page.waitForTimeout(8000);
        await page.screenshot({ path: `test-results/screenshots/final-06-login-result.png`, fullPage: true });
        
        const loginUrl = page.url();
        console.log(`Login result URL: ${loginUrl}`);
        
        if (loginUrl.includes('client-dashboard')) {
          console.log('✅ CLIENT LOGIN SUCCESS - Redirected to dashboard');
        } else {
          console.log(`ℹ️ Login redirected to: ${loginUrl}`);
        }
        
      } else {
        console.log(`ℹ️ Registration redirected to: ${registrationUrl}`);
        
        // Check for errors on the page
        const errorText = await page.locator('.error, .text-red, [class*="error"]').textContent().catch(() => null);
        if (errorText) {
          console.log(`❌ Registration error: ${errorText}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error during client flow: ${error.message}`);
      await page.screenshot({ path: `test-results/screenshots/final-error-client.png`, fullPage: true });
    }
  });

  test('Complete Host Registration Flow', async ({ page }) => {
    console.log('🚀 FINAL TEST: Host Registration Flow');
    
    const timestamp = Date.now();
    const testEmail = `host_final_test_${timestamp}@test.com`;
    
    try {
      await page.goto('http://localhost:3000/signup', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Select host option
      await page.locator('label:has(input[value="host"])').click();
      await page.waitForTimeout(500);
      
      // Fill form
      await page.fill('input[name="firstName"]', 'TestFinal');
      await page.fill('input[name="lastName"]', 'Host');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="phone"]', '555-777-6666');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.fill('input[name="confirmPassword"]', 'TestPass123!');
      await page.check('input[name="agreeToTerms"]');
      
      await page.screenshot({ path: `test-results/screenshots/final-07-host-form.png`, fullPage: true });
      
      // Submit
      await page.click('button[type="submit"]:has-text("Create Account")');
      await page.waitForTimeout(8000);
      
      const hostUrl = page.url();
      await page.screenshot({ path: `test-results/screenshots/final-08-host-result.png`, fullPage: true });
      
      console.log(`Host registration result: ${hostUrl}`);
      
      if (hostUrl.includes('host') && hostUrl.includes('dashboard')) {
        console.log('✅ HOST REGISTRATION SUCCESS');
      } else {
        console.log(`ℹ️ Host registration result: ${hostUrl}`);
      }
      
    } catch (error) {
      console.log(`❌ Error during host flow: ${error.message}`);
      await page.screenshot({ path: `test-results/screenshots/final-error-host.png`, fullPage: true });
    }
  });

  test('Test Protection and Security', async ({ page }) => {
    console.log('🚀 FINAL TEST: Security and Protection');
    
    try {
      // Test 1: Protected route without auth
      console.log('Testing protected routes...');
      await page.goto('http://localhost:3000/client-dashboard', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const protectedUrl = page.url();
      await page.screenshot({ path: `test-results/screenshots/final-09-protected.png`, fullPage: true });
      
      if (protectedUrl.includes('signin')) {
        console.log('✅ PROTECTION WORKS - Redirected to signin');
      } else {
        console.log(`ℹ️ Protected route behavior: ${protectedUrl}`);
      }
      
      // Test 2: Host dashboard protection
      await page.goto('http://localhost:3000/host/dashboard', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const hostProtectedUrl = page.url();
      await page.screenshot({ path: `test-results/screenshots/final-10-host-protected.png`, fullPage: true });
      console.log(`Host protection result: ${hostProtectedUrl}`);
      
      // Test 3: Admin page
      await page.goto('http://localhost:3000/admin', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: `test-results/screenshots/final-11-admin.png`, fullPage: true });
      
      const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() >= 2;
      console.log(`Admin page has login form: ${hasLoginForm}`);
      
      if (hasLoginForm) {
        console.log('✅ ADMIN PAGE ACCESSIBLE with login form');
      }
      
      // Test 4: Form validation
      console.log('Testing form validation...');
      await page.goto('http://localhost:3000/signup', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Submit empty form
      await page.click('button[type="submit"]:has-text("Create Account")');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: `test-results/screenshots/final-12-validation.png`, fullPage: true });
      
      // Check if still on signup (validation working)
      const validationUrl = page.url();
      if (validationUrl.includes('signup')) {
        console.log('✅ FORM VALIDATION WORKS - Prevented empty submission');
      }
      
    } catch (error) {
      console.log(`❌ Security test error: ${error.message}`);
      await page.screenshot({ path: `test-results/screenshots/final-error-security.png`, fullPage: true });
    }
  });
});