# 🤖 Automated Testing Agent Setup Guide

**Purpose:** Set up automated testing for GolfBuddy app  
**Date:** November 6, 2025

---

## 🎯 Overview

This guide shows you how to create an automated testing agent that:
- ✅ Reads test cases from `QA_TESTING_GUIDE.md`
- ✅ Executes tests automatically
- ✅ Provides documented feedback
- ✅ Generates test reports

---

## 📋 Option 1: Playwright + AI Agent (Recommended) ⭐

### What is it?
- **Playwright**: Browser automation framework (like Selenium, but better)
- **AI Agent**: LLM (ChatGPT, Claude) that reads test cases and generates Playwright code

### Pros:
- ✅ Can follow natural language test cases
- ✅ Intelligent error handling
- ✅ Detailed screenshots and videos
- ✅ Cross-browser testing
- ✅ Mobile emulation

### Cons:
- ⚠️ Requires AI API (OpenAI, Anthropic, etc.)
- ⚠️ May need manual review of generated tests

### Setup:

#### Step 1: Install Playwright
```bash
cd /Users/harish/Documents/Projects/GolfBuddy

# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Initialize Playwright config
npx playwright init
```

#### Step 2: Project Structure
```
GolfBuddy/
├── tests/
│   ├── auth.spec.js              # Authentication tests
│   ├── buddies.spec.js           # Buddy finder tests
│   ├── chat.spec.js              # Chat tests
│   ├── scores.spec.js            # Score tracking tests
│   └── helpers/
│       ├── test-data.js          # Test credentials
│       └── assertions.js         # Custom assertions
│
├── test-results/                 # Auto-generated results
├── playwright-report/            # HTML reports
└── playwright.config.js          # Configuration
```

#### Step 3: Create Test Helper
```javascript
// tests/helpers/test-data.js

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
  base: 'https://golfbuddy-app-c879a.web.app',
  local: 'http://localhost:3000'
};
```

#### Step 4: Example Test (Authentication)
```javascript
// tests/auth.spec.js
import { test, expect } from '@playwright/test';
import { testAccounts, urls } from './helpers/test-data';

test.describe('Authentication Tests', () => {
  
  test('Test Case 1.1: User Registration', async ({ page }) => {
    // Navigate to app
    await page.goto(urls.base);
    
    // Click Sign In button
    await page.click('text=Sign In');
    
    // Switch to Sign Up tab
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('input[name="email"]', 'qa.new@testmail.com');
    await page.fill('input[name="displayName"]', 'New QA User');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    
    // Submit
    await page.click('button:has-text("Sign Up")');
    
    // Wait for success (modal closes)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify logged in (profile icon visible)
    await expect(page.locator('[aria-label="Profile"]')).toBeVisible();
    
    // Take screenshot for report
    await page.screenshot({ path: 'test-results/auth-signup.png' });
  });
  
  test('Test Case 1.2: User Login', async ({ page }) => {
    await page.goto(urls.base);
    
    // Click Sign In
    await page.click('text=Sign In');
    
    // Fill credentials
    await page.fill('input[name="email"]', testAccounts.primary.email);
    await page.fill('input[name="password"]', testAccounts.primary.password);
    
    // Submit
    await page.click('button:has-text("Sign In")');
    
    // Verify logged in
    await expect(page.locator('[aria-label="Profile"]')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/auth-login.png' });
  });
  
  test('Test Case 1.3: Protected Route Enforcement', async ({ page }) => {
    // Try to access protected route without login
    await page.goto(urls.base + '/buddies');
    
    // Should redirect to home with auth modal
    await expect(page).toHaveURL(/\?auth=required/);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Should show warning message
    await expect(page.locator('text=Please sign in')).toBeVisible();
  });
});
```

#### Step 5: Run Tests
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

---

## 📋 Option 2: AI-Powered Test Generator

### Use AI to Generate Tests from Documentation

Create a script that uses AI to read `QA_TESTING_GUIDE.md` and generate Playwright tests.

#### Step 1: Install AI SDK
```bash
npm install openai
# or
npm install @anthropic-ai/sdk
```

#### Step 2: Create Test Generator
```javascript
// scripts/generate-tests.js
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateTests() {
  // Read QA_TESTING_GUIDE.md
  const qaGuide = fs.readFileSync('QA_TESTING_GUIDE.md', 'utf8');
  
  // Extract test cases
  const testCases = extractTestCases(qaGuide);
  
  for (const testCase of testCases) {
    // Ask AI to generate Playwright test
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in Playwright test automation. Generate a Playwright test based on the test case provided."
        },
        {
          role: "user",
          content: `Generate a Playwright test for this test case:\n\n${testCase}`
        }
      ]
    });
    
    const generatedTest = response.choices[0].message.content;
    
    // Save to file
    const fileName = `tests/generated/${testCase.id}.spec.js`;
    fs.writeFileSync(fileName, generatedTest);
    
    console.log(`Generated test: ${fileName}`);
  }
}

function extractTestCases(markdown) {
  // Parse markdown and extract test cases
  // Return array of test case objects
  // Implementation depends on your markdown structure
}

generateTests();
```

#### Step 3: Run Generator
```bash
# Set API key
export OPENAI_API_KEY=your-api-key-here

# Generate tests
node scripts/generate-tests.js
```

---

## 📋 Option 3: Cypress + AI

Cypress is another popular testing framework with great DX.

#### Step 1: Install Cypress
```bash
npm install -D cypress

# Open Cypress
npx cypress open
```

#### Step 2: Example Test
```javascript
// cypress/e2e/auth.cy.js
describe('Authentication Tests', () => {
  it('Test Case 1.1: User Registration', () => {
    cy.visit('https://golfbuddy-app-c879a.web.app');
    
    cy.contains('Sign In').click();
    cy.contains('Sign Up').click();
    
    cy.get('input[name="email"]').type('qa.new@testmail.com');
    cy.get('input[name="displayName"]').type('New QA User');
    cy.get('input[name="password"]').type('TestPass123!');
    cy.get('input[name="confirmPassword"]').type('TestPass123!');
    
    cy.contains('button', 'Sign Up').click();
    
    // Verify logged in
    cy.get('[aria-label="Profile"]').should('be.visible');
    
    // Screenshot
    cy.screenshot('auth-signup');
  });
});
```

---

## 📋 Option 4: Custom AI Agent with Puppeteer

Build a custom agent that reads test cases and executes them.

#### Step 1: Install Dependencies
```bash
npm install puppeteer openai
```

#### Step 2: Create Agent
```javascript
// scripts/test-agent.js
const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class TestAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }
  
  async init() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
  }
  
  async runTestCase(testCase) {
    console.log(`\nRunning: ${testCase.name}`);
    
    try {
      // Ask AI how to perform this test
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a test automation expert. Given a test case, provide Puppeteer commands to execute it. Return only the code, no explanations."
          },
          {
            role: "user",
            content: `Test Case:\n${testCase.steps}\n\nExpected Results:\n${testCase.expectedResults}`
          }
        ]
      });
      
      const code = response.choices[0].message.content;
      
      // Execute the generated code
      await eval(code);
      
      // Mark as passed
      this.results.push({
        testCase: testCase.name,
        status: 'PASS',
        screenshot: await this.page.screenshot()
      });
      
      console.log('✅ PASS');
      
    } catch (error) {
      // Mark as failed
      this.results.push({
        testCase: testCase.name,
        status: 'FAIL',
        error: error.message,
        screenshot: await this.page.screenshot()
      });
      
      console.log('❌ FAIL:', error.message);
    }
  }
  
  async generateReport() {
    const report = {
      date: new Date().toISOString(),
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      results: this.results
    };
    
    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync('test-results/report.html', html);
    
    // Generate JSON report
    fs.writeFileSync('test-results/report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 Report generated: test-results/report.html');
  }
  
  generateHTMLReport(report) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GolfBuddy Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .pass { color: green; }
          .fail { color: red; }
          .summary { background: #f0f0f0; padding: 20px; margin: 20px 0; }
          .test-case { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>🧪 GolfBuddy Test Report</h1>
        <div class="summary">
          <h2>Summary</h2>
          <p>Date: ${report.date}</p>
          <p>Total Tests: ${report.totalTests}</p>
          <p class="pass">Passed: ${report.passed}</p>
          <p class="fail">Failed: ${report.failed}</p>
          <p>Pass Rate: ${((report.passed / report.totalTests) * 100).toFixed(1)}%</p>
        </div>
        
        <h2>Test Results</h2>
        ${report.results.map(r => `
          <div class="test-case">
            <h3 class="${r.status === 'PASS' ? 'pass' : 'fail'}">
              ${r.status === 'PASS' ? '✅' : '❌'} ${r.testCase}
            </h3>
            ${r.error ? `<p>Error: ${r.error}</p>` : ''}
            ${r.screenshot ? `<img src="data:image/png;base64,${r.screenshot.toString('base64')}" width="600"/>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }
  
  async close() {
    await this.browser.close();
  }
}

// Run tests
async function main() {
  const agent = new TestAgent();
  await agent.init();
  
  // Read test cases from QA_TESTING_GUIDE.md
  const testCases = parseTestCases('QA_TESTING_GUIDE.md');
  
  for (const testCase of testCases) {
    await agent.runTestCase(testCase);
  }
  
  await agent.generateReport();
  await agent.close();
}

main();
```

---

## 📋 Option 5: Use Existing AI Testing Tools

### 1. **Checkly** (Recommended for ease)
- Website monitoring + Playwright tests
- AI-assisted test generation
- Automated scheduling
- https://www.checklyhq.com

### 2. **Testim**
- AI-powered test automation
- Self-healing tests
- https://www.testim.io

### 3. **Mabl**
- Intelligent test automation
- Auto-healing tests
- https://www.mabl.com

### 4. **Autify**
- No-code test automation
- AI maintenance
- https://autify.com

---

## 🎯 Recommended Approach for GolfBuddy

### Quick Start (Easiest):

```bash
# 1. Install Playwright
npm install -D @playwright/test
npx playwright install

# 2. Create test directory
mkdir -p tests/helpers

# 3. Copy test examples (I'll create these for you)
# 4. Run tests
npx playwright test --headed

# 5. View report
npx playwright show-report
```

### With AI Enhancement (Best Results):

1. **Manual tests in Playwright** (basic coverage)
2. **Use AI (ChatGPT/Claude) to generate additional tests** from QA_TESTING_GUIDE.md
3. **Review and refine** AI-generated tests
4. **Schedule runs** with GitHub Actions or cron

---

## 📊 Report Format

The automated tests will generate:

### 1. **HTML Report**
- Test summary (pass/fail counts)
- Screenshots of each test
- Error messages with stack traces
- Execution time per test

### 2. **JSON Report**
```json
{
  "date": "2025-11-06T...",
  "totalTests": 140,
  "passed": 135,
  "failed": 5,
  "passRate": "96.4%",
  "results": [
    {
      "testCase": "Test Case 1.1: User Registration",
      "status": "PASS",
      "duration": "2.3s",
      "screenshot": "base64..."
    }
  ]
}
```

### 3. **Markdown Report**
Auto-generated report that can be committed to repo:
```markdown
# Test Report - 2025-11-06

## Summary
- **Total Tests:** 140
- **Passed:** 135 ✅
- **Failed:** 5 ❌
- **Pass Rate:** 96.4%

## Failed Tests
- Test Case 4.7: Chat refresh behavior - Error: ...
```

---

## 🚀 Next Steps

### Choose your approach:

1. **Just want it to work?** → Use **Checkly** (cloud service)
2. **Want control + AI help?** → Use **Playwright + AI generation**
3. **Want maximum customization?** → Build **custom agent**

### I recommend:
**Start with Playwright** → Add AI assistance later

Would you like me to create a complete Playwright test suite for your app right now?

---

**Questions?** Let me know which option you prefer and I'll set it up for you!
