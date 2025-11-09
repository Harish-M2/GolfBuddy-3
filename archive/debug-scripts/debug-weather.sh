#!/bin/bash

echo ""
echo "🔍 Weather Widget Troubleshooting"
echo "=================================="
echo ""

# Check 1: .env.local exists
echo "1️⃣ Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    
    # Check API key
    if grep -q "REACT_APP_OPENWEATHER_API_KEY" .env.local; then
        KEY=$(grep "REACT_APP_OPENWEATHER_API_KEY" .env.local | cut -d '=' -f2 | xargs)
        
        if [ -z "$KEY" ]; then
            echo "   ❌ API key is EMPTY"
            echo "   → Add your API key to .env.local"
        elif [ "$KEY" = "your_api_key_here" ] || [ "$KEY" = "your_openweathermap_api_key_here" ]; then
            echo "   ❌ API key is still PLACEHOLDER"
            echo "   → Replace with your actual API key from OpenWeatherMap"
        elif [ ${#KEY} -lt 20 ]; then
            echo "   ⚠️  API key looks too SHORT (${#KEY} chars)"
            echo "   → OpenWeatherMap keys are usually 32 characters"
        else
            echo "   ✅ API key is set (${#KEY} characters)"
            echo "   → Key: ${KEY:0:8}...${KEY: -4}"
        fi
    else
        echo "   ❌ REACT_APP_OPENWEATHER_API_KEY not found in file"
        echo "   → Add: REACT_APP_OPENWEATHER_API_KEY=your_key"
    fi
else
    echo "   ❌ .env.local does NOT exist"
    echo "   → Run: ./setup-weather.sh"
fi

echo ""
echo "2️⃣ Checking if dev server is running..."
if lsof -i :3000 >/dev/null 2>&1; then
    echo "   ✅ Dev server is running on port 3000"
    echo "   ⚠️  IMPORTANT: Did you RESTART after adding API key?"
    echo "   → Stop server (Ctrl+C) and run: npm start"
else
    echo "   ❌ Dev server is NOT running"
    echo "   → Run: npm start"
fi

echo ""
echo "3️⃣ Testing API key with OpenWeatherMap..."
if [ -f ".env.local" ]; then
    KEY=$(grep "REACT_APP_OPENWEATHER_API_KEY" .env.local | cut -d '=' -f2 | xargs)
    
    if [ ! -z "$KEY" ] && [ "$KEY" != "your_api_key_here" ] && [ "$KEY" != "your_openweathermap_api_key_here" ]; then
        echo "   Testing with Los Angeles..."
        
        RESPONSE=$(curl -s "https://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles&appid=$KEY&units=imperial")
        
        if echo "$RESPONSE" | grep -q '"temp"'; then
            TEMP=$(echo "$RESPONSE" | grep -o '"temp":[0-9.]*' | cut -d ':' -f2)
            CITY=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d '"' -f4)
            echo "   ✅ API KEY WORKS! 🎉"
            echo "   → Weather: $CITY is ${TEMP}°F"
        elif echo "$RESPONSE" | grep -q '401'; then
            echo "   ❌ API KEY INVALID (401 Unauthorized)"
            echo "   → Check your key at: https://home.openweathermap.org/api_keys"
            echo "   → New keys take 10 minutes to activate"
        elif echo "$RESPONSE" | grep -q '429'; then
            echo "   ⚠️  RATE LIMIT EXCEEDED (429)"
            echo "   → Wait a few minutes and try again"
        else
            echo "   ⚠️  Unexpected response:"
            echo "$RESPONSE" | head -c 200
        fi
    else
        echo "   ⏭️  Skipped (no valid API key to test)"
    fi
else
    echo "   ⏭️  Skipped (.env.local not found)"
fi

echo ""
echo "4️⃣ Checking browser console..."
echo "   → Open your browser's Developer Tools (F12)"
echo "   → Go to Console tab"
echo "   → Look for messages starting with '🌤️'"
echo "   → These will show exactly what's happening"

echo ""
echo "5️⃣ Common Issues & Solutions:"
echo ""
echo "   Problem: Still shows default weather"
echo "   Solutions:"
echo "     1. Make sure location is set in Settings"
echo "     2. Check browser console for errors"
echo "     3. Clear browser cache (Cmd+Shift+R)"
echo "     4. Verify API key is correct"
echo ""
echo "   Problem: 'Invalid API key' error"
echo "   Solutions:"
echo "     1. Double-check you copied the entire key"
echo "     2. Wait 10 minutes (new keys need activation)"
echo "     3. Generate a new key at OpenWeatherMap"
echo "     4. Make sure no extra spaces in .env.local"
echo ""
echo "   Problem: 'City not found' error"
echo "   Solutions:"
echo "     1. Try full city name: 'San Francisco' not 'SF'"
echo "     2. Add state: 'Portland, OR' not just 'Portland'"
echo "     3. Add country: 'London, UK'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
if [ -f ".env.local" ] && grep -q "REACT_APP_OPENWEATHER_API_KEY" .env.local; then
    KEY=$(grep "REACT_APP_OPENWEATHER_API_KEY" .env.local | cut -d '=' -f2 | xargs)
    if [ ! -z "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
        echo "1. RESTART the dev server: npm start"
        echo "2. Go to Settings and set your location"
        echo "3. Go to Dashboard"
        echo "4. Check browser console (F12) for '🌤️' messages"
    else
        echo "1. Edit .env.local and add your actual API key"
        echo "2. Restart: npm start"
        echo "3. Set location in Settings"
        echo "4. Check Dashboard"
    fi
else
    echo "1. Run: ./setup-weather.sh"
    echo "2. Add your API key from https://openweathermap.org/api"
    echo "3. Restart: npm start"
fi

echo ""
