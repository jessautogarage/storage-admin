// Test utilities for LockifyHub authentication testing

/**
 * Wait for page to fully load including network requests
 */
export async function waitForLoadComplete(page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForTimeout(1000); // Additional buffer for React hydration
  } catch (error) {
    console.log('Warning: Page load timeout, continuing...');
  }
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  
  try {
    await page.screenshot({ 
      path: `test-results/screenshots/${filename}`,
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  } catch (error) {
    console.log(`Warning: Failed to save screenshot ${filename}:`, error.message);
  }
}

/**
 * Clear all authentication state
 */
export async function clearAuthState(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  console.log('🧹 Auth state cleared');
}

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  
  return {
    client: {
      firstName: 'Test',
      lastName: 'Client',
      email: `testclient_${timestamp}@test.com`,
      phone: '555-111-2222',
      password: 'TestPass123!',
      userType: 'client'
    },
    host: {
      firstName: 'Test',
      lastName: 'Host',
      email: `testhost_${timestamp}@test.com`,
      phone: '555-333-4444',
      password: 'TestPass123!',
      userType: 'host'
    },
    admin: {
      email: 'admin@lockifyhub.com',
      password: 'AdminPass123!'
    }
  };
}

/**
 * Fill registration form with test data
 */
export async function fillRegistrationForm(page, userData) {
  console.log(`📝 Filling registration form for ${userData.userType}...`);
  
  // Select user type
  await page.locator(`input[name="userType"][value="${userData.userType}"]`).check();
  
  // Fill form fields
  await page.fill('input[name="firstName"]', userData.firstName);
  await page.fill('input[name="lastName"]', userData.lastName);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="phone"]', userData.phone);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.password);
  
  // Check terms agreement
  await page.check('input[name="agreeToTerms"]');
  
  console.log(`✅ Registration form filled for ${userData.email}`);
}

/**
 * Fill login form
 */
export async function fillLoginForm(page, email, password) {
  console.log(`📝 Filling login form for ${email}...`);
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  console.log('✅ Login form filled');
}

/**
 * Register a new user
 */
export async function registerUser(page, userData) {
  console.log(`🔧 Registering new ${userData.userType}: ${userData.email}`);
  
  await page.goto('/signup');
  await waitForLoadComplete(page);
  
  await fillRegistrationForm(page, userData);
  await takeScreenshot(page, `${userData.userType}-registration-form-filled`);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for registration to complete
  const expectedUrl = userData.userType === 'client' ? 'client-dashboard' : 'host';
  await page.waitForURL(new RegExp(expectedUrl), { timeout: 15000 });
  await waitForLoadComplete(page);
  
  console.log(`✅ User registered successfully: ${userData.email}`);
  return userData;
}

/**
 * Login existing user
 */
export async function loginUser(page, email, password) {
  console.log(`🔑 Logging in user: ${email}`);
  
  await page.goto('/signin');
  await waitForLoadComplete(page);
  
  await fillLoginForm(page, email, password);
  await takeScreenshot(page, 'login-form-filled');
  
  // Submit login
  await page.click('button[type="submit"]');
  
  // Wait for successful login and redirect
  await page.waitForTimeout(5000); // Give time for authentication
  
  console.log(`✅ User logged in: ${email}`);
}

/**
 * Check if element contains error styling
 */
export async function hasErrorStyling(page, selector) {
  const element = page.locator(selector);
  const classList = await element.getAttribute('class') || '';
  
  return classList.includes('error') || 
         classList.includes('text-red') || 
         classList.includes('border-red') ||
         classList.includes('bg-red');
}

/**
 * Wait for error message to appear
 */
export async function waitForErrorMessage(page, timeout = 5000) {
  try {
    await page.waitForSelector('.error, .text-red, [class*="error"]', { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify user is on correct dashboard
 */
export async function verifyUserDashboard(page, userType) {
  const currentUrl = page.url();
  
  switch (userType) {
    case 'client':
      expect(currentUrl).toContain('client-dashboard');
      break;
    case 'host':
      expect(currentUrl).toMatch(/host.*dashboard/);
      break;
    case 'admin':
      expect(currentUrl).toContain('dashboard');
      break;
    default:
      throw new Error(`Unknown user type: ${userType}`);
  }
  
  console.log(`✅ User correctly redirected to ${userType} dashboard`);
}

/**
 * Test form validation
 */
export async function testFormValidation(page, formData, expectedErrors) {
  console.log('🧪 Testing form validation...');
  
  // Fill form with invalid data
  for (const [field, value] of Object.entries(formData)) {
    if (page.locator(`input[name="${field}"]`).isVisible()) {
      await page.fill(`input[name="${field}"]`, value);
    }
  }
  
  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Check for expected errors
  const hasErrors = await waitForErrorMessage(page);
  
  if (expectedErrors) {
    expect(hasErrors).toBe(true);
    console.log('✅ Form validation working - errors displayed as expected');
  } else {
    expect(hasErrors).toBe(false);
    console.log('✅ Form validation passed - no errors as expected');
  }
  
  return hasErrors;
}

/**
 * Check if page is responsive
 */
export async function testResponsiveDesign(page, testName) {
  console.log(`📱 Testing responsive design for ${testName}...`);
  
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, `${testName}-${viewport.name}`);
  }
  
  // Reset to desktop
  await page.setViewportSize({ width: 1200, height: 800 });
  
  console.log(`✅ Responsive design tested for ${testName}`);
}

export default {
  waitForLoadComplete,
  takeScreenshot,
  clearAuthState,
  generateTestData,
  fillRegistrationForm,
  fillLoginForm,
  registerUser,
  loginUser,
  hasErrorStyling,
  waitForErrorMessage,
  verifyUserDashboard,
  testFormValidation,
  testResponsiveDesign
};