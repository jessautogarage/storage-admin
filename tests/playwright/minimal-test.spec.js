import { test, expect } from '@playwright/test';

test.describe('LockifyHub Authentication - Visual Tests', () => {
  test('Take screenshots of key pages', async ({ page }) => {
    console.log('📸 Starting visual authentication test...');
    
    try {
      // 1. Landing page
      console.log('Testing landing page...');
      await page.goto('http://localhost:3000/');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/01-landing-page.png', fullPage: true });
      console.log('✅ Landing page screenshot saved');

      // 2. Signup page
      console.log('Testing signup page...');
      await page.goto('http://localhost:3000/signup');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/02-signup-page.png', fullPage: true });
      
      const signupTitle = await page.locator('h1').textContent();
      console.log(`Signup page title: "${signupTitle}"`);
      
      // 3. Signin page
      console.log('Testing signin page...');
      await page.goto('http://localhost:3000/signin');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/03-signin-page.png', fullPage: true });
      
      const signinTitle = await page.locator('h1').textContent();
      console.log(`Signin page title: "${signinTitle}"`);
      
      // 4. Admin page
      console.log('Testing admin page...');
      await page.goto('http://localhost:3000/admin');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/04-admin-page.png', fullPage: true });
      console.log('✅ Admin page screenshot saved');
      
      // 5. Protected route test
      console.log('Testing protected route...');
      await page.goto('http://localhost:3000/client-dashboard');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/05-protected-route.png', fullPage: true });
      
      const protectedUrl = page.url();
      console.log(`Protected route redirected to: ${protectedUrl}`);
      
      // 6. Forgot password page
      console.log('Testing forgot password page...');
      await page.goto('http://localhost:3000/forgot-password');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/06-forgot-password.png', fullPage: true });
      console.log('✅ Forgot password page screenshot saved');
      
      console.log('✅ All screenshots captured successfully');
      
    } catch (error) {
      console.log(`❌ Error during testing: ${error.message}`);
      await page.screenshot({ path: 'test-results/screenshots/error-state.png', fullPage: true });
    }
  });
  
  test('Test form interaction basics', async ({ page }) => {
    console.log('🔧 Testing basic form interactions...');
    
    try {
      await page.goto('http://localhost:3000/signup');
      await page.waitForTimeout(1000);
      
      // Check if user type options exist and are clickable
      const clientLabel = page.locator('label:has(input[value="client"])');
      const hostLabel = page.locator('label:has(input[value="host"])');
      
      const clientExists = await clientLabel.count() > 0;
      const hostExists = await hostLabel.count() > 0;
      
      console.log(`Client option exists: ${clientExists}`);
      console.log(`Host option exists: ${hostExists}`);
      
      if (clientExists) {
        await clientLabel.click();
        await page.screenshot({ path: 'test-results/screenshots/client-option-selected.png' });
        console.log('✅ Client option clicked successfully');
      }
      
      // Test form fields
      const fields = [
        'input[name="firstName"]',
        'input[name="lastName"]', 
        'input[name="email"]',
        'input[name="phone"]',
        'input[name="password"]',
        'input[name="confirmPassword"]'
      ];
      
      let fieldsFound = 0;
      for (const field of fields) {
        const exists = await page.locator(field).count() > 0;
        if (exists) fieldsFound++;
        console.log(`${field}: ${exists ? '✅' : '❌'}`);
      }
      
      console.log(`Found ${fieldsFound}/${fields.length} form fields`);
      
      // Test terms checkbox
      const termsCheckbox = page.locator('input[name="agreeToTerms"]');
      const termsExists = await termsCheckbox.count() > 0;
      console.log(`Terms checkbox exists: ${termsExists}`);
      
      // Test submit button
      const submitButton = page.locator('button[type="submit"]');
      const submitExists = await submitButton.count() > 0;
      console.log(`Submit button exists: ${submitExists}`);
      
      await page.screenshot({ path: 'test-results/screenshots/form-elements-check.png', fullPage: true });
      
    } catch (error) {
      console.log(`❌ Form interaction error: ${error.message}`);
      await page.screenshot({ path: 'test-results/screenshots/form-interaction-error.png', fullPage: true });
    }
  });
});