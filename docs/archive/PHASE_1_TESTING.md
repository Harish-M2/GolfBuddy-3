# 🧪 Phase 1 Testing Guide - Buddy Request Management

## Prerequisites
✅ App is running at `http://localhost:3000`
✅ Firebase configured and connected
✅ No compilation errors

---

## 🎯 Quick Test Plan (10 minutes)

### Test 1: Accept a Buddy Request (5 min)

**Setup:**
1. Open app in **two different browsers** (Chrome and Safari, or Chrome normal + incognito)
2. Create/login as **User A** in Browser 1
3. Create/login as **User B** in Browser 2

**Steps:**

**Browser 1 (User A):**
1. Go to Settings → Fill out profile (name, skill level, location)
2. Go to "Find Buddies" page
3. You should see User B in the list
4. Click "Send Request" button
5. ✅ **Verify:** Success message appears
6. ✅ **Verify:** Button changes to "Request Sent"

**Browser 2 (User B):**
1. Go to Settings page
2. ✅ **Verify:** "Buddy Requests" card shows badge with "1"
3. ✅ **Verify:** You see User A's name (not just "Unknown User")
4. ✅ **Verify:** Request shows User A's message
5. Click the **✓ (checkmark)** button to accept
6. ✅ **Verify:** Success message: "You are now buddies with User A!"
7. ✅ **Verify:** Request disappears from Buddy Requests
8. ✅ **Verify:** User A appears in "My Golf Buddies" section
9. ✅ **Verify:** Stats show "1 Golf Buddy"

**Browser 1 (User A):**
1. Go to Settings page
2. ✅ **Verify:** User B appears in "My Golf Buddies" section
3. ✅ **Verify:** Stats show "1 Golf Buddy"

**Result:** ✅ PASS if all verifications succeed

---

### Test 2: Decline a Buddy Request (2 min)

**Browser 1 (User A):**
1. Go to "Find Buddies"
2. Create a **new test user (User C)**
3. Send request to User B

**Browser 2 (User B):**
1. Go to Settings
2. ✅ **Verify:** New request from User C appears
3. Click the **✗ (X button)** to decline
4. ✅ **Verify:** Success message: "Request declined"
5. ✅ **Verify:** Request disappears
6. ✅ **Verify:** User C does NOT appear in buddies list

**Result:** ✅ PASS if request declined successfully

---

### Test 3: View All Requests Dialog (1 min)

**Browser 2 (User B):**
1. In Settings, click "View All Requests"
2. ✅ **Verify:** Dialog opens
3. ✅ **Verify:** Shows "Received" section
4. ✅ **Verify:** Shows "Sent" section with any requests you sent
5. Click "Close"

**Result:** ✅ PASS if dialog displays correctly

---

### Test 4: View All Buddies Dialog (1 min)

**Browser 2 (User B):**
1. In "My Golf Buddies" card, click "View All Buddies"
2. ✅ **Verify:** Dialog opens showing User A
3. ✅ **Verify:** Shows User A's name, skill level, location
4. ✅ **Verify:** Shows email and phone if provided
5. Click "Close"

**Result:** ✅ PASS if buddy info displays correctly

---

### Test 5: Remove a Buddy (1 min)

**Browser 2 (User B):**
1. In "My Golf Buddies" card, find User A
2. Click the **✗ (X button)** next to User A
3. ✅ **Verify:** Confirmation prompt appears
4. Click "OK" to confirm
5. ✅ **Verify:** Success message appears
6. ✅ **Verify:** User A removed from buddies list
7. ✅ **Verify:** Stats update to "0 Golf Buddies"

**Browser 1 (User A):**
1. Refresh Settings page
2. ✅ **Verify:** User B is also removed from User A's buddies
3. ✅ **Verify:** Stats update to "0 Golf Buddies"

**Result:** ✅ PASS if buddy removed from both sides

---

## 🐛 Common Issues & Solutions

### Issue: "No requests appear"
**Check:**
- Both users have completed their profiles
- Request was actually sent (check browser console)
- Firebase Firestore rules allow read/write
- Try refreshing the page

### Issue: "Unknown User" instead of name
**Check:**
- Sender has filled out their display name
- Refresh the page to reload user profiles
- Check browser console for errors

### Issue: Buddy not removed from other user
**Check:**
- Firebase connection is working
- No errors in browser console
- Refresh the other user's page

### Issue: Stats not updating
**Solution:** Refresh the page - stats update on page load

---

## ✅ Testing Checklist

After completing all tests, check off these items:

- [ ] Can send buddy requests
- [ ] Requests show sender's name correctly
- [ ] Can accept buddy requests
- [ ] Both users become buddies (two-way)
- [ ] Can decline buddy requests
- [ ] Can view all requests in dialog
- [ ] Can view all buddies with contact info
- [ ] Can remove buddies
- [ ] Buddy removal works both ways
- [ ] Stats update correctly
- [ ] No console errors during testing

---

## 🎯 Expected Results Summary

| Action | Expected Behavior |
|--------|-------------------|
| Send Request | Success message, button changes to "Request Sent" |
| Accept Request | Both users become buddies, stats update |
| Decline Request | Request disappears, no buddy connection |
| View All Requests | Dialog shows received and sent requests |
| View All Buddies | Dialog shows buddy details and contact info |
| Remove Buddy | Removes from both users' buddy lists |

---

## 📊 Test Results

**Date:** ___________  
**Tester:** ___________

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Accept Request | ⬜ Pass ⬜ Fail | |
| Test 2: Decline Request | ⬜ Pass ⬜ Fail | |
| Test 3: View All Requests | ⬜ Pass ⬜ Fail | |
| Test 4: View All Buddies | ⬜ Pass ⬜ Fail | |
| Test 5: Remove Buddy | ⬜ Pass ⬜ Fail | |

**Overall Result:** ⬜ All Tests Pass ⬜ Some Issues Found

**Issues Found:**
- 
- 
- 

---

## 🚀 Next Steps After Testing

**If All Tests Pass:**
✅ Ready to move to Phase 2: Courses Page

**If Issues Found:**
1. Note the specific test that failed
2. Check browser console for errors
3. Verify Firebase connection
4. Let me know which test failed and I'll help fix it!

---

**Start Testing Now! Good luck! 🏌️‍♂️**

Report back with your results and we'll either fix issues or move to Phase 2!
