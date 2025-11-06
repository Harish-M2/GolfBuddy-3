// filepath: tests/auth.spec.js
// TEST SUITE 1: AUTHENTICATION & AUTHORIZATION
// Reference: QA_TESTING_GUIDE.md - Test Suite 1

import { test, expect } from '@playwright/test';
import { testAccounts, selectors, timeouts, login } from './helpers/test-data.js';

test.describe('TEST SUITE 1: Authentication & Authorization', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage before each test
    await context.clearCookies();
    await page.goto('/');
  });

  test('1.1 User Registration (Sign Up)', async ({ page }) => {
    const timestamp = Date.now();
    const newUser = {
      email: `qa.tester.${timestamp}@testmail.com`,
      displayName: 'QA Tester New',
      password: 'TestPass123!'
    };

    // Click Sign In button
    await page.click(selectors.auth.signInButton);
    await page.waitForTimeout(500);

    // Switch to Sign Up tab
    await page.click('button:has-text("Sign Up")');
    await page.waitForTimeout(500);

    // Fill registration form
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="displayName"]', newUser.displayName);
    await page.fill('input[name="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for modal to close and check authentication
    await page.waitForTimeout(3000);
    
    // Verify user is logged in - look for Avatar
    const avatarVisible = page.locator('button:has([class*="MuiAvatar-root"])');
    await expect(avatarVisible).toBeVisible({ timeout: timeouts.long });

    // Verify Sign In button is gone
    await expect(page.locator(selectors.auth.signInButton)).not.toBeVisible();
  });

  test('1.2 User Login', async ({ page }) => {
    // Click Sign In button
    await page.click(selectors.auth.signInButton);
    await page.waitForTimeout(500);

    // Fill login form
    await page.fill('input[name="email"]', testAccounts.primary.email);
    await page.fill('input[name="password"]', testAccounts.primary.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for authentication
    await page.waitForTimeout(3000);

    // Verify logged in state - check for Avatar OR Welcome text
    const avatarVisible = page.locator('button:has([class*="MuiAvatar-root"])');
    const welcomeVisible = page.locator('text=/Welcome,/');
    
    // Wait for either avatar or welcome text to appear
    await Promise.race([
      avatarVisible.waitFor({ state: 'visible', timeout: timeouts.long }),
      welcomeVisible.waitFor({ state: 'visible', timeout: timeouts.long })
    ]);

    // Verify Sign In button is gone
    await expect(page.locator(selectors.auth.signInButton)).not.toBeVisible();

    // Verify session persists on reload
    await page.reload();
    await page.waitForTimeout(1000);
    
    // After reload, avatar should be visible
    await expect(avatarVisible).toBeVisible({ timeout: timeouts.long });
  });

  test('1.3 Authentication Protection - Protected Routes', async ({ page }) => {
    const protectedRoutes = [
      '/golf',
      '/buddies', 
      '/chat',
      '/teetimes',
      '/scores',
      '/dashboard'
    ];

    for (const route of protectedRoutes) {
      // Try to access protected route without login
      await page.goto(route);
      await page.waitForTimeout(1000);

      // Should either redirect to home OR show sign in button
      const isRedirected = page.url().includes('/?') || page.url().endsWith('/');
      const hasSignInButton = await page.locator(selectors.auth.signInButton).isVisible();
      
      // One of these should be true (either redirected OR can see sign in)
      expect(isRedirected || hasSignInButton).toBeTruthy();
    }

    // Test successful access after login
    await page.goto('/');
    await page.waitForTimeout(500);
    
    // Login
    await page.click(selectors.auth.signInButton);
    await page.waitForSelector(selectors.auth.emailInput, { timeout: timeouts.medium });
    await page.fill(selectors.auth.emailInput, testAccounts.primary.email);
    await page.fill(selectors.auth.passwordInput, testAccounts.primary.password);
    await page.click(selectors.auth.submitButton);

    // Wait for login success
    const profileIcon = page.locator(selectors.auth.profileIcon);
    await profileIcon.waitFor({ state: 'visible', timeout: timeouts.long });

    // Now try protected route - should work
    await page.goto('/golf');
    await page.waitForTimeout(1000);
    
    // Should stay on /golf and show the page content
    expect(page.url()).toContain('/golf');
    await expect(page.locator(selectors.pageHeadings.golf)).toBeVisible({ timeout: timeouts.medium });
  });

  test('1.4 Sign Out', async ({ page }) => {
    // First login
    await login(page, testAccounts.primary);
    await page.waitForTimeout(1000);

    // Verify logged in
    const avatarButton = page.locator('button:has([class*="MuiAvatar-root"])');
    await expect(avatarButton).toBeVisible();

    // Click profile icon to open menu
    await avatarButton.click();
    await page.waitForTimeout(500);

    // Click Sign Out from the dropdown menu
    await page.click('text="Sign Out"');
    await page.waitForTimeout(1000);

    // Verify signed out - Sign In button should be visible
    await expect(page.locator(selectors.auth.signInButton)).toBeVisible({ timeout: timeouts.medium });

    // Try to access protected route - should redirect or show sign in
    await page.goto('/buddies');
    await page.waitForTimeout(1000);
    
    // Should either be redirected to home or see sign in button
    const isOnHome = page.url().includes('/?') || page.url().endsWith('/');
    const signInVisible = await page.locator(selectors.auth.signInButton).isVisible();
    
    expect(isOnHome || signInVisible).toBeTruthy();
  });

  test('1.5 Invalid Login Credentials', async ({ page }) => {
    await page.click(selectors.auth.signInButton);
    await page.waitForTimeout(500);

    // Try invalid email
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForTimeout(2000);

    // Should still be on auth modal (not logged in)
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Check for error message
    const errorVisible = await page.locator('text=/Invalid|Error|Wrong|incorrect/i').isVisible().catch(() => false);
    expect(errorVisible).toBeTruthy();
  });
});
