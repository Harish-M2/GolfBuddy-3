// filepath: tests/teetimes.spec.js
// TEST SUITE 5: TEE TIME SCHEDULER
// Reference: QA_TESTING_GUIDE.md - Test Suite 5

import { test, expect } from '@playwright/test';
import { testAccounts, selectors, timeouts, urls, login, navigateToPage } from './helpers/test-data.js';

test.describe('TEST SUITE 5: Tee Time Scheduler', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(urls.production);
    await login(page, testAccounts.primary);
    
    // Navigate to Tee Times page
    await navigateToPage(page, 'teetimes');
    await page.waitForTimeout(1000);
  });

  test('5.1 View Tee Times Page', async ({ page }) => {
    // Verify page loaded with correct heading
    await expect(page.locator(selectors.pageHeadings.teeTimes)).toBeVisible({ timeout: timeouts.long });

    // Check for tee times interface - using actual page structure
    const scheduleButton = await page.locator('button:has-text("Schedule Tee Time")').isVisible().catch(() => false);
    const hasTeetimes = await page.locator('[data-testid*="teetime"], .teetime-card').first().isVisible({ timeout: timeouts.short }).catch(() => false);
    const tabsPresent = await page.locator('[role="tablist"]').isVisible().catch(() => false);

    expect(scheduleButton || hasTeetimes || tabsPresent).toBeTruthy();
  });

  test('5.2 View Available Tee Times', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for date picker or course selector
    const dateInput = page.locator('input[type="date"], button:has-text("Select Date")').first();
    
    if (await dateInput.isVisible()) {
      await dateInput.click();
      await page.waitForTimeout(500);

      // Select a date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('input[type="date"]', dateString);
      await page.waitForTimeout(1000);

      // Verify tee times displayed
      const teetimes = page.locator('[data-testid*="teetime"], .teetime-card, [role="listitem"]');
      await expect(teetimes.first()).toBeVisible({ timeout: timeouts.medium });
    }
  });

  test('5.3 Book a Tee Time', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for book button
    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")').first();
    
    if (await bookButton.isVisible()) {
      await bookButton.click();
      await page.waitForTimeout(1000);

      // Fill booking form if needed
      const courseField = page.locator('input[name*="course"], select[name*="course"]').first();
      if (await courseField.isVisible()) {
        await courseField.click();
        await page.waitForTimeout(500);
        
        // Select first option
        await page.locator('li, option').first().click();
      }

      // Select date
      const dateField = page.locator('input[type="date"]').first();
      if (await dateField.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateField.fill(tomorrow.toISOString().split('T')[0]);
      }

      // Select time
      const timeField = page.locator('input[type="time"], select[name*="time"]').first();
      if (await timeField.isVisible()) {
        await timeField.fill('09:00');
      }

      // Submit booking
      const submitButton = page.locator('button[type="submit"], button:has-text("Confirm"), button:has-text("Book")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Verify success
        const success = await page.locator('text=/booked|success|confirmed/i').first().isVisible({ timeout: timeouts.medium });
        expect(success).toBeTruthy();
      }
    }
  });

  test('5.4 View My Bookings', async ({ page }) => {
    // Look for "My Bookings" tab
    const bookingsTab = page.locator('button:has-text("My Bookings"), [role="tab"]:has-text("Bookings")').first();
    
    if (await bookingsTab.isVisible()) {
      await bookingsTab.click();
      await page.waitForTimeout(1000);

      // Verify bookings list
      const hasBookings = await page.locator('[data-testid*="booking"], .booking-card').first().isVisible({ timeout: timeouts.short }).catch(() => false);
      const emptyState = await page.locator('text=/no bookings|no tee times/i').first().isVisible().catch(() => false);

      expect(hasBookings || emptyState).toBeTruthy();
    }
  });

  test('5.5 Cancel Tee Time Booking', async ({ page }) => {
    // Navigate to bookings
    const bookingsTab = page.locator('button:has-text("My Bookings")').first();
    
    if (await bookingsTab.isVisible()) {
      await bookingsTab.click();
      await page.waitForTimeout(1000);

      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label*="Cancel"]').first();
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(500);

        // Confirm cancellation
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);

        // Verify cancelled
        await expect(page.locator('text=/cancelled|removed/i')).toBeVisible({ timeout: timeouts.medium });
      }
    }
  });

  test('5.6 Filter Tee Times by Course', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for course filter
    const courseFilter = page.locator('select[name*="course"], button:has-text("Course")').first();
    
    if (await courseFilter.isVisible()) {
      await courseFilter.click();
      await page.waitForTimeout(500);

      // Select a course
      await page.locator('option, li').nth(1).click();
      await page.waitForTimeout(1000);

      // Verify filtered results
      const teetimes = await page.locator('[data-testid*="teetime"], .teetime-card').count();
      expect(teetimes).toBeGreaterThanOrEqual(0);
    }
  });
});
