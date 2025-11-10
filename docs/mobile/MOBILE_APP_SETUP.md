# 📱 GolfBuddy Mobile App Setup Guide

**Date:** November 10, 2025  
**Status:** ✅ Capacitor Installed & Configured  
**Platforms:** iOS (App Store) + Android (Google Play)

---

## ✅ What's Been Completed

### 1. Capacitor Installation
- ✅ Installed `@capacitor/core` and `@capacitor/cli`
- ✅ Initialized Capacitor config (`capacitor.config.ts`)
- ✅ Added iOS platform (`ios/` folder created)
- ✅ Added Android platform (`android/` folder created)

### 2. Essential Plugins Installed
- ✅ `@capacitor/splash-screen` - App splash screen
- ✅ `@capacitor/keyboard` - Keyboard management
- ✅ `@capacitor/status-bar` - Status bar styling
- ✅ `@capacitor/geolocation` - GPS location services
- ✅ `@capacitor/camera` - Camera & photo access
- ✅ `@capacitor/filesystem` - File storage
- ✅ `@capacitor/app` - App state management

### 3. Build Scripts Added
New scripts in `package.json`:
```bash
npm run mobile:build      # Build web + sync to mobile
npm run mobile:sync       # Sync web assets to mobile
npm run ios:open          # Open iOS project in Xcode
npm run ios:run           # Build + open iOS
npm run android:open      # Open Android in Android Studio
npm run android:run       # Build + open Android
npm run mobile:clean      # Clean mobile build folders
```

---

## 📋 Prerequisites

### For iOS Development (Mac Only)
1. **Xcode** (from Mac App Store)
   - Download: https://apps.apple.com/app/xcode/id497799835
   - Size: ~15GB
   - Required for iOS builds

2. **CocoaPods** (Xcode dependency manager)
   ```bash
   sudo gem install cocoapods
   ```

3. **Apple Developer Account**
   - Free: For testing on your own device
   - Paid ($99/year): For App Store distribution
   - Sign up: https://developer.apple.com

### For Android Development (Mac/Windows/Linux)
1. **Android Studio**
   - Download: https://developer.android.com/studio
   - Size: ~1GB
   - Required for Android builds

2. **Java Development Kit (JDK 17)**
   - Comes with Android Studio
   - Or install separately: `brew install openjdk@17`

3. **Android SDK & Build Tools**
   - Installed via Android Studio
   - SDK 33+ recommended

4. **Google Play Developer Account**
   - One-time fee: $25
   - Sign up: https://play.google.com/console

---

## 🚀 Next Steps

### Step 1: Install Development Tools

#### Option A: iOS First (Mac only)
```bash
# Install Xcode from Mac App Store
# Then install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios/App
pod install
cd ../..
```

#### Option B: Android First (Any OS)
1. Download & install Android Studio
2. Open Android Studio
3. Install SDK Platform 33 (API 33)
4. Install Build Tools
5. Create Android Virtual Device (AVD) for testing

### Step 2: Build Your Web App
```bash
# Build the production web bundle
npm run build

# Sync to mobile platforms
npm run mobile:sync
```

### Step 3: Test on Mobile

#### iOS Testing
```bash
# Open in Xcode
npm run ios:open

# In Xcode:
# 1. Select your team (Apple ID)
# 2. Select a simulator or connected device
# 3. Click Play button (▶️)
```

#### Android Testing
```bash
# Open in Android Studio
npm run android:open

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Select an emulator or connected device
# 3. Click Run button (▶️)
```

---

## 📱 App Configuration

### Current Settings
- **App ID:** `com.golfbuddy.app`
- **App Name:** GolfBuddy
- **Bundle ID (iOS):** com.golfbuddy.app
- **Package Name (Android):** com.golfbuddy.app

### Splash Screen
- Background Color: `#1976d2` (blue)
- Duration: 2 seconds
- Shows spinner while loading

### Permissions Required

#### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>GolfBuddy needs your location to show nearby courses and weather</string>

<key>NSCameraUsageDescription</key>
<string>GolfBuddy needs camera access to upload photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>GolfBuddy needs photo library access to upload images</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 🎨 App Icons & Splash Screens

### Required Assets

#### iOS
- **App Icon:** 1024×1024px PNG (no transparency)
- **Location:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Android
- **App Icon:** 512×512px PNG
- **Adaptive Icon:** Foreground + Background layers
- **Location:** `android/app/src/main/res/`

### Quick Icon Generation
Use online tools:
- https://www.appicon.co/
- https://makeappicon.com/
- https://icon.kitchen/

Upload your 1024×1024 logo and download all sizes.

---

## 🔧 Troubleshooting

### iOS Issues

**"xcode-select error"**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app
```

**"Pod install failed"**
```bash
cd ios/App
pod repo update
pod install
cd ../..
```

**"Code signing required"**
1. Open Xcode
2. Select project in sidebar
3. Go to "Signing & Capabilities"
4. Select your team (Apple ID)

### Android Issues

**"SDK not found"**
1. Open Android Studio
2. Settings → Appearance & Behavior → System Settings → Android SDK
3. Install SDK Platform 33
4. Install Build Tools

**"Gradle sync failed"**
```bash
cd android
./gradlew clean
cd ..
npm run mobile:sync
```

**"Device not detected"**
- Enable USB Debugging on Android device
- Settings → About Phone → Tap "Build Number" 7 times
- Settings → Developer Options → Enable USB Debugging

---

## 📦 Building for Production

### iOS (App Store)

#### 1. Configure App in Xcode
```bash
npm run ios:open
```
- Set Team & Bundle ID
- Configure signing certificates
- Set version & build number

#### 2. Archive the App
- Product → Archive
- Wait for archive to complete
- Click "Distribute App"

#### 3. Upload to App Store Connect
- Choose "App Store Connect"
- Select signing options
- Upload to TestFlight first for testing

#### 4. Submit for Review
- Go to https://appstoreconnect.apple.com
- Fill in app information
- Upload screenshots
- Submit for review (7-10 days)

### Android (Google Play)

#### 1. Generate Signing Key
```bash
cd android
keytool -genkey -v -keystore golfbuddy-release.keystore \
  -alias golfbuddy -keyalg RSA -keysize 2048 -validity 10000

# Save keystore file and passwords securely!
```

#### 2. Configure Signing
Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('golfbuddy-release.keystore')
            storePassword 'your_store_password'
            keyAlias 'golfbuddy'
            keyPassword 'your_key_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Build Release APK/AAB
```bash
cd android
./gradlew bundleRelease

# AAB file will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### 4. Upload to Google Play Console
- Go to https://play.google.com/console
- Create new app
- Upload AAB file
- Fill in store listing
- Submit for review (1-3 days)

---

## 🔄 Updating Your App

### After Making Code Changes
```bash
# 1. Build web app
npm run build

# 2. Sync to mobile
npm run mobile:sync

# 3. Rebuild mobile app
npm run ios:run    # For iOS
npm run android:run # For Android
```

### Version Management
Update version in 3 places:
1. `package.json` → `"version": "0.2.0"`
2. iOS: `ios/App/App.xcodeproj/project.pbxproj`
3. Android: `android/app/build.gradle` → `versionName` & `versionCode`

---

## 📊 App Store Requirements

### iOS App Store
- Screenshots: 6.5" iPhone, 12.9" iPad
- Privacy Policy URL (required)
- Support URL (required)
- Age rating
- Category: Sports
- Keywords (max 100 characters)

### Google Play Store
- Screenshots: Phone (minimum 2)
- Feature Graphic: 1024×500px
- Privacy Policy URL (required)
- Content Rating questionnaire
- Category: Sports
- Keywords in description

---

## 🎯 Quick Reference

### Common Commands
```bash
# Development
npm start                 # Web development server
npm run build            # Build web app
npm run mobile:build     # Build & sync to mobile

# iOS
npm run ios:open         # Open Xcode
npm run ios:run          # Build + open

# Android
npm run android:open     # Open Android Studio
npm run android:run      # Build + open

# Deployment
npm run deploy           # Deploy web to Firebase
```

### File Locations
- **Capacitor Config:** `capacitor.config.ts`
- **iOS Project:** `ios/App/`
- **Android Project:** `android/`
- **Web Build:** `build/`
- **App Icons:** `resources/`

---

## 📞 Support Resources

### Documentation
- Capacitor Docs: https://capacitorjs.com/docs
- iOS Development: https://developer.apple.com/documentation/
- Android Development: https://developer.android.com/docs

### Communities
- Capacitor Discord: https://discord.gg/capacitor
- Ionic Forum: https://forum.ionicframework.com
- Stack Overflow: [capacitor] tag

---

## ✅ Checklist Before Store Submission

### Both Platforms
- [ ] App tested on real devices
- [ ] All features working
- [ ] No crashes or bugs
- [ ] Privacy policy created and hosted
- [ ] Screenshots prepared
- [ ] App icon finalized
- [ ] App description written
- [ ] Keywords/metadata optimized

### iOS Specific
- [ ] Apple Developer Account ($99/year)
- [ ] Signing certificates configured
- [ ] TestFlight testing completed
- [ ] App Store Connect info filled
- [ ] 6.5" iPhone screenshots
- [ ] iPad screenshots (if supporting)

### Android Specific
- [ ] Google Play Developer Account ($25)
- [ ] Release signing key generated
- [ ] AAB file built and signed
- [ ] Play Console listing completed
- [ ] Phone screenshots (2 minimum)
- [ ] Feature graphic created
- [ ] Content rating completed

---

**Status:** ✅ Ready for iOS/Android development!  
**Next:** Install Xcode or Android Studio and start testing
