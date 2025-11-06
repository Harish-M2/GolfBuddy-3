# Firebase Setup Guide for GolfBuddy

## Step 1: Create Firebase Project (FREE)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `golfbuddy-app` (or your choice)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Set up Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add web app
4. Enter app nickname: "GolfBuddy Web"
5. Click "Register app"
6. Copy the `firebaseConfig` object

## Step 5: Update Your Code

Replace the placeholder config in `src/firebase/config.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 6: Set up Firestore Security Rules (Later)

For now, the test mode rules allow read/write access for 30 days.
We'll update security rules in a later stage.

## Step 7: Test the Setup

1. Start your React app: `npm start`
2. Try signing up with a test email
3. Check Firebase Console > Authentication to see the new user
4. Check Firestore > Data to see the user document

## What's Working Now

✅ **User Authentication**: Sign up, sign in, sign out
✅ **User Profiles**: Basic profile creation in Firestore
✅ **Database Structure**: Ready for golf buddy data
✅ **Real-time Auth**: App responds to login/logout
✅ **Free Tier**: Everything runs on Firebase free tier

## Next Stages

1. **Stage 2**: Update Golf page to use real Firebase data
2. **Stage 3**: Add buddy request functionality
3. **Stage 4**: Add profile management
4. **Stage 5**: Add real-time notifications
5. **Stage 6**: Deploy to Firebase Hosting (also free!)

## Free Tier Limits (More than enough for development)

- **Authentication**: Unlimited users
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Hosting**: 10GB storage, 360MB/day transfer

## Need Help?

If you need help setting up Firebase, just let me know which step you're on!
