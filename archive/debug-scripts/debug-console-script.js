// Quick Debug Script - Paste in Browser Console

console.log('🔍 EMERGENCY DASHBOARD DEBUG');
console.log('================================');

// 1. Check current location
console.log('1. LOCATION CHECK:');
console.log('   URL:', window.location.href);
console.log('   Pathname:', window.location.pathname);
console.log('   Expected: /dashboard or /');

// 2. Check authentication status  
console.log('\n2. AUTH CHECK:');
const userStorage = localStorage.getItem('user') || sessionStorage.getItem('user');
console.log('   User in storage:', userStorage ? 'YES ✅' : 'NO ❌');

// 3. Check what's on the page
console.log('\n3. PAGE CONTENT CHECK:');
const bodyText = document.body.textContent;
console.log('   Contains "Dashboard":', bodyText.includes('Dashboard') ? 'YES ✅' : 'NO ❌');
console.log('   Contains "Sign":', bodyText.includes('Sign') ? 'YES ✅' : 'NO ❌');
console.log('   Contains "Hey":', bodyText.includes('Hey') ? 'YES ✅' : 'NO ❌');

// 4. Check React rendering
console.log('\n4. REACT CHECK:');
const root = document.getElementById('root');
console.log('   Root element:', root ? 'EXISTS ✅' : 'MISSING ❌');
console.log('   Root children:', root ? root.children.length : 0);

// 5. Check for navigation
console.log('\n5. NAVIGATION CHECK:');
console.log('   Nav element:', document.querySelector('nav') ? 'FOUND ✅' : 'NOT FOUND ❌');
console.log('   Dashboard link:', document.querySelector('[href*="dashboard"]') ? 'FOUND ✅' : 'NOT FOUND ❌');

// 6. Check for errors
console.log('\n6. ERROR CHECK:');
console.log('   Check above for any RED error messages! 👆');

console.log('\n================================');
console.log('📋 REPORT THESE RESULTS!');
