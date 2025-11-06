# 🧪 GolfBuddy Testing Guide - Step by Step

## Prerequisites
- ✅ App is running at `http://localhost:3000`
- ✅ Firebase is configured
- ✅ No compilation errors

---

## Test 1️⃣: User Sign Up (5 minutes)

### What You'll Test:
- User registration with email/password
- Profile creation in Firebase
- Automatic login after signup

### Steps:
1. **Open the app** at `http://localhost:3000`
2. **Click the Account icon** (person icon) in the top-right corner
3. **Switch to "Sign Up" tab** if not already there
4. **Fill in the form:**
   ```
   Name: Test Golfer One
   Email: testgolfer1@golfbuddy.com
   Password: Test123!
   Confirm Password: Test123!
   ```
5. **Click "Sign Up"** button
6. **Expected Result:**
   - ✅ Modal closes
   - ✅ App navigates to home page
   - ✅ Top-right shows "Test Golfer One" instead of account icon
   - ✅ You're now logged in

### Verify in Firebase Console:
1. Open: https://console.firebase.google.com/project/golfbuddy-app-c879a/authentication/users
2. You should see 1 user: `testgolfer1@golfbuddy.com`

### If It Fails:
- ❌ **"Email already in use"** → Use a different email
- ❌ **"Permission denied"** → Check Firestore rules are in test mode
- ❌ **No error but doesn't work** → Check browser console (F12)

---

## Test 2️⃣: User Sign Out & Sign In (2 minutes)

### What You'll Test:
- Logout functionality
- Login with existing credentials
- Session persistence

### Steps:
1. **Click your name** in the top-right
2. **Click "Logout"**
3. **Expected Result:**
   - ✅ Returns to logged-out state
   - ✅ Shows account icon again
4. **Click Account icon** again
5. **Switch to "Sign In" tab**
6. **Enter credentials:**
   ```
   Email: testgolfer1@golfbuddy.com
   Password: Test123!
   ```
7. **Click "Sign In"**
8. **Expected Result:**
   - ✅ Successfully logs in
   - ✅ Shows your name again

---

## Test 3️⃣: Profile Setup (3 minutes)

### What You'll Test:
- Navigation to Settings
- Profile information update
- Data persistence in Firestore

### Steps:
1. **Ensure you're logged in** as testgolfer1@golfbuddy.com
2. **Click "Settings"** in the navigation menu
3. **Fill out your profile:**
   ```
   Skill Level: Intermediate
   Location: San Francisco, CA
   Phone: (415) 555-0123
   Bio: Love playing golf on weekends! Looking for friendly buddies.
   ```
4. **Click "Update Profile"** button
5. **Expected Result:**
   - ✅ Success message appears
   - ✅ "Profile updated successfully!"

### Verify in Firebase Console:
1. Open: https://console.firebase.google.com/project/golfbuddy-app-c879a/firestore/data
2. Navigate to `users` collection
3. Find your user document
4. Should contain all the profile data you entered

---

## Test 4️⃣: Create Additional Test Users (5 minutes)

### Why:
To test the buddy discovery feature, we need multiple users.

### Steps:
**Repeat Test 1 for 2 more users:**

**User 2:**
```
Name: Jane Golf Pro
Email: janegolf@golfbuddy.com
Password: Test123!
Skill Level: Advanced
Location: San Francisco, CA
Bio: Been playing for 10 years. Happy to give tips!
```

**User 3:**
```
Name: Bob Beginner
Email: bobbeginner@golfbuddy.com
Password: Test123!
Skill Level: Beginner
Location: Oakland, CA
Bio: Just started playing. Would love a patient buddy!
```

**After creating each user:**
- Log in
- Go to Settings
- Fill out their profile
- Log out
- Create next user

---

## Test 5️⃣: Buddy Discovery (3 minutes)

### What You'll Test:
- Finding other golfers
- Filtering by skill level and location
- Display of golfer cards

### Steps:
1. **Log in as testgolfer1@golfbuddy.com**
2. **Click "Find Buddies"** in navigation
3. **Expected Result:**
   - ✅ Should see cards for Jane Golf Pro and Bob Beginner
   - ✅ Should NOT see your own profile
   - ✅ Each card shows: name, skill level, location, bio
4. **Test Filtering:**
   - Select "Advanced" skill level
   - Click "Search Golfers"
   - Should only see Jane Golf Pro
5. **Test Location Filter:**
   - Clear skill level
   - Enter "Oakland" in location
   - Click "Search Golfers"
   - Should only see Bob Beginner
6. **Click "Refresh"** to see all golfers again

---

## Test 6️⃣: Send Buddy Request (3 minutes)

### What You'll Test:
- Sending a buddy request
- Request state tracking
- Success notifications

### Steps:
1. **On Find Buddies page** (logged in as testgolfer1)
2. **Find Jane Golf Pro's card**
3. **Click "Send Request"** button
4. **Expected Results:**
   - ✅ Button shows "Sending..." briefly
   - ✅ Success message: "Request sent to Jane Golf Pro!"
   - ✅ Button changes to "Request Sent" (disabled, green outline)
   - ✅ Bottom of page shows: "You've sent 1 buddy request"
5. **Send another request to Bob Beginner**
6. **Expected Result:**
   - ✅ Counter updates to "You've sent 2 buddy requests"
7. **Refresh the page**
8. **Expected Result:**
   - ✅ Buttons still show "Request Sent" (state persists)

### Verify in Firebase Console:
1. Open Firestore console
2. Look for `buddyRequests` collection
3. Should see 2 documents with your requests

---

## Test 7️⃣: Cross-User Verification (Optional, 3 minutes)

### What You'll Test:
- Viewing requests from another user's perspective

### Steps:
1. **Log out** from testgolfer1
2. **Log in as janegolf@golfbuddy.com**
3. **Go to Settings page**
4. **Scroll down to "Buddy Requests" section**
5. **Expected Result:**
   - ✅ Should see 1 pending request from "Test Golfer One"
   - ✅ Can accept or decline (if implemented)

---

## 📊 Testing Checklist Summary

After completing all tests, you should have:

- [x] 3 user accounts created
- [x] All profiles filled out with complete information
- [x] Successfully tested login/logout flow
- [x] Verified buddy discovery shows other users
- [x] Tested filtering by skill level and location
- [x] Successfully sent 2 buddy requests
- [x] Verified request state persists across page refreshes
- [x] Confirmed all data appears in Firebase Console

---

## 🐛 Common Issues & Solutions

### Issue: "No golfers found" on Find Buddies page
**Solution:** Make sure:
- You've created multiple test users
- Each user has filled out their profile (especially skill level)
- You're logged in as a different user

### Issue: "Permission denied" errors
**Solution:**
1. Go to Firebase Console → Firestore → Rules
2. Make sure rules allow read/write:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

### Issue: Buddy requests don't persist
**Solution:** Check browser console for errors. May need to verify `database.js` functions.

### Issue: Can't sign up new users
**Solution:** 
- Make sure Email/Password auth is enabled in Firebase Console
- Check that email format is valid
- Ensure password is at least 6 characters

---

## ✅ What's Working Now

If all tests pass, you have a fully functional:
- ✨ User authentication system
- ✨ Profile management
- ✨ Golf buddy discovery with filtering
- ✨ Buddy request system with state tracking
- ✨ Real-time Firebase integration

---

## 🎯 Next Steps After Testing

Once testing is complete, we can move on to:
1. **Implement Courses Page** - Browse golf courses
2. **Add Buddy Request Management** - Accept/decline requests
3. **Create Messaging System** - Chat with your buddies
4. **Add Photo Upload** - Profile pictures
5. **Build Dashboard** - Stats and activity tracking

---

**Ready to start testing?** Follow the steps above and let me know if you encounter any issues! 🏌️‍♂️
