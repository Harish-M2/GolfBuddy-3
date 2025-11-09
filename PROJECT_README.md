# GolfBuddy - Social Golf Companion App 🏌️⛳

**A modern React web application for golfers to connect, track scores, and share their golfing experiences.**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

App will open at: `http://localhost:3000`

---

## 📋 Project Overview

**GolfBuddy** is a full-featured social networking platform designed specifically for golfers. Connect with fellow golfers, find playing partners, track your rounds, share photos, and improve your game together.

### Key Features

- 🏌️ **Find Golf Buddies** - Connect with golfers by skill level and location
- 📊 **Dashboard** - Personalized dashboard with weather, stats, and quick actions
- 📸 **Photo Gallery** - Share and view golf course photos
- 🌙 **Dark Mode** - Full dark/light theme support
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Real-time Updates** - Firebase-powered live data sync
- 🔐 **Secure Authentication** - Google Sign-In integration
- 🌦️ **Weather Widget** - Real-time weather for your location

---

## 📁 Project Structure

```
GolfBuddy/
├── src/
│   ├── Components/         # Reusable UI components
│   ├── Pages/             # Main application pages
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── firebase/          # Firebase configuration & services
│   ├── services/          # External API services (Weather)
│   └── theme.js           # Theme configuration
├── public/                # Static assets
├── docs/                  # Project documentation
├── tests/                 # Playwright E2E tests
└── archive/              # Old documentation & debug scripts

```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first CSS

### Backend & Services
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Storage** - Image storage
- **Firebase Hosting** - Deployment
- **OpenWeatherMap API** - Weather data

### Testing & Tools
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **VS Code** - Recommended IDE

---

## 📖 Documentation

### Essential Docs (Root Level)
- **[PROJECT_README.md](./PROJECT_README.md)** - This file (project overview)
- **[AUTHENTICATION_PROTECTION_COMPLETE.md](./AUTHENTICATION_PROTECTION_COMPLETE.md)** - Auth implementation
- **[BUSINESS_PLAN.md](./BUSINESS_PLAN.md)** - Business strategy & monetization
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase configuration guide
- **[FIREBASE_DEPLOYMENT_COMPLETE.md](./FIREBASE_DEPLOYMENT_COMPLETE.md)** - Deployment guide
- **[MONETIZATION_STRATEGY.md](./MONETIZATION_STRATEGY.md)** - Revenue model
- **[NEXT_STEPS_ROADMAP.md](./NEXT_STEPS_ROADMAP.md)** - Future development plan
- **[TECHNICAL_IMPLEMENTATION_GUIDE.md](./TECHNICAL_IMPLEMENTATION_GUIDE.md)** - Technical details

### Detailed Docs (`/docs`)
- **Feature Documentation** - Individual feature guides
- **Testing Guides** - QA and testing procedures
- **Deployment** - Production deployment guides
- **API Integration** - Weather & external services

### QA & Testing
- **[QA_TESTING_GUIDE.md](./QA_TESTING_GUIDE.md)** - Complete testing guide
- **[QA_TESTING_QUICK_START.md](./QA_TESTING_QUICK_START.md)** - Quick testing reference
- **[AUTH_TEST_GUIDE.md](./AUTH_TEST_GUIDE.md)** - Authentication testing
- **[TEST_ACCOUNT_SETUP.md](./TEST_ACCOUNT_SETUP.md)** - Test account creation

### Mobile & Responsive
- **[MOBILE_RESPONSIVE_IMPROVEMENTS.md](./MOBILE_RESPONSIVE_IMPROVEMENTS.md)** - Mobile optimizations

### User Guides
- **[MANUAL_QA_CLEANUP_GUIDE.md](./MANUAL_QA_CLEANUP_GUIDE.md)** - QA user cleanup
- **[QA_CLEANUP_INSTRUCTIONS.md](./QA_CLEANUP_INSTRUCTIONS.md)** - Data cleanup guide

---

## 🎯 Core Features

### 1. Dashboard
- Real-time weather widget (Celsius temperatures)
- Quick stats overview
- Upcoming rounds
- Recent activity feed
- Quick action buttons

### 2. Find Buddies (Golf Page)
- Filter by skill level (Beginner, Intermediate, Advanced)
- Filter by location
- Pagination (9 users per page)
- Send buddy requests
- View golfer profiles with ratings
- Uniform card layout for consistency

### 3. Social Features
- Send/receive buddy requests
- Accept/decline requests
- View golfer profiles
- Message system (future)
- Activity feed

### 4. Photo Gallery
- Upload golf course photos
- View community photos
- Like and comment (future)
- Photo albums (future)

### 5. Score Tracking
- Track rounds
- Record scores per hole
- Calculate handicaps
- View score history
- Statistics dashboard

### 6. Dark Mode
- System-wide theme toggle
- Persisted preference
- Smooth transitions
- Optimized for readability

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# OpenWeatherMap API
REACT_APP_WEATHER_API_KEY=your_openweathermap_api_key
```

See `.env.example` for a template.

---

## 🚢 Deployment

### Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy

# Deploy hosting only
firebase deploy --only hosting
```

### Build Configuration

- **Build folder:** `build/`
- **Firebase config:** `firebase.json`
- **Hosting:** Single-page app (SPA) configuration
- **Redirects:** All routes → `index.html`

---

## 🧪 Testing

### Manual Testing
```bash
# Start development server
npm start

# Open browser and test features
```

### Automated Testing (Playwright)
```bash
# Run all tests
npm test

# Run specific test
npx playwright test tests/authentication.spec.js

# Run with UI
npx playwright test --ui

# View test report
npx playwright show-report
```

### Test Coverage
- Authentication flow
- Page navigation
- Dark mode toggle
- Buddy requests
- Photo upload
- Score tracking

---

## 📱 Browser Support

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

### Development Workflow

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd GolfBuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make changes & test**
   ```bash
   npm start
   ```

5. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

6. **Create pull request**

### Code Standards

- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test before committing

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Firebase connection errors  
**Solution:** Check `.env.local` configuration and Firebase console

**Issue:** Weather widget not loading  
**Solution:** Verify OpenWeatherMap API key and check browser console

**Issue:** Dark mode not persisting  
**Solution:** Check localStorage permissions in browser

**Issue:** Build errors  
**Solution:** Delete `node_modules` and `package-lock.json`, then `npm install`

### Debug Mode

Enable debug logs in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

---

## 📊 Project Status

### Current Version: v1.0.0

**Status:** ✅ Production Ready

### Completed Features
- ✅ Authentication (Google Sign-In)
- ✅ Dashboard with weather widget
- ✅ Find Buddies page with pagination
- ✅ Dark mode implementation
- ✅ Photo gallery
- ✅ Score tracking
- ✅ Mobile responsive design
- ✅ Firebase deployment

### In Progress
- 🔄 Messaging system
- 🔄 Advanced filtering
- 🔄 Push notifications

### Planned Features
- 📋 Course reviews
- 📋 Tournament system
- 📋 Leaderboards
- 📋 Social feed
- 📋 Video uploads

---

## 📞 Support

### Documentation
- **Main docs:** `/docs` folder
- **QA guides:** Root level QA files
- **API docs:** Firebase & OpenWeatherMap documentation

### Resources
- **Firebase Console:** [console.firebase.google.com](https://console.firebase.google.com)
- **Material-UI Docs:** [mui.com](https://mui.com)
- **React Docs:** [react.dev](https://react.dev)

---

## 📜 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Development Team

**Lead Developer:** Your Name  
**Started:** 2024  
**Tech Stack:** React + Firebase + Material-UI

---

## 🎯 Project Goals

1. **Connect golfers** - Make it easy to find playing partners
2. **Track progress** - Help golfers improve their game
3. **Build community** - Create a social platform for golf enthusiasts
4. **Mobile-first** - Accessible anywhere, anytime
5. **Monetization** - Sustainable business model

---

## 📈 Metrics & Analytics

- **Users:** Track in Firebase Console
- **Active Sessions:** Real-time monitoring
- **Feature Usage:** Event tracking
- **Performance:** Lighthouse scores
- **Errors:** Firebase Crashlytics

---

**Last Updated:** November 9, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

