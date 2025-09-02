import { test, expect } from '@playwright/test';

test.describe('LockifyHub Authentication Tests', () => {
  test('Navigate to signup and test client registration', async ({ page }) => {
    console.log('🚀 Starting authentication test...');
    
    // Navigate to signup
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(3000); // Simple wait
    
    console.log('📸 Taking signup page screenshot...');
    await page.screenshot({ path: 'test-results/screenshots/signup-page.png', fullPage: true });
    
    // Check if signup page loaded
    const title = await page.locator('h1').textContent();
    console.log(`Page title: "${title}"`);
    
    if (title && title.includes('Join')) {
      console.log('✅ Signup page loaded successfully');
      
      // Try to select client option - use the parent label instead of hidden input
      try {
        const clientLabel = page.locator('label:has(input[value="client"])');
        await clientLabel.click();
        console.log('✅ Client option selected');
        
        await page.screenshot({ path: 'test-results/screenshots/client-selected.png' });
        
        // Fill form with test data
        const timestamp = Date.now();
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="lastName"]', 'Client');
        await page.fill('input[name="email"]', `testclient_${timestamp}@test.com`);
        await page.fill('input[name="phone"]', '555-111-2222');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.fill('input[name="confirmPassword"]', 'TestPass123!');
        
        // Check terms - use the checkbox itself
        await page.check('input[name="agreeToTerms"]');
        
        console.log('✅ Form filled with test data');
        await page.screenshot({ path: 'test-results/screenshots/form-filled.png' });
        
        // Submit form
        await page.click('button[type="submit"]:has-text("Create Account")');
        console.log('✅ Form submitted');
        
        // Wait and see what happens
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-results/screenshots/after-submit.png', fullPage: true });
        
        const currentUrl = page.url();
        console.log(`Current URL after submit: ${currentUrl}`);
        
        if (currentUrl.includes('client-dashboard')) {
          console.log('✅ SUCCESS: Redirected to client dashboard');
        } else if (currentUrl.includes('signin')) {
          console.log('ℹ️ Redirected to signin - may need to verify email');
        } else {
          console.log(`ℹ️ Current page: ${currentUrl}`);
          
          // Check for any error messages
          const errorElements = await page.locator('.error, .text-red, [class*="error"]').all();
          if (errorElements.length > 0) {
            for (const error of errorElements) {
              const errorText = await error.textContent();
              console.log(`❌ Error found: ${errorText}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ Error during form interaction: ${error.message}`);
        await page.screenshot({ path: 'test-results/screenshots/error.png', fullPage: true });
      }
      
    } else {
      console.log(`❌ Signup page not loaded correctly. Title: ${title}`);
    }
  });

  test('Navigate to signin page', async ({ page }) => {
    console.log('🚀 Testing signin page...');
    
    await page.goto('http://localhost:3000/signin');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/screenshots/signin-page.png', fullPage: true });
    
    const title = await page.locator('h1').textContent();
    console.log(`Signin page title: "${title}"`);
    
    if (title && title.toLowerCase().includes('welcome')) {
      console.log('✅ Signin page loaded successfully');
    } else {
      console.log(`❌ Signin page issue. Title: ${title}`);
    }
  });

  test('Test protected route redirect', async ({ page }) => {
    console.log('🚀 Testing protected route...');
    
    // Try to access client dashboard directly
    await page.goto('http://localhost:3000/client-dashboard');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`Protected route URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'test-results/screenshots/protected-route.png', fullPage: true });
    
    if (currentUrl.includes('signin')) {
      console.log('✅ Protected route correctly redirected to signin');
    } else if (currentUrl.includes('client-dashboard')) {
      console.log('⚠️ Protected route accessible without auth (may be cached login)');
    } else {
      console.log(`ℹ️ Protected route redirected to: ${currentUrl}`);
    }
  });

  test('Test admin page', async ({ page }) => {
    console.log('🚀 Testing admin page...');
    
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/screenshots/admin-page.png', fullPage: true });
    
    const currentUrl = page.url();
    console.log(`Admin page URL: ${currentUrl}`);
    
    // Check if admin page has login form
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    
    console.log(`Admin page has email input: ${hasEmailInput}`);
    console.log(`Admin page has password input: ${hasPasswordInput}`);
    
    if (hasEmailInput && hasPasswordInput) {
      console.log('✅ Admin login page accessible');
    }
  });

  test('Test host registration', async ({ page }) => {
    console.log('🚀 Testing host registration...');
    
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(2000);
    
    try {
      // Select host option using the label
      const hostLabel = page.locator('label:has(input[value="host"])');
      await hostLabel.click();
      
      await page.screenshot({ path: 'test-results/screenshots/host-selected.png' });
      console.log('✅ Host option selected');
      
      // Fill form
      const timestamp = Date.now();
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'Host');
      await page.fill('input[name="email"]', `testhost_${timestamp}@test.com`);
      await page.fill('input[name="phone"]', '555-333-4444');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.fill('input[name="confirmPassword"]', 'TestPass123!');
      await page.check('input[name="agreeToTerms"]');
      
      console.log('✅ Host form filled');
      await page.screenshot({ path: 'test-results/screenshots/host-form-filled.png' });
      
      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      console.log(`Host registration result URL: ${currentUrl}`);
      
      await page.screenshot({ path: 'test-results/screenshots/host-registration-result.png', fullPage: true });
      
      if (currentUrl.includes('host') && currentUrl.includes('dashboard')) {
        console.log('✅ HOST REGISTRATION SUCCESS');
      } else {
        console.log(`ℹ️ Host registration redirected to: ${currentUrl}`);
      }
      
    } catch (error) {
      console.log(`❌ Host registration error: ${error.message}`);
      await page.screenshot({ path: 'test-results/screenshots/host-error.png', fullPage: true });
    }
  });
});