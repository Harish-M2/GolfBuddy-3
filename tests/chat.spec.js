// filepath: tests/chat.spec.js
// TEST SUITE 4: REAL-TIME CHAT
// Reference: QA_TESTING_GUIDE.md - Test Suite 4

import { test, expect } from '@playwright/test';
import { testAccounts, selectors, login, timeouts } from './helpers/test-data.js';

test.describe('TEST SUITE 4: Real-Time Chat', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await login(page, testAccounts.primary);
    await page.goto('/chat');
    await page.waitForTimeout(2000);
  });

  test('4.1 View Chat List', async ({ page }) => {
    // Verify page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /Chat|Messages/i })).toBeVisible({ timeout: timeouts.long });

    // Check for chat list or empty state
    const hasChats = await page.locator('[data-testid*="chat"], .chat-item, [role="listitem"]').first().isVisible({ timeout: timeouts.short }).catch(() => false);
    const emptyState = await page.locator('text=/no chats|no messages|start chatting/i').first().isVisible().catch(() => false);

    expect(hasChats || emptyState).toBeTruthy();
  });

  test('4.2 Open Chat with Buddy', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for first chat
    const firstChat = page.locator('[data-testid*="chat"], .chat-item, [role="listitem"]').first();
    
    if (await firstChat.isVisible()) {
      const chatName = await firstChat.textContent();
      await firstChat.click();
      await page.waitForTimeout(1000);

      // Verify chat opened - message input should be visible
      await expect(page.locator(selectors.chat.messageInput)).toBeVisible({ timeout: timeouts.medium });

      // Verify buddy name displayed
      await expect(page.locator(`text="${chatName.trim()}"`).first()).toBeVisible();
    }
  });

  test('4.3 Send Message', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Open first chat
    const firstChat = page.locator('[data-testid*="chat"], .chat-item').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await page.waitForTimeout(1000);

      const testMessage = `Test message ${Date.now()}`;

      // Type message
      await page.fill(selectors.chat.messageInput, testMessage);
      
      // Send message
      await page.click(selectors.chat.sendButton);
      await page.waitForTimeout(1000);

      // Verify message appears in chat
      await expect(page.locator(`text="${testMessage}"`)).toBeVisible({ timeout: timeouts.medium });

      // Verify input cleared
      const inputValue = await page.inputValue(selectors.chat.messageInput);
      expect(inputValue).toBe('');
    }
  });

  test('4.4 Receive Message (Auto-refresh)', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Open a chat
    const firstChat = page.locator('[data-testid*="chat"], .chat-item').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await page.waitForTimeout(1000);

      // Count initial messages
      const initialCount = await page.locator('[data-testid*="message"], .message').count();

      // Wait for auto-refresh (messages refresh every 5 seconds)
      await page.waitForTimeout(6000);

      // Messages should still be displayed (no crash)
      const messagesList = page.locator(selectors.chat.messagesList);
      await expect(messagesList).toBeVisible();

      // Page should not have refreshed (no infinite loop)
      const currentUrl = page.url();
      expect(currentUrl).toContain('/chat');
    }
  });

  test('4.5 Unread Message Indicator', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check if any chats have unread indicators
    const unreadBadge = page.locator('[data-testid*="unread"], .unread-badge, .badge').first();
    
    if (await unreadBadge.isVisible()) {
      // Note the unread count
      const unreadCount = await unreadBadge.textContent();
      
      // Click on chat with unread messages
      const chatWithUnread = unreadBadge.locator('..').or(page.locator('[data-testid*="chat"]').first());
      await chatWithUnread.click();
      await page.waitForTimeout(2000);

      // Go back to chat list
      await page.goto('/chat');
      await page.waitForTimeout(1000);

      // Verify unread count decreased or badge removed
      const newBadge = page.locator('[data-testid*="unread"], .unread-badge').first();
      const stillVisible = await newBadge.isVisible().catch(() => false);
      
      if (stillVisible) {
        const newCount = await newBadge.textContent();
        expect(newCount).not.toBe(unreadCount);
      }
    }
  });

  test('4.6 Chat Page Stability (No Infinite Refresh)', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Open a chat
    const firstChat = page.locator('[data-testid*="chat"], .chat-item').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await page.waitForTimeout(1000);

      // Monitor page for 10 seconds
      let refreshCount = 0;
      page.on('framenavigated', () => refreshCount++);

      await page.waitForTimeout(10000);

      // Page should not refresh constantly (max 1-2 times for legitimate reasons)
      expect(refreshCount).toBeLessThan(3);
    }
  });

  test('4.7 Start New Chat', async ({ page }) => {
    // Look for "New Chat" or "Start Chat" button
    const newChatButton = page.locator('button:has-text("New Chat"), button:has-text("Start Chat"), button[aria-label*="New"]').first();
    
    if (await newChatButton.isVisible()) {
      await newChatButton.click();
      await page.waitForTimeout(1000);

      // Should show buddy selection
      await expect(page.locator('text=/select buddy|choose buddy/i')).toBeVisible({ timeout: timeouts.medium });

      // Select a buddy
      const buddy = page.locator('[data-testid*="buddy"], .buddy-card').first();
      if (await buddy.isVisible()) {
        await buddy.click();
        await page.waitForTimeout(1000);

        // Chat should open
        await expect(page.locator(selectors.chat.messageInput)).toBeVisible({ timeout: timeouts.medium });
      }
    }
  });
});
