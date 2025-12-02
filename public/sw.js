const CACHE_NAME = 'beat-v2';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'beat-api-v1';

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png',
];

// API endpoints to cache for offline access
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/bp_logs/,
  /\/rest\/v1\/sugar_logs/,
  /\/rest\/v1\/behavior_logs/,
  /\/rest\/v1\/heart_scores/,
  /\/rest\/v1\/profiles/,
  /\/rest\/v1\/streaks/,
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Check if URL matches API cache patterns
function shouldCacheApiResponse(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);

  // Handle API requests with network-first, cache-fallback strategy
  if (shouldCacheApiResponse(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached API response when offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache static assets
          if (
            event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/) ||
            url.pathname.startsWith('/assets/')
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// Background sync for pending logs
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-health-logs') {
    event.waitUntil(syncPendingLogs());
  }
});

async function syncPendingLogs() {
  // Get pending logs from IndexedDB and sync them
  // This is a placeholder for future implementation
  console.log('Syncing pending health logs...');
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Time for your health check-in!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/app/home',
    },
    actions: [
      { action: 'log-bp', title: 'Log BP' },
      { action: 'dismiss', title: 'Later' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Beat', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'log-bp') {
    event.waitUntil(clients.openWindow('/app/checkin/morning'));
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/app/home')
    );
  }
});
