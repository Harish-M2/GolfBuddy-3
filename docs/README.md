# 🏌️‍♂️ GolfBuddy App

**Your Ultimate Golf Social Network**

[![Live App](https://img.shields.io/badge/Live%20App-Visit-success)](https://golfbuddy-app-c879a.web.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-orange)](https://firebase.google.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-v5-blueviolet)](https://mui.com/)

---

## 🎯 Quick Links

### **For QA Engineers & Testers:**
- 📘 **[QA Testing Guide](QA_TESTING_GUIDE.md)** - Comprehensive testing document (140+ test cases)
- ⚡ **[Quick Start Testing](QA_TESTING_QUICK_START.md)** - 5-minute smoke test
- 📚 **[Documentation Index](DOCUMENTATION_INDEX.md)** - All documentation overview

### **For Developers:**
- 🚀 **[Features Documentation](docs/FEATURES.md)** - Complete feature list & updates
- 📁 **[Archive](docs/archive/)** - Historical development documentation

---

## 🌟 Features

✅ **Authentication System** - Secure email/password sign-in  
✅ **Golf Course Finder** - Browse and search courses  
✅ **Buddy Finder** - Connect with other golfers  
✅ **Real-time Chat** - Message your golf buddies  
✅ **Tee Time Scheduler** - Book and manage tee times  
✅ **Score Tracking** - Record and analyze your golf rounds  
✅ **Mobile Responsive** - Works perfectly on all devices  

---

## 🚀 Live Application

**Production URL:** https://golfbuddy-app-c879a.web.app ✅ **LIVE & WORKING**

### Test Accounts (For QA Testing):
```
Email: qa.tester1@testmail.com
Password: TestPass123!
```

---

## 💻 Development Setup

### Prerequisites
- Node.js 18+ (v20 recommended)
- npm or yarn
- Firebase CLI

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd GolfBuddy

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm start              # Run development server (port 3000)
npm test              # Run test suite
npm run build         # Build production bundle

# Deployment
npm run deploy        # Build and deploy to Firebase
firebase deploy       # Deploy to Firebase (after build)
```

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Material-UI v5** - Component library
- **React Router v6** - Navigation
- **Tailwind CSS** - Utility styling
- **Context API** - State management

### Backend
- **Firebase Authentication** - User auth
- **Cloud Firestore** - Database
- **Firebase Hosting** - Deployment
- **Firebase Storage** - File storage

---

## 📁 Project Structure

```
GolfBuddy/
├── src/
│   ├── Pages/              # Main application pages
│   │   ├── Home.js         # Landing page
│   │   ├── Golf.js         # Course finder
│   │   ├── Buddies.js      # Buddy management
│   │   ├── Chat.js         # Messaging
│   │   ├── TeeTimes.js     # Tee time booking
│   │   ├── Scores.js       # Score tracking
│   │   └── Settings.js     # User settings
│   │
│   ├── Components/         # Reusable components
│   │   ├── AppBar.js       # Navigation bar
│   │   ├── AuthModal.js    # Sign in/up modal
│   │   ├── ProtectedRoute.js  # Auth guard
│   │   └── LoadingSpinner.js  # Loading states
│   │
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.js  # Authentication state
│   │   └── NotificationContext.js
│   │
│   ├── firebase/           # Firebase configuration
│   │   ├── config.js       # Firebase init
│   │   └── database.js     # Firestore functions
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useBuddyRequests.js
│   │
│   └── theme.js            # Material-UI theme
│
├── public/                 # Static assets
├── build/                  # Production build (generated)
└── firebase.json           # Firebase config
```

---

## 🧪 Testing

### QA Testing Documentation

We provide comprehensive testing documentation for QA engineers:

1. **[QA Testing Guide](QA_TESTING_GUIDE.md)** (12,000+ words)
   - 12 complete test suites
   - 140+ individual test cases
   - Security & performance testing
   - Cross-browser testing scenarios
   - Bug reporting templates

2. **[Quick Start Testing](QA_TESTING_QUICK_START.md)** (5-minute test)
   - Rapid smoke test
   - Critical flow validation
   - Recent fixes verification

3. **[Documentation Index](DOCUMENTATION_INDEX.md)**
   - All documentation overview
   - Testing metrics & coverage
   - Known issues & limitations

### Running Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# For QA testing, follow the guides above
```

---

## 🔐 Security

### Implemented Security Features:
- ✅ Firebase Authentication
- ✅ Protected routes (authentication required)
- ✅ Firestore security rules
- ✅ Input sanitization
- ✅ XSS prevention (React default escaping)
- ✅ Token-based authentication

### Security Testing:
See **[QA Testing Guide - Test Suite 10](QA_TESTING_GUIDE.md#test-suite-10-security-testing)** for security test cases.

---

## 📱 Mobile Support

The app is fully responsive and optimized for:
- ✅ iOS (Safari)
- ✅ Android (Chrome)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet devices

**Mobile Testing Guide:** See [QA Testing Guide - Test Suite 8](QA_TESTING_GUIDE.md#test-suite-8-mobile-responsive-design)

---

## 🚢 Deployment

### Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or use combined command
npm run deploy
```

### Build Statistics:
- **Bundle Size:** 351.26 kB (gzipped)
- **CSS Size:** 1.38 kB
- **Total Files:** 16
- **Build Time:** ~45 seconds
- **Last Deployed:** November 6, 2025 ✅

---

## 🐛 Known Issues

### Current Known Issues:
1. Video background may impact mobile performance (Low priority)
2. Badge updates every 30 seconds, not real-time (By design)
3. Message sync every 5 seconds (By design)

### Recently Fixed:
- ✅ Chat page constant refresh (Fixed Nov 6, 2025)
- ✅ Buddies not showing in chat (Fixed Nov 6, 2025)
- ✅ Firebase deployment showing welcome page (Fixed Nov 6, 2025)

**Full List:** See [QA Testing Guide - Known Issues](QA_TESTING_GUIDE.md#known-issues--limitations)

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 6, 2025 | Initial production release |
| - | Nov 6, 2025 | Fixed chat refresh bug |
| - | Nov 6, 2025 | Added buddy list in chat fix |
| - | Nov 6, 2025 | Implemented auth protection |

---

## 📞 Support & Documentation

### For QA Engineers:
- Start with [QA Testing Guide](QA_TESTING_GUIDE.md)
- Use [Quick Start](QA_TESTING_QUICK_START.md) for rapid testing
- Reference [Documentation Index](DOCUMENTATION_INDEX.md) for all docs

### For Developers:
- Review [Features Documentation](docs/FEATURES.md) for technical details
- Check Firebase console for backend issues
- See browser console for client-side errors

### For Issues & Bugs:
- Use bug report template in [QA Testing Guide](QA_TESTING_GUIDE.md#bug-reporting-template)
- Include browser, OS, and steps to reproduce
- Check "Known Issues" section first

---

## 📄 License

This project is part of a portfolio/educational project.

---

## 👥 Contributing

For testing contributions:
1. Review [QA Testing Guide](QA_TESTING_GUIDE.md)
2. Use provided test account credentials
3. Follow bug reporting template
4. Submit detailed test reports

---

## 🙏 Acknowledgments

- Built with React and Firebase
- UI components from Material-UI
- Styled with Tailwind CSS
- Icons from Material Icons

---

## 📚 Additional Documentation

- **[QA Testing Guide](QA_TESTING_GUIDE.md)** - Complete testing documentation
- **[Quick Start Testing](QA_TESTING_QUICK_START.md)** - 5-minute validation
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - Documentation overview
- **[Features Documentation](docs/FEATURES.md)** - Feature list & updates
- **[Archive](docs/archive/)** - Historical documentation

---

**Built with ❤️ for golfers by golfers**

🏌️‍♂️ **Happy Golfing!** ⛳
