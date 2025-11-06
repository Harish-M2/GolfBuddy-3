# 🚀 Quick Test Commands Cheat Sheet

## Essential Commands

### Run All Tests
```bash
# Full test suite with AI reporting
node tests/run-all-tests.js

# Standard Playwright run
npx playwright test

# With browser UI visible
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Run Specific Test Suite
```bash
# Authentication tests
npx playwright test tests/auth.spec.js

# Chat tests
npx playwright test tests/chat.spec.js

# Buddy tests
npx playwright test tests/buddies.spec.js

# Golf courses tests
npx playwright test tests/golf-courses.spec.js

# Tee times tests
npx playwright test tests/teetimes.spec.js

# Score tracking tests
npx playwright test tests/scores.spec.js
```

### Run Single Test
```bash
# Run specific test by name
npx playwright test -g "User Login"

# Run test in specific file
npx playwright test tests/auth.spec.js -g "1.1"
```

### Browser-Specific
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### View Reports
```bash
# Open HTML report
npx playwright show-report

# View AI report
cat test-results/ai-reports/LATEST_TEST_REPORT.md

# Open AI report in editor
code test-results/ai-reports/LATEST_TEST_REPORT.md
```

### Environment-Specific
```bash
# Test local development
TEST_URL=http://localhost:3000 npx playwright test

# Test production
TEST_URL=https://golfbuddy-app-c879a.web.app npx playwright test
```

### Debugging
```bash
# Slow motion (easier to watch)
npx playwright test --headed --slow-mo=1000

# Pause on failure
npx playwright test --headed --pause-on-failure

# Enable debug logs
DEBUG=pw:api npx playwright test

# Trace viewer
npx playwright show-trace test-results/trace.zip
```

### Maintenance
```bash
# Update Playwright
npm install -D @playwright/test@latest

# Install/update browsers
npx playwright install

# Install with system dependencies
npx playwright install --with-deps

# Clear test artifacts
rm -rf test-results/ playwright-report/
```

---

## Quick Test Scenarios

### Smoke Test (Critical Features Only)
```bash
npx playwright test tests/auth.spec.js tests/chat.spec.js -g "1.2|4.3"
```

### Regression Test (All Features)
```bash
node tests/run-all-tests.js
```

### Performance Test (Check Slow Tests)
```bash
npx playwright test --reporter=list --workers=1
```

### Cross-Browser Test
```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

---

## Installation & Setup

### First Time Setup
```bash
# Install dependencies
npm install -D @playwright/test

# Install browsers
npx playwright install --with-deps

# Verify installation
npx playwright test --version

# Run initial test
npx playwright test tests/auth.spec.js
```

### Update Test Data
Edit `tests/helpers/test-data.js`:
- Update test account credentials
- Modify selectors if UI changes
- Adjust timeouts if needed

---

## CI/CD Commands

### GitHub Actions
```bash
# Manually trigger workflow
gh workflow run playwright.yml

# View workflow status
gh workflow view
```

### Local CI Simulation
```bash
# Run tests as CI would
CI=true npx playwright test --reporter=list
```

---

## Monitoring & Analysis

### Test Results Analysis
```bash
# View JSON results
cat test-results/results.json | jq

# Count passed tests
cat test-results/results.json | jq '.suites[].specs[].tests[].results[] | select(.status == "passed")' | wc -l

# List failed tests
cat test-results/results.json | jq '.suites[].specs[].tests[] | select(.results[].status == "failed") | .title'
```

### Check Test Duration
```bash
# Show longest running tests
npx playwright test --reporter=list | grep "✓" | sort -n
```

---

## Emergency Commands

### Stop Hanging Tests
```bash
# Kill all Playwright processes
pkill -f playwright

# Kill all Chrome processes
pkill -f chrome
```

### Reset Everything
```bash
# Remove all test artifacts
rm -rf test-results/ playwright-report/

# Clear node cache
rm -rf node_modules/.cache

# Reinstall browsers
npx playwright install --force
```

---

## Daily Workflow

### Morning Routine
```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
npm ci

# 3. Run full test suite
node tests/run-all-tests.js

# 4. Review report
cat test-results/ai-reports/LATEST_TEST_REPORT.md
```

### Before Deployment
```bash
# 1. Run all tests in CI mode
CI=true npx playwright test

# 2. Check pass rate (should be 100%)
cat test-results/ai-reports/LATEST_TEST_REPORT.md | grep "Pass Rate"

# 3. If passed, deploy
npm run build && firebase deploy
```

### After Bug Fix
```bash
# 1. Run affected test suite
npx playwright test tests/[affected-suite].spec.js

# 2. If passed, run full suite
node tests/run-all-tests.js

# 3. Commit and push
git add . && git commit -m "fix: [description]" && git push
```

---

## Tips & Tricks

### Speed Up Tests
```bash
# Run in parallel (faster)
npx playwright test --workers=4

# Run single browser only
npx playwright test --project=chromium

# Skip slow suites
npx playwright test --grep-invert "slow"
```

### Better Reporting
```bash
# List format (cleaner output)
npx playwright test --reporter=list

# Line format (minimal output)
npx playwright test --reporter=line

# Multiple reporters
npx playwright test --reporter=list --reporter=html
```

### Selective Testing
```bash
# Only chat tests
npx playwright test tests/chat.spec.js

# All tests except chat
npx playwright test --ignore=tests/chat.spec.js

# Tests matching pattern
npx playwright test -g "send|receive"
```

---

**📖 For full documentation, see:** `docs/AI_TESTING_AGENT_GUIDE.md`
