/**
 * Mind Gym Service Worker v4 - Optimized Performance
 * Advanced caching with Workbox patterns
 *
 * @version 1.6.1
 * @license MIT
 */

const CACHE_VERSION = 'v4';
const CACHE_NAME = `mind-gym-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const FONT_CACHE = `${CACHE_NAME}-fonts`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const OFFLINE_PAGE = './offline.html';

// Precache list - critical assets
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './src/keys.js',
  './src/utils.js',
  './src/storage.js',
  './src/stats.js',
  './src/achievements.js',
  './src/modes.js',
  './src/import-export.js',
  './src/i18n.js',
  './src/effects.js',
  './src/pools.js',
  './src/timer.js',
  './src/confetti.js',
  './src/ui-events.js',
  './src/ui.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/app.css',
  OFFLINE_PAGE,
];

// Install event - precache critical assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Precaching static assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('mind-gym-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip sw.js itself
  if (url.pathname.endsWith('/sw.js')) return;

  // Handle external requests (fonts)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleGoogleFonts(request));
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Route to appropriate strategy based on file type
  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithTimeout(request, STATIC_CACHE, 2000));
  } else if (/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithExpiration(request, IMAGE_CACHE, 100, 30 * 24 * 60 * 60));
  } else if (/\.(woff2|woff|ttf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithExpiration(request, FONT_CACHE, 20, 365 * 24 * 60 * 60));
  } else if (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(networkFirstWithFallback(request, STATIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Cache First with timeout strategy
async function cacheFirstWithTimeout(request, cacheName, timeout = 2000) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached immediately, update in background
    fetchWithTimeout(request, timeout)
      .then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {});
    return cached;
  }

  // No cache - fetch and store
  try {
    const networkResponse = await fetchWithTimeout(request, timeout);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Cache First with expiration and limit
async function cacheFirstWithExpiration(request, cacheName, maxEntries, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Check expiration
    const headers = cached.headers;
    const cachedTime = headers.get('sw-cached-time');
    if (cachedTime) {
      const age = (Date.now() - parseInt(cachedTime)) / 1000;
      if (age < maxAgeSeconds) {
        return cached;
      }
    } else {
      return cached;
    }
  }

  // Fetch and cache with timestamp
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-time', Date.now().toString());

      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers,
      });

      await cache.put(request, responseToCache);

      // Cleanup old entries if over limit
      await cleanupCache(cacheName, maxEntries);
    }
    return networkResponse;
  } catch (error) {
    return cached || new Response('Network error', { status: 408 });
  }
}

// Network First with fallback
async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed, serving from cache');
  }

  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  // Ultimate fallback - offline page
  try {
    const offline = await cache.match(OFFLINE_PAGE);
    if (offline) return offline;
  } catch (e) {}

  return new Response('Offline - Please check your connection', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Google Fonts special handling
async function handleGoogleFonts(request) {
  const cacheName = request.url.includes('fonts.googleapis.com')
    ? 'google-fonts-stylesheets'
    : 'google-fonts-webfonts';
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

// Utility: Fetch with timeout
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
  ]);
}

// Utility: Cleanup cache to max entries
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background sync
defineBGSync(self);

function defineBGSync(self) {
  self.addEventListener('sync', event => {
    if (event.tag === 'sync-stats') {
      event.waitUntil(syncStats());
    }
  });
}

async function syncStats() {
  // Background stats sync implementation
  console.log('[SW] Background sync executed');
}

// Message handling for app communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches
        .keys()
        .then(names => {
          return Promise.all(names.map(name => caches.delete(name)));
        })
        .then(() => {
          event.ports[0].postMessage({ type: 'CACHES_CLEARED' });
        })
    );
  }
});

// Periodic sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncContent());
    }
  });
}

async function syncContent() {
  console.log('[SW] Periodic sync executed');
}
