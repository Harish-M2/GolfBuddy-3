# 🔐 Test Account Setup Guide

**IMPORTANT:** Before running automated tests, you need test accounts in Firebase.

---

## Option 1: Create Test Accounts (Recommended)

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project: `golfbuddy-app-c879a`
3. Navigate to **Authentication** → **Users**

### Step 2: Create 3 Test Accounts

Click **"Add User"** button and create these accounts:

#### Account 1 (Primary Tester)
```
Email:    qa.tester1@testmail.com
Password: TestPass123!
```

#### Account 2 (Buddy Interactions)
```
Email:    qa.tester2@testmail.com
Password: TestPass123!
```

#### Account 3 (Chat Testing)
```
Email:    qa.tester3@testmail.com
Password: TestPass123!
```

### Step 3: Set Display Names (Optional but Recommended)

For each user:
1. Click on the user in Firebase Console
2. Edit the user
3. Add display name: `QA Tester 1`, `QA Tester 2`, `QA Tester 3`

---

## Option 2: Use Your Own Accounts

If you prefer to use existing accounts:

### Update Test Data File

Edit: `tests/helpers/test-data.js`

```javascript
export const testAccounts = {
  primary: {
    email: 'your.email1@example.com',
    password: 'YourPassword123!',
    displayName: 'Your Name 1'
  },
  buddy: {
    email: 'your.email2@example.com',
    password: 'YourPassword123!',
    displayName: 'Your Name 2'
  },
  chat: {
    email: 'your.email3@example.com',
    password: 'YourPassword123!',
    displayName: 'Your Name 3'
  }
};
```

---

## Step 4: Verify Setup

### Quick Verification Test

```bash
# Test login functionality
npx playwright test tests/auth.spec.js -g "1.2"
```

Expected result:
```
✅ TEST SUITE 1: Authentication & Authorization › 1.2 User Login (passed)
```

If you see ❌:
1. Double-check credentials in Firebase Console
2. Verify credentials match in `test-data.js`
3. Ensure accounts are enabled (not disabled)

---

## Step 5: Setup Buddy Relationships (Optional)

For buddy tests to work optimally:

### Manual Setup:
1. Log in as `qa.tester1@testmail.com`
2. Navigate to Buddies page
3. Add `qa.tester2@testmail.com` as buddy
4. Log out and log in as `qa.tester2@testmail.com`
5. Accept buddy request from tester1

### Or Let Tests Create Relationships:
The tests will create buddy relationships automatically, but some tests may fail on first run.

---

## Step 6: Setup Chat (Optional)

For chat tests to have existing conversations:

1. Log in as `qa.tester1@testmail.com`
2. Start chat with `qa.tester2@testmail.com`
3. Send a test message
4. Log out

This creates an existing chat that tests can use.

---

## Troubleshooting

### "User not found" Error
**Problem:** Test accounts don't exist in Firebase

**Solution:** Create accounts in Firebase Console (see Step 2 above)

### "Invalid password" Error
**Problem:** Password in `test-data.js` doesn't match Firebase

**Solution:** 
1. Go to Firebase Console
2. Reset password for test account
3. Update `test-data.js` with new password

### "Email already in use" Error (when creating accounts)
**Problem:** Accounts already exist

**Solution:** Either:
- Use existing accounts (Option 2 above)
- Delete old accounts and recreate them
- Choose different email addresses

---

## Security Notes

### ⚠️ Important:
- **DO NOT** use real/personal email addresses for test accounts
- **DO NOT** commit real passwords to git
- Test accounts should use **disposable email addresses**
- Use strong passwords even for test accounts

### Recommended Email Services:
- testmail.com (no registration needed)
- guerrillamail.com
- temp-mail.org
- maildrop.cc

---

## Quick Setup Commands

### Create Test Accounts via Firebase CLI (Advanced)

If you have Firebase Admin SDK access:

```bash
# Add this to a setup script
firebase auth:import test-users.json --project golfbuddy-app-c879a
```

Where `test-users.json` contains:
```json
{
  "users": [
    {
      "email": "qa.tester1@testmail.com",
      "password": "TestPass123!",
      "displayName": "QA Tester 1"
    },
    {
      "email": "qa.tester2@testmail.com",
      "password": "TestPass123!",
      "displayName": "QA Tester 2"
    },
    {
      "email": "qa.tester3@testmail.com",
      "password": "TestPass123!",
      "displayName": "QA Tester 3"
    }
  ]
}
```

---

## Verification Checklist

Before running full test suite:

- [ ] Created 3 test accounts in Firebase
- [ ] Verified accounts are enabled
- [ ] Updated `test-data.js` with correct credentials (if using custom accounts)
- [ ] Ran quick verification test (auth login test)
- [ ] (Optional) Created buddy relationships
- [ ] (Optional) Created test chat messages

---

## Next Steps

Once accounts are set up:

```bash
# Run full test suite
npm run test:ai

# Or run specific suites
npm test tests/auth.spec.js
npm test tests/buddies.spec.js
npm test tests/chat.spec.js
```

---

**Ready to test!** 🚀

If you encounter issues, see `docs/AI_TESTING_AGENT_GUIDE.md` for troubleshooting.
