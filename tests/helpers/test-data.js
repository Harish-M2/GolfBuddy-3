// Test Data and Configuration
// Reference: QA_TESTING_GUIDE.md

export const testAccounts = {
  primary: {
    email: 'qa.tester1@testmail.com',
    password: 'TestPass123!',
    displayName: 'QA Tester 1'
  },
  buddy: {
    email: 'qa.tester2@testmail.com',
    password: 'TestPass123!',
    displayName: 'QA Tester 2'
  },
  chat: {
    email: 'qa.tester3@testmail.com',
    password: 'TestPass123!',
    displayName: 'QA Tester 3'
  }
};

export const urls = {
  production: 'https://golfbuddy-d1c6a.web.app',
  local: 'http://localhost:3000'
};

export const selectors = {
  auth: {
    signInButton: 'button:has-text("Sign In"):not([role="tab"]):not([type="submit"])',
    signUpTab: 'button:has-text("Sign Up")',
    emailInput: 'input[name="email"], input[type="email"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    displayNameInput: 'input[name="displayName"]',
    submitButton: 'button[type="submit"]',
    profileIcon: '[role="button"]:has(div[class*="MuiAvatar-root"]), button:has([class*="MuiAvatar-root"])',
    welcomeText: 'text=/Welcome,/',
    signOutButton: 'text="Sign Out"'
  },
  nav: {
    // Updated navigation selectors for dropdown structure
    socialDropdown: 'button:has-text("Social")',
    golfDropdown: 'button:has-text("Golf")',
    findBuddiesLink: '[role="menuitem"]:has-text("Find Buddies")',
    myBuddiesLink: '[role="menuitem"]:has-text("My Buddies")',
    chatLink: '[role="menuitem"]:has-text("Chat")',
    teeTimesLink: '[role="menuitem"]:has-text("Tee Times")',
    scoresLink: '[role="menuitem"]:has-text("Scores")',
    coursesLink: '[role="menuitem"]:has-text("Courses")',
    homeLink: 'text="Home"',
    dashboardLink: 'text="Dashboard"'
  },
  chat: {
    chatList: '[data-testid="chat-list"]',
    messageInput: 'input[placeholder*="message"], textarea[placeholder*="message"]',
    sendButton: 'button[aria-label="Send"], button:has-text("Send")',
    messagesList: '[data-testid="messages-list"]'
  },
  scores: {
    newScorecardButton: 'button:has-text("New Scorecard")',
    courseNameInput: 'input[name="courseName"]',
    saveButton: 'button:has-text("Save")',
    recentRoundsTab: 'button:has-text("Recent Rounds")',
    statisticsTab: 'button:has-text("Statistics")',
    // Note: there's no "Enter Score" tab - it's done via "New Scorecard" button
    enterScoreTab: undefined, // This will cause tests to handle gracefully
    myRoundsTab: undefined // This should be recentRoundsTab
  },
  teetimes: {
    scheduleTeeTimeButton: 'button:has-text("Schedule Tee Time")',
    courseNameInput: 'input[name="courseName"]',
    saveButton: 'button:has-text("Create Tee Time")'
  },
  buddies: {
    acceptButton: 'button:has-text("Accept")',
    declineButton: 'button:has-text("Decline")',
    removeButton: 'button:has-text("Remove")'
  },
  golf: {
    sendRequestButton: 'button:has-text("Send Request")',
    skillLevelFilter: 'select[name="skillLevel"]',
    locationFilter: 'input[name="location"]'
  },
  
  // Page heading selectors - based on actual app structure
  pageHeadings: {
    golf: 'text="Find Your Golf Buddy ⛳"',
    buddies: 'text="My Golf Buddies 👥"',
    scores: 'text="Score Tracking"',
    teeTimes: 'h3:has-text("Tee Times")',
    courses: 'text="🏌️ Discover Golf Courses"',
    chat: 'text=/Chat|Messages/'
  }
};

export const timeouts = {
  short: 2000,      // 2 seconds
  medium: 5000,     // 5 seconds
  long: 10000,      // 10 seconds
  veryLong: 30000   // 30 seconds
};

// Helper to wait for navigation
export async function waitForNavigation(page, url) {
  await page.waitForURL(url, { timeout: timeouts.medium });
}

// Helper to take screenshot with timestamp
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

// Helper to check if element is visible
export async function isVisible(page, selector, timeout = timeouts.short) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

// Helper to login
export async function login(page, account = testAccounts.primary) {
  await page.goto('/');
  
  // Click Sign In button
  await page.click(selectors.auth.signInButton);
  
  // Wait for modal
  await page.waitForSelector(selectors.auth.emailInput, { timeout: timeouts.medium });
  
  // Fill credentials
  await page.fill(selectors.auth.emailInput, account.email);
  await page.fill(selectors.auth.passwordInput, account.password);
  
  // Submit
  await page.click(selectors.auth.submitButton);
  
  // Wait for successful login (profile icon OR welcome text)
  const profileIcon = page.locator(selectors.auth.profileIcon);
  const welcomeText = page.locator(selectors.auth.welcomeText);
  
  await Promise.race([
    profileIcon.waitFor({ state: 'visible', timeout: timeouts.long }),
    welcomeText.waitFor({ state: 'visible', timeout: timeouts.long })
  ]);
}

// Helper to navigate using dropdown menus
export async function navigateToPage(page, pageName) {
  switch (pageName.toLowerCase()) {
    case 'golf':
    case 'find buddies':
      await page.click(selectors.nav.socialDropdown);
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: 'Find Buddies' }).first().click();
      break;
    case 'buddies':
    case 'my buddies':
      await page.click(selectors.nav.socialDropdown);
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: 'My Buddies' }).first().click();
      break;
    case 'chat':
      await page.click(selectors.nav.socialDropdown);
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: 'Chat' }).first().click();
      break;
    case 'teetimes':
    case 'tee times':
      await page.click(selectors.nav.golfDropdown);
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: 'Tee Times' }).first().click();
      break;
    case 'scores':
      await page.click(selectors.nav.golfDropdown);
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: 'Scores' }).first().click();
      break;
    case 'courses':
      await page.click(selectors.nav.golfDropdown);
      await page.waitForTimeout(1000); // Wait longer for menu to appear
      await page.getByRole('menuitem', { name: 'Courses' }).first().click();
      break;
    default:
      throw new Error(`Unknown page: ${pageName}`);
  }
}