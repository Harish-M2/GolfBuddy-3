# 🚀 GolfBuddy Mobile - Quick Start Guide

**For developers who want to start testing ASAP**

---

## ⚡ 5-Minute Setup

### 1. Build Your App
```bash
cd /Users/harish/Documents/Projects/GolfBuddy
npm run build
npm run mobile:sync
```

### 2. Choose Your Platform

#### 🍎 iOS (Mac Only)
```bash
# Install CocoaPods (if not installed)
sudo gem install cocoapods

# Install iOS dependencies
cd ios/App
pod install
cd ../..

# Open in Xcode
npm run ios:open
```

**In Xcode:**
1. Wait for indexing to complete
2. Select "App" scheme at top
3. Select your device/simulator
4. Click ▶️ Play button
5. App will launch! 🎉

#### 🤖 Android (Any OS)
```bash
# Open in Android Studio
npm run android:open
```

**In Android Studio:**
1. Wait for Gradle sync (bottom status bar)
2. Click "Run" → Select device/emulator
3. Wait for build to complete
4. App will launch! 🎉

---

## 📱 Testing on Real Device

### iOS (Physical iPhone/iPad)
1. Connect device via USB
2. Trust computer on device
3. In Xcode: Select your device from dropdown
4. Click ▶️ Play
5. On device: Settings → General → VPN & Device Management → Trust app

### Android (Physical Phone/Tablet)
1. Enable Developer Options:
   - Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Accept debugging prompt on device
5. In Android Studio: Select device → Run

---

## 🔄 Making Changes

After editing your React code:

```bash
# Rebuild and sync
npm run mobile:build

# Rerun in Xcode or Android Studio
```

Or use the quick scripts:
```bash
npm run ios:run      # Build + open iOS
npm run android:run  # Build + open Android
```

---

## 🐛 Common Issues

### iOS: "No signing certificate"
**Solution:**
1. Xcode → Preferences → Accounts
2. Add your Apple ID
3. Select project → Signing & Capabilities
4. Select your team

### Android: "SDK not found"
**Solution:**
1. Android Studio → Preferences → System Settings → Android SDK
2. Install SDK Platform 33
3. Install Build Tools
4. Sync project

### Both: "White screen on launch"
**Solution:**
```bash
npm run mobile:clean
npm run build
npm run mobile:sync
```

---

## 📦 New Scripts Added

```bash
# Development
npm run mobile:build     # Build web + sync to mobile
npm run mobile:sync      # Sync web assets only
npm run mobile:clean     # Clean mobile builds

# iOS
npm run ios:open         # Open Xcode
npm run ios:run          # Build + open Xcode

# Android
npm run android:open     # Open Android Studio
npm run android:run      # Build + open Android Studio
```

---

## ✅ What's Configured

- ✅ Capacitor installed
- ✅ iOS project ready
- ✅ Android project ready
- ✅ Permissions configured (GPS, Camera, Photos)
- ✅ Splash screen setup
- ✅ Build scripts ready

---

## 📚 Full Documentation

See `docs/mobile/MOBILE_APP_SETUP.md` for complete guide including:
- Store submission process
- Icon generation
- Code signing
- Publishing to App Store & Google Play

---

## 🎯 Current Status

**App ID:** com.golfbuddy.app  
**App Name:** GolfBuddy  
**Platforms:** iOS + Android  
**Ready for:** Testing & Development  

---

**Next:** Install Xcode or Android Studio and run `npm run ios:open` or `npm run android:open`
