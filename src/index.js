import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

console.log('🚀 GolfBuddy Starting...');
console.log('Platform:', Capacitor.getPlatform());
console.log('Native:', Capacitor.isNativePlatform());

// Add a visible indicator for debugging
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM Content Loaded');
});

// Create root and render app
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  // Create a visible error message
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-size: 20px;">ERROR: Root element not found!</div>';
} else {
  try {
    console.log('✅ Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ React root created');
    
    // Add a temporary loading indicator
    rootElement.innerHTML = '<div style="color: blue; padding: 20px; font-size: 20px;">Loading GolfBuddy...</div>';
    
    console.log('About to render App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React app rendered (render called, may still be mounting)');
    
    // Hide splash screen after React renders
    setTimeout(() => {
      console.log('Hiding splash screen...');
      console.log('Current body content:', document.body.innerHTML.substring(0, 200));
      SplashScreen.hide().catch(err => {
        console.log('SplashScreen hide error (can be ignored):', err);
      });
    }, 1000);
  } catch (error) {
    console.error('❌ CRITICAL: Error rendering React app:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Show visible error
    rootElement.innerHTML = `<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:red;color:white;padding:20px;font-size:16px;overflow:auto;">
      <h2>❌ React Initialization Error:</h2>
      <p><strong>${error.name}:</strong> ${error.message}</p>
      <pre style="background:rgba(0,0,0,0.3);padding:10px;overflow:auto;">${error.stack}</pre>
      <p style="margin-top:20px;"><small>Check Xcode console for more details</small></p>
    </div>`;
  }
}

// Catch unhandled errors - log to console only (no red box)
window.addEventListener('error', (event) => {
  console.error('❌ JavaScript Error:', event.error || event.message);
  if (event.error?.stack) console.error('Stack:', event.error.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
  if (event.reason?.stack) console.error('Stack:', event.reason.stack);
});

// Only register service worker in web browser, not in native app
const isNative = Capacitor.isNativePlatform();
console.log('Is native platform:', isNative);

if (!isNative && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New app version available!');
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else {
  console.log('Skipping service worker registration (native platform)');
}
