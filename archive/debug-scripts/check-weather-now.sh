#!/bin/bash

# Weather Widget Debug Helper
# Run this and then check your browser

echo "════════════════════════════════════════════════════════════"
echo "🌤️  WEATHER WIDGET DEBUG CHECKLIST"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if server is running
if pgrep -f "react-scripts" > /dev/null; then
    echo "✅ Development server is running"
else
    echo "❌ Development server NOT running!"
    echo "   Run: npm start"
    exit 1
fi

# Check .env.local
if [ -f .env.local ]; then
    if grep -q "REACT_APP_OPENWEATHER_API_KEY" .env.local; then
        echo "✅ API key is configured in .env.local"
    else
        echo "⚠️  API key NOT found in .env.local"
    fi
else
    echo "❌ .env.local file NOT found!"
fi

# Check files exist
if [ -f src/services/weatherService.js ]; then
    echo "✅ weatherService.js exists"
else
    echo "❌ weatherService.js MISSING!"
fi

if [ -f src/Pages/Dashboard.js ]; then
    echo "✅ Dashboard.js exists"
else
    echo "❌ Dashboard.js MISSING!"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📋 WHAT TO DO NEXT:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Open your browser to: http://localhost:3000/dashboard"
echo ""
echo "2. Open Browser Console:"
echo "   • Mac: Cmd+Option+J (Chrome) or Cmd+Option+C (Safari)"
echo "   • Windows: Ctrl+Shift+J or F12"
echo ""
echo "3. Look for these console messages:"
echo "   🎯 Dashboard Render: ..."
echo "   🎯 Dashboard: Rendering main dashboard view NOW!"
echo "   🌤️ Dashboard: Starting weather load..."
echo "   🌤️ Weather Service: Fetching weather..."
echo ""
echo "4. Look for the YELLOW DEBUG BOX at the top of the page"
echo "   It should say '🔧 Weather Widget Debug Info'"
echo ""
echo "5. Check for RED ERRORS in console"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🔍 PASTE THIS IN YOUR BROWSER CONSOLE:"
echo "════════════════════════════════════════════════════════════"
echo ""
cat << 'EOF'
// Dashboard Debug Check
console.log('═══ WEATHER WIDGET DEBUG ═══');
console.log('URL:', window.location.href);
console.log('Expected: http://localhost:3000/dashboard');
console.log('');
console.log('Page heading:', document.querySelector('h1')?.textContent || 'NOT FOUND');
console.log('Yellow debug box:', document.querySelector('[style*="fff3cd"]') ? '✅ FOUND' : '❌ NOT FOUND');
console.log('Weather widget:', document.querySelectorAll('[style*="gradient"]').length + ' gradient elements');
console.log('');
console.log('React root children:', document.getElementById('root')?.children.length || 0);
console.log('Container found:', !!document.querySelector('[class*="MuiContainer"]'));
console.log('');
console.log('👆 Check above for 🎯 and 🌤️ messages!');
EOF
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ Server is ready!"
echo "📱 Open browser and check console output"
echo "📋 Share any 🎯 or 🌤️ messages you see"
echo "🐛 Share any RED error messages"
echo ""
