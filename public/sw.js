// GolfBuddy Service Worker for PWA functionality
const CACHE_NAME = 'golfbuddy-v1.0.1';
const API_CACHE_NAME = 'golfbuddy-api-v1.0.1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Core pages for offline access
  '/dashboard',
  '/golf',
  '/courses',
  '/scores',
  '/buddies'
];

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  '/api/user/profile',
  '/api/golf/courses',
  '/api/user/stats'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // BYPASS CACHE for hot-update files during development
  if (url.pathname.includes('.hot-update.')) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    // Static assets: Cache First strategy
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    // API requests: Network First strategy with offline fallback
    event.respondWith(networkFirst(request));
  } else if (isNavigationRequest(request)) {
    // Navigation requests: Network First with offline shell
    event.respondWith(navigationHandler(request));
  } else {
    // Other requests: Network only
    event.respondWith(fetch(request));
  }
});

// Cache First strategy for static assets
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Fetching and caching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

// Network First strategy for API requests
async function networkFirst(request) {
  try {
    console.log('[SW] Network first for API:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached API response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Navigation handler for app shell
async function navigationHandler(request) {
  try {
    console.log('[SW] Navigation request:', request.url);
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving app shell');
    const cache = await caches.open(CACHE_NAME);
    const appShell = await cache.match('/');
    
    if (appShell) {
      return appShell;
    }
    
    // Fallback offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>GolfBuddy - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
            }
            .offline-message { 
              text-align: center; 
              padding: 2rem;
              background: white;
              border-radius: 1rem;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .golf-icon { font-size: 3rem; margin-bottom: 1rem; }
            h1 { color: #059669; margin-bottom: 0.5rem; }
            p { color: #64748b; margin-bottom: 1.5rem; }
            button { 
              background: #059669; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #047857; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="golf-icon">🏌️‍♂️</div>
            <h1>You're Offline</h1>
            <p>GolfBuddy needs an internet connection to work properly.</p>
            <button onclick="location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('.css') ||
         request.url.includes('.js') ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.svg') ||
         request.url.includes('.ico') ||
         request.url.includes('/manifest.json');
}

function isAPIRequest(request) {
  return request.url.includes('/api/') ||
         request.url.includes('firebase') ||
         request.url.includes('googleapis');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'buddy-request') {
    event.waitUntil(syncBuddyRequests());
  } else if (event.tag === 'score-upload') {
    event.waitUntil(syncScoreUploads());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New golf activity!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GolfBuddy', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Utility functions for background sync
async function syncBuddyRequests() {
  try {
    // Implement buddy request sync logic
    console.log('[SW] Syncing buddy requests...');
  } catch (error) {
    console.error('[SW] Failed to sync buddy requests:', error);
  }
}

async function syncScoreUploads() {
  try {
    // Implement score upload sync logic
    console.log('[SW] Syncing score uploads...');
  } catch (error) {
    console.error('[SW] Failed to sync score uploads:', error);
  }
}

console.log('[SW] Service worker loaded');
