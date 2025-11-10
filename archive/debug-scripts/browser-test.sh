#!/bin/bash

# Quick Browser Console Test
# Open http://localhost:3000/dashboard in your browser and run this in the Console:

cat << 'EOF'

===========================================
PASTE THIS IN YOUR BROWSER CONSOLE
===========================================

// Check if Dashboard is rendering
console.log('=== DASHBOARD DEBUG ===');
console.log('Current URL:', window.location.href);
console.log('Should be: http://localhost:3000/dashboard');

// Check for weather widget elements
const weatherWidget = document.querySelector('[style*="linear-gradient"][style*="3b82f6"]');
console.log('Weather widget found?', weatherWidget ? 'YES ✅' : 'NO ❌');

// Check for debug box
const debugBox = document.querySelector('[style*="fff3cd"]');
console.log('Debug box found?', debugBox ? 'YES ✅' : 'NO ❌');
if (debugBox) {
  console.log('Debug box content:', debugBox.textContent);
}

// Check React root
const root = document.getElementById('root');
console.log('React root exists?', root ? 'YES ✅' : 'NO ❌');
console.log('React root has content?', root?.children.length > 0 ? 'YES ✅' : 'NO ❌');

// Check for Container
const container = document.querySelector('[class*="MuiContainer"]');
console.log('MUI Container found?', container ? 'YES ✅' : 'NO ❌');

// Check page title
console.log('Page contains "Hey"?', document.body.textContent.includes('Hey') ? 'YES ✅' : 'NO ❌');

// Check for errors
console.log('Check console above for any red errors! 👆');

===========================================

EOF
