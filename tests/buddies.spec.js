// filepath: tests/buddies.spec.js
// TEST SUITE 3: BUDDY FINDER & MANAGEMENT
// Reference: QA_TESTING_GUIDE.md - Test Suite 3

import { test, expect } from '@playwright/test';
import { testAccounts, selectors, timeouts, urls, login, navigateToPage } from './helpers/test-data.js';

test.describe('TEST SUITE 3: Buddy Finder & Management', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(urls.production);
    await login(page, testAccounts.primary);
    
    // Navigate to My Buddies page
    await navigateToPage(page, 'buddies');
    await page.waitForTimeout(1000);
  });

  test('3.1 View My Buddies List', async ({ page }) => {
    // Verify page loaded with correct heading
    await expect(page.locator(selectors.pageHeadings.buddies)).toBeVisible({ timeout: timeouts.long });

    // Navigate to "My Buddies" tab (tab index 1)
    const myBuddiesTab = page.locator('button:has-text("My Buddies"), [role="tab"]:has-text("My Buddies")').first();
    if (await myBuddiesTab.isVisible()) {
      await myBuddiesTab.click();
      await page.waitForTimeout(1000);
    }

    // Check for buddies list or empty state
    const hasBuddies = await page.locator('[data-testid*="buddy"], .buddy-card').first().isVisible({ timeout: timeouts.short }).catch(() => false);
    const emptyState = await page.locator('text=/no buddies yet|start connecting/i').first().isVisible().catch(() => false);

    expect(hasBuddies || emptyState).toBeTruthy();
  });

  test('3.2 Search for Buddies', async ({ page }) => {
    // Look for search or "Find Buddies" button
    const findBuddiesButton = page.locator('button:has-text("Find Buddies"), button:has-text("Add Buddy"), button:has-text("Search")').first();
    
    if (await findBuddiesButton.isVisible()) {
      await findBuddiesButton.click();
      await page.waitForTimeout(1000);

      // Verify search interface
      await expect(page.locator('input[type="search"], input[placeholder*="Search"]')).toBeVisible({ timeout: timeouts.medium });

      // Search for test user
      await page.fill('input[type="search"], input[placeholder*="Search"]', testAccounts.buddy.displayName);
      await page.waitForTimeout(1000);

      // Verify results
      const results = page.locator(`text="${testAccounts.buddy.displayName}"`);
      await expect(results.first()).toBeVisible({ timeout: timeouts.medium });
    }
  });

  test('3.3 Send Buddy Request', async ({ page }) => {
    // Navigate to find buddies
    const findBuddiesButton = page.locator('button:has-text("Find Buddies"), button:has-text("Add Buddy")').first();
    
    if (await findBuddiesButton.isVisible()) {
      await findBuddiesButton.click();
      await page.waitForTimeout(1000);

      // Search for buddy
      await page.fill('input[type="search"], input[placeholder*="Search"]', testAccounts.buddy.displayName);
      await page.waitForTimeout(1000);

      // Click add buddy button
      const addButton = page.locator('button:has-text("Add"), button:has-text("Send Request")').first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);

        // Verify success message or button state change
        const pending = await page.locator('button:has-text("Pending"), text=/request sent/i').first().isVisible({ timeout: timeouts.medium });
        expect(pending).toBeTruthy();
      }
    }
  });

  test('3.4 View Pending Buddy Requests', async ({ page }) => {
    // Look for "Requests" or "Pending" tab
    const requestsTab = page.locator('button:has-text("Requests"), button:has-text("Pending"), [role="tab"]:has-text("Requests")').first();
    
    if (await requestsTab.isVisible()) {
      await requestsTab.click();
      await page.waitForTimeout(1000);

      // Verify requests list or empty state
      const hasRequests = await page.locator('[data-testid*="request"], .request-card').first().isVisible({ timeout: timeouts.short }).catch(() => false);
      const emptyState = await page.locator('text=/no pending|no requests/i').first().isVisible().catch(() => false);

      expect(hasRequests || emptyState).toBeTruthy();
    }
  });

  test('3.5 Accept Buddy Request', async ({ page }) => {
    // Look for requests tab
    const requestsTab = page.locator('button:has-text("Requests"), [role="tab"]:has-text("Requests")').first();
    
    if (await requestsTab.isVisible()) {
      await requestsTab.click();
      await page.waitForTimeout(1000);

      // Look for accept button
      const acceptButton = page.locator('button:has-text("Accept"), button[aria-label*="Accept"]').first();
      
      if (await acceptButton.isVisible()) {
        const requestBefore = await page.locator('[data-testid*="request"], .request-card').count();
        
        await acceptButton.click();
        await page.waitForTimeout(1000);

        // Verify request removed or moved to buddies
        const requestAfter = await page.locator('[data-testid*="request"], .request-card').count();
        expect(requestAfter).toBeLessThan(requestBefore);

        // Check buddies list increased
        const buddiesTab = page.locator('button:has-text("My Buddies"), [role="tab"]:has-text("Buddies")').first();
        if (await buddiesTab.isVisible()) {
          await buddiesTab.click();
          await page.waitForTimeout(1000);
          
          const buddies = await page.locator('[data-testid*="buddy"], .buddy-card').count();
          expect(buddies).toBeGreaterThan(0);
        }
      }
    }
  });

  test('3.6 Decline Buddy Request', async ({ page }) => {
    // Look for requests tab
    const requestsTab = page.locator('button:has-text("Requests")').first();
    
    if (await requestsTab.isVisible()) {
      await requestsTab.click();
      await page.waitForTimeout(1000);

      // Look for decline button
      const declineButton = page.locator('button:has-text("Decline"), button:has-text("Reject"), button[aria-label*="Decline"]').first();
      
      if (await declineButton.isVisible()) {
        const requestBefore = await page.locator('[data-testid*="request"], .request-card').count();
        
        await declineButton.click();
        await page.waitForTimeout(1000);

        // Verify request removed
        const requestAfter = await page.locator('[data-testid*="request"], .request-card').count();
        expect(requestAfter).toBeLessThan(requestBefore);
      }
    }
  });

  test('3.7 Remove/Unfriend Buddy', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for a buddy
    const buddy = page.locator('[data-testid*="buddy"], .buddy-card').first();
    
    if (await buddy.isVisible()) {
      // Click buddy to open details or look for remove button
      await buddy.click();
      await page.waitForTimeout(500);

      // Look for remove/unfriend button
      const removeButton = page.locator('button:has-text("Remove"), button:has-text("Unfriend"), button[aria-label*="Remove"]').first();
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForTimeout(500);

        // Confirm if needed
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Remove")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);

        // Verify buddy removed from list
        await expect(page.locator('text=/removed|success/i')).toBeVisible({ timeout: timeouts.medium });
      }
    }
  });
});
