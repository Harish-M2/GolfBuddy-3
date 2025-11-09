# ⛳ Weather Widget - Quick Start

## 🎯 What You Get

A **real-time weather widget** on your Dashboard that:
- Shows current temperature and conditions
- Tells you if it's good golf weather
- Based on YOUR location from Settings
- Updates automatically (cached for 30 min)

## 🚀 Quick Setup (2 Minutes)

### Step 1: Get Free API Key
Go to: https://openweathermap.org/api
- Click "Sign Up" (FREE, no credit card)
- Verify your email
- Go to API keys section
- Copy your key

### Step 2: Run Setup Script
```bash
./setup-weather.sh
```

Or manually create `.env.local`:
```env
REACT_APP_OPENWEATHER_API_KEY=paste_your_key_here
```

### Step 3: Restart Server
```bash
npm start
```

### Step 4: Set Your Location
1. Go to Settings page
2. Enter your city (e.g., "Los Angeles")
3. Save
4. Go to Dashboard
5. See your local weather! 🌤️

## 🧪 Test It

Try different locations in Settings:
- "San Francisco" - Cool & foggy
- "Miami" - Hot & humid
- "Seattle" - Rainy
- "Phoenix" - Very hot

## 🆘 Troubleshooting

**Not showing real weather?**
1. Check `.env.local` has your API key
2. Restart dev server (`npm start`)
3. Set location in Settings
4. Wait 10 mins (new keys need activation)

**Still not working?**
- Check browser console for errors
- Verify API key at https://home.openweathermap.org/api_keys
- Read full guide: `WEATHER_WIDGET_SETUP.md`

## 📊 What It Shows

- **Temperature** (feels-like too)
- **Conditions** (sunny, rainy, cloudy)
- **Wind speed**
- **Golf-friendly message**
- **City name**

## 💰 Free Forever?

Yes! Free tier includes:
- 1,000 calls/day
- With caching: supports 500+ users
- No credit card needed
- Never expires

## 📖 Full Documentation

See `WEATHER_WIDGET_SETUP.md` for:
- Detailed setup
- API monitoring
- Troubleshooting
- Future enhancements

---

**Ready in:** 2 minutes  
**Cost:** FREE  
**Setup:** Easy  

Enjoy! ⛳🌤️
