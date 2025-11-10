# QA User Cleanup Summary

## 📊 Current Status

### User Counts:
- **Total Users**: 43
- **QA Test Accounts**: 39 (to be removed)
- **Legitimate Users**: 4 (to be kept)

### QA Test Accounts Pattern:
- Email format: `qa.tester.{timestamp}@testmail.com`
- Display Name: "QA Tester New"
- Created during automated testing

### Legitimate Users (4):
1. justinsamra84@gmail.com (Deepeh)
2. [3 other non-QA users]

---

## 🎯 Cleanup Options

### Option 1: Firebase Console (RECOMMENDED - Manual but Safe)

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/golfbuddy-app-c879a/authentication/users)
2. Navigate to: **Authentication** → **Users** tab
3. Filter/search for users with email pattern: `qa.tester`
4. Select users and delete them one by one or in batches
5. This ensures you don't accidentally delete legitimate users

**Pros:**
- Visual confirmation of what you're deleting
- Safe - can review each user before deletion
- No risk of accidentally deleting legitimate users

**Cons:**
- Manual process for 39 users
- Time-consuming (but worth it for safety)

---

### Option 2: Use Firebase Admin SDK (Programmatic)

If you want to automate this, you'll need to:

1. Create a Node.js script using Firebase Admin SDK
2. The script would:
   - Initialize Firebase Admin
   - List all users
   - Filter QA tester accounts
   - Delete them programmatically

**Would you like me to create this script?**

---

## 📋 QA User IDs Exported

All 39 QA user IDs have been exported to: `qa_user_ids.txt`

Sample of users to be deleted:
```
0GDwosj7hPhPoWoVPyC4uSTswQ13
0Vn4Pc2S4kcVa16Zi502eGG3S7z1
5ZG2IKFqX7S3VzhsuEtzmyN2Ffm1
... (36 more)
```

---

## ⚠️ Important Notes

1. **Backup Created**: `users.json` contains all user data before cleanup
2. **Clean Version Ready**: `users_clean.json` contains only the 4 legitimate users
3. **Firestore Cleanup**: Remember to also delete QA user documents from Firestore `users` collection
4. **Production Impact**: The production app at https://golfbuddy-app-c879a.web.app currently has these 39 QA accounts

---

## 🚀 Recommended Action Plan

### Step 1: Verify Legitimate Users
Review the 4 legitimate users in Firebase Console to ensure they're correct.

### Step 2: Delete QA Accounts
Choose one of the options above to delete the 39 QA accounts.

### Step 3: Clean Up Firestore
After deleting from Authentication, also delete QA user documents from:
- Firestore → `users` collection
- Look for documents with QA tester emails

### Step 4: Verify Cleanup
After deletion, verify:
- Only 4 users remain in Authentication
- No QA documents in Firestore
- Production app authentication still works

---

## 🛠️ Quick Commands

```bash
# View QA user IDs
cat qa_user_ids.txt

# Count QA users
wc -l qa_user_ids.txt

# View clean user list (4 users)
cat users_clean.json | jq '.users[] | {email, displayName}'

# Open Firebase Console
open https://console.firebase.google.com/project/golfbuddy-app-c879a/authentication/users
```

---

## 📞 Next Steps

Would you like me to:
1. ✅ Create a Firebase Admin SDK script to automate deletion?
2. ✅ Provide step-by-step Firebase Console instructions?
3. ✅ Help clean up Firestore documents after Authentication cleanup?

Let me know how you'd like to proceed!
