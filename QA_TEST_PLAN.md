# GolfBuddy QA Test Plan

## Test Environment Setup
- **Date**: November 14, 2025
- **URL**: http://localhost:3000
- **Accounts Required**: 3 test accounts
- **NO MOCK DATA**: All testing must use real Firebase data
- **Browser**: Latest Chrome/Edge

---

## Pre-Test Setup

### Account Creation
Create 3 test accounts with the following structure:

**Account 1 (Primary Tester)**
- Email: `qatest1@test.com`
- Password: `TestPass123!`
- Display Name: `QA Tester One`
- Location: `London`
- Skill Level: `Advanced`
- Bio: `Testing account for QA validation`

**Account 2 (Buddy/Friend)**
- Email: `qatest2@test.com`
- Password: `TestPass123!`
- Display Name: `QA Tester Two`
- Location: `London`
- Skill Level: `Intermediate`
- Bio: `Second testing account`

**Account 3 (Buddy/Friend)**
- Email: `qatest3@test.com`
- Password: `TestPass123!`
- Display Name: `QA Tester Three`
- Location: `Manchester`
- Skill Level: `Beginner`
- Bio: `Third testing account`

---

## Test Cases

### 1. Authentication Tests

#### 1.1 Sign Up
**Steps:**
1. Navigate to home page
2. Click "Sign Up" or "Get Started"
3. Enter email: `qatest1@test.com`
4. Enter password: `TestPass123!`
5. Submit registration form

**Expected:**
- ✅ Account created successfully
- ✅ Redirected to profile setup or dashboard
- ✅ User is logged in
- ✅ No errors displayed

**Pass/Fail:** ______

---

#### 1.2 Sign In
**Steps:**
1. Sign out if logged in
2. Navigate to home page
3. Click "Sign In"
4. Enter email: `qatest1@test.com`
5. Enter password: `TestPass123!`
6. Click submit

**Expected:**
- ✅ Successfully logged in
- ✅ Redirected to Dashboard
- ✅ User profile visible in header
- ✅ No errors displayed

**Pass/Fail:** ______

---

#### 1.3 Sign Out
**Steps:**
1. While logged in, click user avatar/menu
2. Click "Sign Out"

**Expected:**
- ✅ Successfully logged out
- ✅ Redirected to home page
- ✅ Protected routes no longer accessible
- ✅ No errors displayed

**Pass/Fail:** ______

---

### 2. Profile Management Tests

#### 2.1 Update Profile Information
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to Settings page
3. Update profile fields:
   - Display Name: `QA Tester One`
   - Location: `London`
   - Skill Level: `Advanced`
   - Bio: `Testing account for QA validation`
   - Phone: `+44 123 456 7890` (optional)
4. Click "Save Changes"

**Expected:**
- ✅ Profile updated successfully
- ✅ Success message displayed
- ✅ Changes reflected immediately in header
- ✅ Changes persist after page refresh

**Pass/Fail:** ______

---

#### 2.2 Profile Picture Upload (if implemented)
**Steps:**
1. Navigate to Settings
2. Click profile picture upload
3. Select an image file
4. Confirm upload

**Expected:**
- ✅ Image uploads successfully
- ✅ New profile picture visible immediately
- ✅ Image persists after refresh

**Pass/Fail:** ______ (Skip if not implemented)

---

### 3. Dashboard Tests

#### 3.1 Dashboard Load
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to Dashboard

**Expected:**
- ✅ Dashboard loads without errors
- ✅ Weather widget displays real weather data for user's location (London)
- ✅ Temperature displayed correctly
- ✅ Weather conditions visible
- ✅ Stats section visible (even if showing placeholder numbers)

**Pass/Fail:** ______

---

#### 3.2 Upcoming Events (Empty State)
**Steps:**
1. On Dashboard, locate "Upcoming Events" card
2. Verify initial state (before creating any tee times)

**Expected:**
- ✅ Shows "No upcoming tee times scheduled" message
- ✅ Shows "Schedule a Tee Time" button
- ✅ No loading errors

**Pass/Fail:** ______

---

#### 3.3 My Golf Buddies (Empty State)
**Steps:**
1. On Dashboard, locate "My Golf Buddies" card
2. Verify initial state (before adding any buddies)

**Expected:**
- ✅ Shows "No buddies connected yet" message
- ✅ Shows "Find Golf Buddies" button
- ✅ No loading errors

**Pass/Fail:** ______

---

### 4. Golf Buddy Finder Tests

#### 4.1 View All Golfers
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to "Find Your Golf Buddy" page (via GOLF menu)

**Expected:**
- ✅ Page loads successfully
- ✅ Search/filter section visible
- ✅ At least 0-1 other golfers displayed (qatest2 and qatest3 if they've set up profiles)
- ✅ Golfer cards show:
  - Profile picture or avatar
  - Name
  - Skill level chip
  - Location
  - Availability status
  - Bio (if provided)
  - Email/Phone chips (if provided)
  - "Send Buddy Request" button

**Pass/Fail:** ______

---

#### 4.2 Send Buddy Request
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to Golf Buddy Finder
3. Find Account 2 (qatest2@test.com) card
4. Click "Send Buddy Request" button

**Expected:**
- ✅ Button shows loading state
- ✅ Button changes to "Request Sent" with green color
- ✅ Button becomes disabled
- ✅ Checkmark icon appears
- ✅ Success message/notification (if implemented)
- ✅ Request persists after page refresh

**Pass/Fail:** ______

---

#### 4.3 Filter Golfers by Skill Level
**Steps:**
1. On Golf Buddy Finder page
2. Use skill level filter dropdown
3. Select "Intermediate"

**Expected:**
- ✅ Only intermediate golfers displayed
- ✅ Filter works correctly
- ✅ Results update immediately

**Pass/Fail:** ______ (Skip if filter not fully implemented)

---

#### 4.4 Search Golfers by Location
**Steps:**
1. On Golf Buddy Finder page
2. Enter location in search field (e.g., "London")
3. Click search button

**Expected:**
- ✅ Only golfers from searched location displayed
- ✅ Search works correctly
- ✅ Results update immediately

**Pass/Fail:** ______ (Skip if search not fully implemented)

---

### 5. Buddy Request Notification Tests

#### 5.1 Receive Buddy Request Notification
**Steps:**
1. Log out from Account 1
2. Log in as `qatest2@test.com` (Account 2)
3. Check notification bell icon in header

**Expected:**
- ✅ Notification badge shows count (1)
- ✅ Badge is visible and highlighted
- ✅ No errors in console

**Pass/Fail:** ______

---

#### 5.2 View Buddy Request in Notifications
**Steps:**
1. Still logged in as `qatest2@test.com`
2. Click notification bell icon
3. View notification dropdown

**Expected:**
- ✅ Notification dropdown opens
- ✅ Shows "New Buddy Request" notification
- ✅ Shows sender name (QA Tester One)
- ✅ Shows message text
- ✅ Accept button (green checkmark) visible
- ✅ Decline button (red X) visible
- ✅ Notification highlighted as unread

**Pass/Fail:** ______

---

#### 5.3 Accept Buddy Request
**Steps:**
1. Still viewing notification dropdown
2. Click green checkmark (Accept) button

**Expected:**
- ✅ Shows loading spinner briefly
- ✅ Notification disappears from list
- ✅ Success indication (notification removed)
- ✅ Dropdown updates immediately
- ✅ No errors in console

**Pass/Fail:** ______

---

#### 5.4 Verify Buddy Added to Dashboard
**Steps:**
1. Still logged in as `qatest2@test.com`
2. Navigate to Dashboard
3. Check "My Golf Buddies" section

**Expected:**
- ✅ Shows buddy card for "QA Tester One"
- ✅ Displays buddy's information:
  - Name
  - Skill level
  - Location
  - Avatar
- ✅ Card is clickable

**Pass/Fail:** ______

---

#### 5.5 View Buddy Profile Modal
**Steps:**
1. Still on Dashboard
2. Click on buddy card for "QA Tester One"

**Expected:**
- ✅ Modal opens with full buddy details
- ✅ Shows:
  - Profile picture/avatar
  - Full name
  - Skill level
  - Location
  - Bio
  - Email (if provided)
  - Phone (if provided)
- ✅ Close button works
- ✅ Modal has proper styling

**Pass/Fail:** ______

---

#### 5.6 Decline Buddy Request (Test with Account 3)
**Steps:**
1. Log in as `qatest1@test.com`
2. Send buddy request to Account 3 (qatest3@test.com)
3. Log out and log in as `qatest3@test.com`
4. Open notifications
5. Click red X (Decline) button

**Expected:**
- ✅ Shows loading spinner briefly
- ✅ Notification disappears from list
- ✅ Request declined (not added as buddy)
- ✅ No errors in console

**Pass/Fail:** ______

---

### 6. Tee Time Creation Tests

#### 6.1 Navigate to Tee Times Page
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to Tee Times page (via GOLF menu)

**Expected:**
- ✅ Page loads successfully
- ✅ Shows three tabs: Upcoming, Past, My Events
- ✅ Shows "Schedule Tee Time" button
- ✅ Empty state visible initially

**Pass/Fail:** ______

---

#### 6.2 Create Tee Time (Solo)
**Steps:**
1. On Tee Times page
2. Click "Schedule Tee Time" button
3. Fill in form:
   - Course Name: `Test Golf Club`
   - Course Address: `123 Test Street, London`
   - Date: Select tomorrow's date
   - Time: `14:00`
   - Max Players: `4`
   - Notes: `QA Testing tee time`
   - Invited Buddies: Leave empty
4. Click "Create Tee Time"

**Expected:**
- ✅ Dialog closes
- ✅ Success message displayed
- ✅ Tee time appears in "My Events" tab
- ✅ Shows in "Upcoming" tab
- ✅ Display includes:
  - Course name
  - Date and time
  - Location
  - Number of confirmed players (1/4)
  - RSVP status (Accepted - you're the creator)

**Pass/Fail:** ______

---

#### 6.3 Create Tee Time with Buddy Invitations
**Steps:**
1. Click "Schedule Tee Time" again
2. Fill in form:
   - Course Name: `Royal Golf Course`
   - Course Address: `456 Royal Road, London`
   - Date: Select date 3 days from now
   - Time: `10:00`
   - Max Players: `4`
   - Notes: `Morning round with buddies`
   - Invited Buddies: Check "QA Tester Two" (your accepted buddy)
3. Click "Create Tee Time"

**Expected:**
- ✅ Dialog closes
- ✅ Success message displayed
- ✅ Tee time created
- ✅ Invited buddy list shows "QA Tester Two"
- ✅ Shows 1/4 players (only creator confirmed initially)

**Pass/Fail:** ______

---

#### 6.4 View Created Tee Time Details
**Steps:**
1. In "My Events" tab
2. Click on the tee time created with buddy invitation

**Expected:**
- ✅ Details modal/card opens
- ✅ Shows all information:
  - Course name and address
  - Date and time
  - Max players
  - Notes
  - Invited buddies list
  - RSVP status for each player
  - Creator badge/indicator

**Pass/Fail:** ______

---

### 7. Tee Time RSVP Tests

#### 7.1 Receive Tee Time Invitation
**Steps:**
1. Log out from Account 1
2. Log in as `qatest2@test.com`
3. Navigate to Tee Times page
4. Check "Upcoming" tab

**Expected:**
- ✅ Invited tee time appears in list
- ✅ Shows invitation indicator
- ✅ RSVP options visible (Accept/Decline)
- ✅ Shows "Pending" status

**Pass/Fail:** ______

---

#### 7.2 Accept Tee Time Invitation
**Steps:**
1. Still as `qatest2@test.com`
2. Click on the invited tee time
3. Click "Accept" or "Going" button

**Expected:**
- ✅ RSVP updates to "Accepted"
- ✅ Player count increases (2/4)
- ✅ Button changes to show accepted status
- ✅ Changes persist after refresh

**Pass/Fail:** ______

---

#### 7.3 Verify RSVP on Creator's Account
**Steps:**
1. Log out and log back in as `qatest1@test.com`
2. Navigate to Tee Times
3. View the tee time you created with invitations

**Expected:**
- ✅ Shows updated player count (2/4)
- ✅ "QA Tester Two" shows "Accepted" status
- ✅ RSVP list accurate

**Pass/Fail:** ______

---

#### 7.4 Decline Tee Time Invitation (Create new test)
**Steps:**
1. As `qatest1@test.com`, create another tee time
2. Invite "QA Tester Three" (if connected as buddy)
3. Log in as `qatest3@test.com`
4. Navigate to Tee Times
5. Click "Decline" or "Can't Go" on invitation

**Expected:**
- ✅ RSVP updates to "Declined"
- ✅ Player count doesn't increase
- ✅ Status persists after refresh

**Pass/Fail:** ______

---

### 8. Dashboard Integration Tests

#### 8.1 Verify Tee Times Show on Dashboard
**Steps:**
1. Log in as `qatest1@test.com`
2. Navigate to Dashboard
3. Check "Upcoming Events" section

**Expected:**
- ✅ Shows created tee times
- ✅ Displays up to 3 upcoming events
- ✅ Shows:
  - Date (day and month)
  - Course name
  - Time
  - Address
- ✅ Events are clickable
- ✅ Clicking navigates to Tee Times page

**Pass/Fail:** ______

---

#### 8.2 Verify Buddies Show on Dashboard
**Steps:**
1. Still on Dashboard
2. Check "My Golf Buddies" section

**Expected:**
- ✅ Shows accepted buddies (QA Tester Two)
- ✅ Displays up to 5 buddies
- ✅ Shows:
  - Name
  - Avatar
  - Skill level
  - Location
- ✅ Cards are clickable
- ✅ Clicking opens buddy profile modal

**Pass/Fail:** ______

---

### 9. Weather Widget Tests

#### 9.1 Real Weather Data Display
**Steps:**
1. Log in as any account
2. View Dashboard
3. Check weather widget

**Expected:**
- ✅ Shows REAL weather (not mock 22°C)
- ✅ Temperature matches user's location
- ✅ Weather condition icon displayed
- ✅ Additional data shown:
  - Humidity
  - Wind speed
  - Visibility
- ✅ API fetch successful (check console)

**Pass/Fail:** ______

---

### 10. Navigation Tests

#### 10.1 Main Navigation Works
**Steps:**
1. Log in as any account
2. Test all navigation links:
   - Home
   - Dashboard
   - SOCIAL dropdown (Buddies, Messages if available)
   - GOLF dropdown (Golf Buddy Finder, Tee Times, Scores, Photos)

**Expected:**
- ✅ All links navigate correctly
- ✅ Pages load without errors
- ✅ Active page highlighted in nav
- ✅ Dropdowns work smoothly

**Pass/Fail:** ______

---

#### 10.2 Mobile Navigation (Responsive)
**Steps:**
1. Resize browser to mobile width (< 768px)
2. Check navigation functionality

**Expected:**
- ✅ Hamburger menu appears
- ✅ Menu opens on click
- ✅ All navigation items accessible
- ✅ Responsive layout works

**Pass/Fail:** ______ (Skip if not testing mobile)

---

### 11. Settings Page Tests

#### 11.1 View Settings
**Steps:**
1. Log in as any account
2. Navigate to Settings

**Expected:**
- ✅ Page loads successfully
- ✅ Shows profile information form
- ✅ Shows buddy requests section
- ✅ All fields populated with current data

**Pass/Fail:** ______

---

#### 11.2 Manage Buddy Requests in Settings
**Steps:**
1. On Settings page
2. Check Buddy Requests section

**Expected:**
- ✅ Shows pending buddy requests
- ✅ Shows sent requests
- ✅ Accept/Decline buttons work
- ✅ Status updates properly

**Pass/Fail:** ______

---

### 12. Error Handling Tests

#### 12.1 Invalid Login Credentials
**Steps:**
1. Log out
2. Try to log in with wrong password

**Expected:**
- ✅ Error message displayed
- ✅ User not logged in
- ✅ Error is clear and helpful

**Pass/Fail:** ______

---

#### 12.2 Form Validation
**Steps:**
1. Try to create tee time without required fields
2. Try to update profile with invalid email format

**Expected:**
- ✅ Validation errors displayed
- ✅ Form doesn't submit
- ✅ Error messages clear

**Pass/Fail:** ______

---

#### 12.3 Network Error Handling
**Steps:**
1. Open DevTools Network tab
2. Throttle to "Offline"
3. Try to load Dashboard or fetch data
4. Re-enable network

**Expected:**
- ✅ Error message displayed
- ✅ No app crash
- ✅ Recovers when network restored

**Pass/Fail:** ______ (Optional test)

---

### 13. Data Persistence Tests

#### 13.1 Profile Data Persists
**Steps:**
1. Update profile information
2. Log out
3. Log back in
4. Check profile

**Expected:**
- ✅ All changes saved
- ✅ Data loads correctly
- ✅ No data loss

**Pass/Fail:** ______

---

#### 13.2 Tee Times Persist
**Steps:**
1. Create tee time
2. Log out
3. Log back in
4. Check Tee Times page

**Expected:**
- ✅ Tee time still visible
- ✅ All details intact
- ✅ RSVPs maintained

**Pass/Fail:** ______

---

#### 13.3 Buddy Connections Persist
**Steps:**
1. Accept buddy request
2. Log out and back in
3. Check Dashboard buddies section

**Expected:**
- ✅ Buddy connection maintained
- ✅ Shows in both accounts
- ✅ No duplicate connections

**Pass/Fail:** ______

---

### 14. UI/UX Tests

#### 14.1 Card Styling (Golf Buddy Finder)
**Steps:**
1. Navigate to Golf Buddy Finder
2. Inspect golfer cards

**Expected:**
- ✅ Cards have proper height (340px)
- ✅ Text is readable and well-spaced
- ✅ Avatar size appropriate (60px)
- ✅ Hover effects work smoothly
- ✅ Buttons have proper gradients
- ✅ Overall appearance is polished

**Pass/Fail:** ______

---

#### 14.2 Dark Mode Toggle (if implemented)
**Steps:**
1. Toggle dark mode switch in header
2. Check all pages

**Expected:**
- ✅ Theme switches properly
- ✅ All text readable
- ✅ Colors appropriate
- ✅ Persists after refresh

**Pass/Fail:** ______ (Skip if not implemented)

---

#### 14.3 Loading States
**Steps:**
1. Observe loading states throughout app:
   - Dashboard data loading
   - Buddy requests loading
   - Tee times loading

**Expected:**
- ✅ Loading spinners appear
- ✅ Skeleton screens or placeholders
- ✅ Smooth transitions
- ✅ No layout shift

**Pass/Fail:** ______

---

### 15. Performance Tests

#### 15.1 Page Load Times
**Steps:**
1. Measure load time for key pages using DevTools Performance tab

**Expected:**
- ✅ Dashboard: < 3 seconds
- ✅ Golf Finder: < 3 seconds
- ✅ Tee Times: < 3 seconds
- ✅ No excessive re-renders

**Pass/Fail:** ______ (Optional)

---

#### 15.2 Service Worker Caching
**Steps:**
1. Load app
2. Open DevTools Application tab
3. Check Service Workers

**Expected:**
- ✅ Service worker registered
- ✅ Cache version: v1.0.1
- ✅ Static assets cached

**Pass/Fail:** ______ (Optional)

---

## Test Summary

### Overall Statistics
- **Total Test Cases**: 50+
- **Passed**: ______
- **Failed**: ______
- **Skipped**: ______
- **Pass Rate**: ______%

### Critical Issues Found
List any critical bugs or issues:

1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Minor Issues Found
List any minor bugs or improvements:

1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Recommendations
List recommendations for improvement:

1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

---

## Sign-off

**Tester Name**: ___________________________
**Date**: ___________________________
**Signature**: ___________________________

**Overall Assessment**: 
- [ ] Ready for Production
- [ ] Needs Minor Fixes
- [ ] Needs Major Fixes
- [ ] Not Ready

**Comments**:
_______________________________________________
_______________________________________________
_______________________________________________
