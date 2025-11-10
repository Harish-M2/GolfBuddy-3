# Automated QA User Cleanup Instructions

## 🎯 Quick Setup Guide

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/golfbuddy-app-c879a/settings/serviceaccounts/adminsdk)
2. Navigate to: **Project Settings** → **Service Accounts**
3. Click **Generate New Private Key**
4. Save the downloaded file as `serviceAccountKey.json` in your project root

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to git! Add it to `.gitignore`

### Step 3: Run the Cleanup Script

```bash
node delete-qa-users.js
```

---

## 📋 What the Script Does

1. ✅ Reads all QA user IDs from `qa_user_ids.txt`
2. ✅ Deletes each user from Firebase Authentication
3. ✅ Deletes each user document from Firestore `users` collection
4. ✅ Provides progress updates for each deletion
5. ✅ Generates a summary report
6. ✅ Verifies cleanup was successful

---

## 🔒 Security Notes

- The service account key gives full admin access to your Firebase project
- Keep it secure and never share it
- Delete it after you're done with cleanup
- Consider using it only on your local machine

---

## 🚀 Alternative: Manual Cleanup via Firebase Console

If you prefer a manual approach (safer but slower):

### Firebase Console Steps:

1. **Open Firebase Console**
   ```bash
   open https://console.firebase.google.com/project/golfbuddy-app-c879a/authentication/users
   ```

2. **For Each QA User:**
   - Search for: `qa.tester`
   - Click on the user
   - Click the "⋮" menu (top right)
   - Select "Delete account"
   - Confirm deletion

3. **Clean Up Firestore:**
   - Go to Firestore Database
   - Navigate to `users` collection
   - Delete documents for QA tester emails

---

## 📊 Expected Results

**Before Cleanup:**
- Total users: 43
- QA users: 39
- Legitimate users: 4

**After Cleanup:**
- Total users: 4
- QA users: 0
- Legitimate users: 4

---

## ✅ Verification

After cleanup, run this to verify:

```bash
# Export users again
firebase auth:export users_after_cleanup.json --project golfbuddy-app-c879a

# Count remaining users
cat users_after_cleanup.json | jq '.users | length'

# Check for QA users
cat users_after_cleanup.json | jq '[.users[] | select(.email | test("qa\\.tester"))] | length'
```

Expected output: `0` (no QA users remaining)

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'firebase-admin'"
**Solution:** Run `npm install firebase-admin`

### Issue: "Error: Could not load the default credentials"
**Solution:** Make sure `serviceAccountKey.json` is in the project root

### Issue: "Permission denied"
**Solution:** Verify the service account has proper permissions in Firebase Console

---

## 🎉 Ready to Clean Up!

Choose your method:
1. **Automated** (5 minutes): Run `node delete-qa-users.js`
2. **Manual** (30 minutes): Use Firebase Console

Both methods will achieve the same result. The automated method is faster but requires setup.
