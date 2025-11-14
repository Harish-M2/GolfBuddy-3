# AI QA Testing Agent Instructions

## Mission Statement
You are an AI QA Testing Agent tasked with thoroughly testing the GolfBuddy application. Your mission is to execute all test cases in the QA_TEST_PLAN.md document, document results, and identify bugs or issues. You MUST NOT use mock data - all testing must be done with real Firebase data and real user interactions.

---

## Setup Instructions

### Phase 1: Environment Preparation

1. **Start the Application**
   ```bash
   cd C:/Users/133353/Documents/Projects/GolfBuddy-3
   npm start
   ```
   - Wait for compilation to complete
   - Verify app runs at http://localhost:3000
   - Check console for any startup errors

2. **Open Browser Testing Tools**
   - Open Chrome DevTools (F12)
   - Keep Console tab visible to monitor errors
   - Keep Network tab available for API debugging

3. **Review Test Plan**
   - Open QA_TEST_PLAN.md
   - Familiarize yourself with all test cases
   - Understand the test flow and dependencies

---

### Phase 2: Account Creation

**CRITICAL**: You must create 3 real Firebase accounts. DO NOT use mock data.

#### Account 1 Creation
1. Navigate to http://localhost:3000
2. Click "Sign Up" or registration button
3. Enter:
   - Email: `qatest1@test.com`
   - Password: `TestPass123!`
4. Complete registration
5. Navigate to Settings page
6. Fill in profile:
   - Display Name: `QA Tester One`
   - Location: `London`
   - Skill Level: `Advanced`
   - Bio: `Testing account for QA validation`
   - Phone: `+44 123 456 7890` (optional)
7. Save profile
8. **VERIFY**: Profile saved successfully
9. **LOG OUT**

#### Account 2 Creation
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter:
   - Email: `qatest2@test.com`
   - Password: `TestPass123!`
4. Complete registration
5. Fill in profile:
   - Display Name: `QA Tester Two`
   - Location: `London`
   - Skill Level: `Intermediate`
   - Bio: `Second testing account`
   - Phone: `+44 987 654 3210` (optional)
6. Save profile
7. **VERIFY**: Profile saved successfully
8. **LOG OUT**

#### Account 3 Creation
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter:
   - Email: `qatest3@test.com`
   - Password: `TestPass123!`
4. Complete registration
5. Fill in profile:
   - Display Name: `QA Tester Three`
   - Location: `Manchester`
   - Skill Level: `Beginner`
   - Bio: `Third testing account`
6. Save profile
7. **VERIFY**: Profile saved successfully
8. **LOG OUT**

---

### Phase 3: Execute Test Cases

Follow the QA_TEST_PLAN.md document in order. For each test case:

#### Testing Protocol

1. **Read Test Case**
   - Understand the objective
   - Note the expected results
   - Identify prerequisites

2. **Execute Steps**
   - Follow steps exactly as written
   - Do not skip steps
   - Take screenshots if bugs found

3. **Observe Results**
   - Compare actual vs expected results
   - Check console for errors
   - Check network tab for failed requests
   - Note any UI/UX issues

4. **Document Outcome**
   - Mark as Pass/Fail in the test plan
   - If FAIL:
     - Document what went wrong
     - Include error messages
     - Note steps to reproduce
     - Capture screenshot/console log
     - Rate severity (Critical/Major/Minor)

5. **Handle Failures**
   - Do not stop testing if one case fails
   - Mark the failure and continue
   - Note if failure blocks other tests

---

## Test Execution Order

### Section 1: Foundation Tests (MUST PASS)
Execute in this exact order:

1. **Authentication Tests (1.1 - 1.3)**
   - These MUST all pass before continuing
   - If any fail, report immediately and stop testing

2. **Profile Management Tests (2.1 - 2.2)**
   - Ensure profiles are set up correctly
   - Critical for subsequent tests

3. **Dashboard Tests (3.1 - 3.3)**
   - Verify dashboard loads
   - Check initial empty states

---

### Section 2: Core Feature Tests

4. **Golf Buddy Finder Tests (4.1 - 4.4)**
   - Test golfer discovery
   - Test search/filter if available
   - **CRITICAL**: Test buddy request sending (4.2)

5. **Buddy Request Notification Tests (5.1 - 5.6)**
   - Switch to Account 2
   - Test notification receipt
   - **CRITICAL**: Test accepting requests (5.3)
   - Verify buddy appears on dashboard (5.4)
   - Test modal view (5.5)
   - Switch to Account 3 for decline test (5.6)

6. **Tee Time Creation Tests (6.1 - 6.4)**
   - Switch back to Account 1
   - **CRITICAL**: Test solo tee time creation (6.2)
   - **CRITICAL**: Test tee time with buddy invitations (6.3)
   - Verify tee time details (6.4)

7. **Tee Time RSVP Tests (7.1 - 7.4)**
   - Switch to Account 2
   - Test invitation receipt (7.1)
   - **CRITICAL**: Test accepting invitation (7.2)
   - Switch to Account 1 to verify (7.3)
   - Test declining (use Account 3) (7.4)

---

### Section 3: Integration Tests

8. **Dashboard Integration Tests (8.1 - 8.2)**
   - Verify tee times appear on dashboard
   - Verify buddies appear on dashboard
   - Test click interactions

9. **Weather Widget Tests (9.1)**
   - **CRITICAL**: Verify real weather data (not mock 22°C)
   - Check for London (should be ~13-14°C currently)

10. **Navigation Tests (10.1 - 10.2)**
    - Test all navigation links
    - Verify routing works
    - Test dropdowns

---

### Section 4: Additional Tests

11. **Settings Page Tests (11.1 - 11.2)**
    - Test settings page load
    - Test buddy management in settings

12. **Error Handling Tests (12.1 - 12.3)**
    - Test invalid login
    - Test form validation
    - Test network errors (optional)

13. **Data Persistence Tests (13.1 - 13.3)**
    - Test profile data persists
    - Test tee times persist
    - Test buddy connections persist

14. **UI/UX Tests (14.1 - 14.3)**
    - Test card styling
    - Test dark mode (if available)
    - Test loading states

15. **Performance Tests (15.1 - 15.2)**
    - Optional: Test page load times
    - Optional: Test service worker

---

## Critical Test Checkpoints

These tests are MUST PASS for the application to be considered functional:

### ✅ Critical Checkpoint 1: Authentication
- [ ] Can create new accounts
- [ ] Can sign in successfully
- [ ] Can sign out successfully
- [ ] Auth state persists

**If ANY fail**: STOP and report critical authentication failure.

---

### ✅ Critical Checkpoint 2: Buddy System
- [ ] Can send buddy requests
- [ ] Notifications appear for recipient
- [ ] Can accept buddy requests
- [ ] Buddies appear on both accounts
- [ ] Buddy list shows on dashboard

**If ANY fail**: Report critical buddy system failure.

---

### ✅ Critical Checkpoint 3: Tee Time System
- [ ] Can create tee time
- [ ] Tee time appears in database
- [ ] Can invite buddies to tee time
- [ ] Invitations received by buddies
- [ ] Can accept/decline invitations
- [ ] Tee times appear on dashboard

**If ANY fail**: Report critical tee time system failure.

---

### ✅ Critical Checkpoint 4: Dashboard Integration
- [ ] Weather shows REAL data (not mock)
- [ ] Buddies section populates from database
- [ ] Events section populates from database
- [ ] All sections load without errors

**If ANY fail**: Report dashboard integration failure.

---

## Bug Reporting Template

When you find a bug, document it using this format:

```markdown
### Bug Report #[NUMBER]

**Severity**: [Critical / Major / Minor]

**Title**: [Short description]

**Test Case**: [Test case number from QA plan]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Errors** (if any):
```
[Paste error messages]
```

**Screenshots/Evidence**:
[Description of visual evidence]

**Account Used**: [qatest1/qatest2/qatest3]

**Impact**:
[How does this affect users?]

**Reproducible**: [Always / Sometimes / Once]

**Browser**: [Chrome/Edge version]

**Date/Time**: [When bug was found]
```

---

## Bug Severity Guidelines

**Critical (Blocks core functionality)**
- Cannot create accounts
- Cannot log in
- Cannot send/accept buddy requests
- Cannot create tee times
- App crashes
- Data loss occurs

**Major (Significant impact)**
- Feature doesn't work as designed
- Error messages displayed
- Data doesn't persist
- Dashboard sections broken
- Navigation broken

**Minor (Cosmetic or low impact)**
- Styling issues
- Text formatting
- Non-critical UI glitches
- Performance issues
- Loading state issues

---

## Test Completion Checklist

Before completing your QA session, verify:

- [ ] All 3 test accounts created successfully
- [ ] All test sections attempted (1-15)
- [ ] All critical checkpoints evaluated
- [ ] Pass/Fail marked for each test case
- [ ] All bugs documented with severity
- [ ] Screenshots/evidence collected for bugs
- [ ] Console errors noted
- [ ] Overall pass rate calculated
- [ ] Summary completed
- [ ] Recommendations provided

---

## Final Report Format

After completing all tests, create a summary report:

```markdown
# GolfBuddy QA Test Execution Report

**Date**: [Test date]
**Tester**: AI QA Agent
**Application**: GolfBuddy v1.0
**Environment**: Local development (http://localhost:3000)

## Test Summary

- **Total Test Cases**: 50+
- **Tests Executed**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Skipped**: [Number]
- **Pass Rate**: [Percentage]

## Critical Findings

### Critical Bugs (Severity: Critical)
[List all critical bugs with reference numbers]

### Major Issues (Severity: Major)
[List all major bugs with reference numbers]

### Minor Issues (Severity: Minor)
[List all minor bugs with reference numbers]

## Test Accounts Created

1. qatest1@test.com (QA Tester One) - Primary tester
2. qatest2@test.com (QA Tester Two) - Buddy/friend
3. qatest3@test.com (QA Tester Three) - Buddy/friend

## Feature Status

### Authentication ✅/❌
[Summary]

### Profile Management ✅/❌
[Summary]

### Dashboard ✅/❌
[Summary]

### Buddy System ✅/❌
[Summary]

### Tee Time System ✅/❌
[Summary]

### Weather Integration ✅/❌
[Summary]

### Navigation ✅/❌
[Summary]

## Overall Assessment

**Ready for Production**: YES / NO

**Confidence Level**: [High / Medium / Low]

**Critical Blockers**: [Number of critical bugs]

**Recommendation**: 
[Detailed recommendation based on findings]

## Next Steps

1. [Priority 1 action item]
2. [Priority 2 action item]
3. [Priority 3 action item]

## Additional Notes

[Any additional observations, comments, or recommendations]
```

---

## Important Reminders

1. **NO MOCK DATA**: All testing must use real Firebase data
2. **THREE ACCOUNTS**: You must create and use all 3 accounts
3. **DOCUMENT EVERYTHING**: Every bug, every error, every observation
4. **CONSOLE MONITORING**: Always watch console for errors
5. **PERSIST DATA**: Test that data persists after logout/login
6. **REAL INTERACTIONS**: Simulate real user behavior
7. **CROSS-ACCOUNT**: Test interactions between accounts
8. **DON'T SKIP**: Execute all test cases, even if time-consuming
9. **SCREENSHOTS**: Capture evidence of bugs
10. **FINAL CLEANUP**: Note if test data should be cleaned up

---

## Support Information

If you encounter issues while testing:

1. Check the browser console for error messages
2. Check the Network tab for failed API calls
3. Check Firebase console for database issues
4. Verify all 3 accounts are properly created
5. Ensure the dev server is running without errors
6. Try refreshing the page (Ctrl+Shift+R for hard refresh)
7. Check if service worker cache needs clearing (http://localhost:3000/clear-cache.html)

---

## Testing Best Practices

1. **Test in sequence**: Follow the order in the test plan
2. **One test at a time**: Don't rush through multiple tests
3. **Verify before moving on**: Ensure each test completes properly
4. **Account switching**: Remember which account you're using
5. **Clear cache if needed**: Use hard refresh if behavior seems cached
6. **Take breaks**: Testing is thorough work - take breaks to maintain focus
7. **Be thorough**: Check all aspects of expected behavior
8. **Think like a user**: Consider how real users would interact
9. **Edge cases**: Try unexpected inputs or actions
10. **Document as you go**: Don't wait until the end to document bugs

---

## Success Criteria

The application is considered successful if:

- ✅ All Critical Checkpoints pass
- ✅ Pass rate is above 85%
- ✅ Zero critical bugs
- ✅ No more than 5 major bugs
- ✅ All core features functional
- ✅ Data persists correctly
- ✅ Real data integration works
- ✅ Cross-account features work

---

## Ready to Begin?

1. Review this document thoroughly
2. Review QA_TEST_PLAN.md
3. Ensure development server is running
4. Open http://localhost:3000
5. Start with Phase 1: Environment Preparation
6. Follow the test plan step by step
7. Document everything
8. Submit final report when complete

**Good luck with your testing! 🎯**
