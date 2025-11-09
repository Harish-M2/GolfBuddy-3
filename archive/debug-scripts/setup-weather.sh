#!/bin/bash

echo "🌤️  GolfBuddy Weather Widget Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    
    # Check if weather API key exists
    if grep -q "REACT_APP_OPENWEATHER_API_KEY" .env.local; then
        KEY=$(grep "REACT_APP_OPENWEATHER_API_KEY" .env.local | cut -d '=' -f2)
        if [ "$KEY" != "your_openweathermap_api_key_here" ] && [ ! -z "$KEY" ]; then
            echo "✅ OpenWeatherMap API key is configured"
            echo ""
            echo "Your weather widget is ready to use!"
            echo ""
            echo "To test it:"
            echo "1. Make sure you have a location set in your profile (Settings page)"
            echo "2. Go to the Dashboard"
            echo "3. See real weather for your location!"
            echo ""
            exit 0
        fi
    fi
fi

echo "⚠️  Weather API key not configured"
echo ""
echo "To enable the weather widget:"
echo ""
echo "1. Get a FREE API key from OpenWeatherMap:"
echo "   👉 https://openweathermap.org/api"
echo "   - Sign up (free, no credit card needed)"
echo "   - Verify your email"
echo "   - Copy your API key"
echo ""
echo "2. Create .env.local file (if it doesn't exist):"
echo "   touch .env.local"
echo ""
echo "3. Add your API key to .env.local:"
echo "   REACT_APP_OPENWEATHER_API_KEY=your_actual_key_here"
echo ""
echo "4. Restart the development server:"
echo "   npm start"
echo ""
echo "📖 For detailed instructions, see: WEATHER_WIDGET_SETUP.md"
echo ""

read -p "Would you like to create .env.local now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    if [ ! -f ".env.local" ]; then
        echo "# Add your OpenWeatherMap API key below" > .env.local
        echo "REACT_APP_OPENWEATHER_API_KEY=your_api_key_here" >> .env.local
        echo "✅ Created .env.local file"
        echo ""
        echo "Now edit .env.local and add your API key"
        echo "Then restart the development server"
    else
        if ! grep -q "REACT_APP_OPENWEATHER_API_KEY" .env.local; then
            echo "" >> .env.local
            echo "# OpenWeatherMap API" >> .env.local
            echo "REACT_APP_OPENWEATHER_API_KEY=your_api_key_here" >> .env.local
            echo "✅ Added weather API key entry to .env.local"
            echo ""
            echo "Now edit .env.local and add your actual API key"
            echo "Then restart the development server"
        else
            echo "⚠️  REACT_APP_OPENWEATHER_API_KEY already exists in .env.local"
            echo "Please edit it manually to add your API key"
        fi
    fi
fi
