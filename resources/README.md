# 🎨 App Icons & Splash Screens

Place your app assets in this folder for easy reference.

---

## 📱 Required Assets

### App Icon
- **Size:** 1024×1024px
- **Format:** PNG
- **No transparency** (iOS requirement)
- **Square corners** (system adds rounded corners)

### Design Tips
- Simple, recognizable logo
- Avoid text (looks bad at small sizes)
- High contrast colors
- Test at 60×60px to see how it looks on home screen

---

## 🛠️ Icon Generation Tools

Upload your 1024×1024 icon to these services to generate all required sizes:

1. **AppIcon.co** - https://www.appicon.co/
   - Free, easy to use
   - Generates all iOS & Android sizes
   - Download ZIP with organized folders

2. **MakeAppIcon** - https://makeappicon.com/
   - Free
   - Generates all platforms
   - Includes splash screens

3. **Icon Kitchen** - https://icon.kitchen/
   - Free
   - Android-focused
   - Creates adaptive icons

---

## 📂 Where to Place Icons

### iOS
After generating, copy files to:
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

Replace existing placeholder files.

### Android
After generating, copy folders to:
```
android/app/src/main/res/
```

Replace:
- `mipmap-hdpi/`
- `mipmap-mdpi/`
- `mipmap-xhdpi/`
- `mipmap-xxhdpi/`
- `mipmap-xxxhdpi/`

---

## 🎨 Splash Screen (Optional)

### Current Configuration
- Background: Blue (`#1976d2`)
- Shows GolfBuddy name
- Shows spinner while loading
- Duration: 2 seconds

### Custom Splash Screen
To customize:
1. Design splash screen (2436×1125px for iOS)
2. Use: https://www.pgyer.com/tools/appIcon
3. Copy generated files to:
   - iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`
   - Android: `android/app/src/main/res/drawable/`

---

## 🚀 Quick Setup

### Option 1: Use Placeholder
The generated app already has a default Capacitor icon. You can submit with this for testing.

### Option 2: Use Your Logo
1. Create/find your 1024×1024 logo
2. Save it here as `icon-1024.png`
3. Upload to https://www.appicon.co/
4. Download generated files
5. Copy to iOS & Android folders
6. Rebuild: `npm run mobile:build`

---

## 📐 Size Requirements

### iOS (App Store)
- 1024×1024px (App Store listing)
- App generates all other sizes automatically

### Android (Google Play)
- 512×512px (Play Store listing)
- Adaptive icon: 432×432px foreground on transparent background
- App uses various densities (xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi)

---

## ✅ Checklist

- [ ] Create 1024×1024 app icon
- [ ] Generate all sizes using online tool
- [ ] Copy to iOS project
- [ ] Copy to Android project
- [ ] Test on device to verify
- [ ] Prepare 512×512 for Play Store
- [ ] Save original PSD/AI file for future updates

---

## 🎯 Current Status

**Icon:** Default Capacitor placeholder  
**Splash:** Blue background with spinner  
**Status:** ✅ Functional (ready for testing)  
**TODO:** Add custom icon before store submission

---

**Tip:** Use free tools like Canva or Figma to design your icon if you don't have design software.
