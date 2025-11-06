# ⚡ Fast Testing Guide - Run Tests Quickly

**Problem:** Full test suite with all browsers takes too long  
**Solution:** Run tests strategically for faster feedback

---

## 🚀 Quick Testing Strategies

### **Strategy 1: Single Browser (Fastest)**
```bash
# Run all tests in Chrome only (30-40 seconds)
npx playwright test --project=chromium

# Run specific suite in Chrome
npx playwright test tests/auth.spec.js --project=chromium

# Run single test in Chrome
npx playwright test tests/auth.spec.js -g "1.2" --project=chromium
```

### **Strategy 2: Parallel Workers (Fast)**
```bash
# Use all CPU cores
npx playwright test --project=chromium --workers=100%

# Or specify worker count
npx playwright test --project=chromium --workers=4
```

### **Strategy 3: Specific Test Only**
```bash
# Just the login test (5 seconds)
npx playwright test tests/auth.spec.js -g "1.2" --project=chromium

# Just auth suite (20 seconds)
npx playwright test tests/auth.spec.js --project=chromium

# Just chat suite
npx playwright test tests/chat.spec.js --project=chromium
```

---

## 📊 Speed Comparison

| Command | Time | When to Use |
|---------|------|-------------|
| Single test, Chrome | 5 sec | Quick verification |
| One suite, Chrome | 20 sec | Testing specific feature |
| All tests, Chrome | 40 sec | **Daily workflow** ⭐ |
| All tests, 3 desktop browsers | 90 sec | Before deployment |
| All tests, all 5 browsers | 120 sec | Full regression test |

---

## 💡 Recommended Workflow

### **During Development (Every 5 minutes)**
```bash
# Quick smoke test - just login
npx playwright test tests/auth.spec.js -g "1.2" --project=chromium
```

### **Before Committing (Every hour)**
```bash
# Full suite, Chrome only
npx playwright test --project=chromium
```

### **Before Deploying (Once per deployment)**
```bash
# All browsers
npx playwright test
```

---

## 🎯 Updated Test Commands

Add these to your package.json for easy access:

```json
{
  "scripts": {
    "test": "npx playwright test --project=chromium",
    "test:fast": "npx playwright test --project=chromium --workers=100%",
    "test:smoke": "npx playwright test tests/auth.spec.js -g '1.2' --project=chromium",
    "test:all": "npx playwright test",
    "test:ai": "node tests/run-all-tests.js",
    "test:debug": "npx playwright test --debug",
    "test:headed": "npx playwright test --headed",
    "test:report": "npx playwright show-report",
    "test:ui": "npx playwright test --ui"
  }
}
```

---

## ⚡ Quick Commands

### **Super Fast (5 seconds)**
```bash
npm run test:smoke
# Or: npx playwright test tests/auth.spec.js -g "1.2" --project=chromium
```

### **Fast (40 seconds)**
```bash
npm test
# Or: npx playwright test --project=chromium
```

### **Complete (2 minutes)**
```bash
npm run test:all
# Or: npx playwright test
```

---

## 🎮 Interactive Mode (Best for Development)

### **Playwright UI Mode (Recommended!)**
```bash
npm run test:ui
# Or: npx playwright test --ui
```

**Benefits:**
- ✅ Watch tests run live
- ✅ Debug failures instantly
- ✅ Run/re-run individual tests
- ✅ See what selectors match
- ✅ Time travel through test steps

---

## 🔧 Optimize Test Speed

### **1. Skip Mobile Tests During Development**
Edit `playwright.config.js`:
```javascript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // Comment out mobile for faster tests during development
  // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  // { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
],
```

### **2. Increase Parallel Workers**
Edit `playwright.config.js`:
```javascript
workers: process.env.CI ? 2 : 4, // Use 4 workers locally
```

### **3. Run Specific Tests**
```bash
# Only auth and chat
npx playwright test tests/auth.spec.js tests/chat.spec.js --project=chromium

# Skip slow tests
npx playwright test --grep-invert "slow"
```

---

## 📈 Recommended Daily Workflow

### **Morning Check (1 minute)**
```bash
# Quick smoke test
npm run test:smoke
```

### **After Feature Work (1 minute)**
```bash
# Test the feature you worked on
npx playwright test tests/[your-feature].spec.js --project=chromium
```

### **Before Lunch (2 minutes)**
```bash
# Full Chrome test
npm test
```

### **Before Going Home (3 minutes)**
```bash
# Full multi-browser test
npm run test:all
```

---

## 🎯 Current Recommendation

**For your immediate needs, use this:**

```bash
# Create test accounts first, then run:
npx playwright test --project=chromium
```

**Why this is best:**
- ✅ Tests all 39 tests (full coverage)
- ✅ Only 40 seconds (fast enough)
- ✅ One browser (Chrome - most common)
- ✅ Reliable results
- ✅ Daily use friendly

---

## 🚨 What to Avoid

### ❌ Don't Do This (Too Slow)
```bash
# This runs 39 tests × 5 browsers = 195 test runs!
npx playwright test
```

### ✅ Do This Instead
```bash
# This runs 39 tests × 1 browser = 39 test runs
npx playwright test --project=chromium
```

---

## 📊 Speed Comparison Chart

```
Single Test, Chrome:        [====] 5s
Auth Suite, Chrome:         [============] 20s
All Tests, Chrome:          [========================] 40s ⭐ RECOMMENDED
All Tests, 3 Browsers:      [==========================================] 90s
All Tests, 5 Browsers:      [========================================================] 120s
```

---

## 🎓 Pro Tips

### **1. Use Watch Mode (Development)**
```bash
npx playwright test --project=chromium --headed --watch
```

### **2. Focus on What You Changed**
```bash
# Only test the feature you're working on
npx playwright test tests/chat.spec.js --project=chromium
```

### **3. Use grep for Specific Tests**
```bash
# Only login-related tests
npx playwright test -g "login" --project=chromium

# Only test 1.2 and 1.4
npx playwright test -g "1.2|1.4" --project=chromium
```

### **4. Debug Failed Tests Only**
```bash
# Run only previously failed tests
npx playwright test --last-failed --project=chromium
```

---

## ✅ Your Next Command

After creating test accounts, run this:

```bash
npx playwright test --project=chromium
```

**Expected result:** 39 tests pass in ~40 seconds

---

## 📞 Quick Reference

| Task | Command | Time |
|------|---------|------|
| Quick check | `npm run test:smoke` | 5s |
| Feature test | `npx playwright test tests/[feature].spec.js --project=chromium` | 20s |
| Daily test | `npm test` | 40s |
| Pre-deploy | `npm run test:all` | 120s |
| Debug | `npm run test:ui` | Interactive |

---

**TL;DR:** Always use `--project=chromium` unless you need multi-browser testing!

```bash
npx playwright test --project=chromium
```
