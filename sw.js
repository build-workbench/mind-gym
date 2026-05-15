/**
 * Mind Gym Service Worker v7 - GitHub Pages Optimized
 * Advanced caching with update awareness
 *
 * @version 1.11.0
 * @license MIT
 */

const CACHE_VERSION = 'v1.11.0';
const CACHE_NAME = `mind-gym-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const FONT_CACHE = `${CACHE_NAME}-fonts`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const OFFLINE_PAGE = './offline.html';
const DEBUG = false; // 生产环境关闭调试

const log = DEBUG ? console.log.bind(console, '[SW]') : () => {};
const warn = console.warn.bind(console, '[SW]');
const error = console.error.bind(console, '[SW]');

// Precache list - critical assets (synced with index.html script tags)
const PRECACHE_ASSETS = [
  // Core pages
  './',
  './index.html',
  './app.js',
  './404.html',
  './offline.html',
  // Modules in load order (matches index.html script tag order)
  './src/keys.js',
  './src/utils.js',
  './src/shared.js',
  './src/stats.js',
  './src/achievements.js',
  './src/modes.js',
  './src/import-export.js',
  './src/storage.js',
  './src/settings-manager.js',
  './src/fsrs.js',
  './src/nback-state.js',
  './src/recall-state.js',
  './src/adaptive.js',
  './src/daily.js',
  './src/game-manager.js',
  './src/modal-manager.js',
  './src/game-state.js',
  './src/modes/registry.js',
  './src/modes/classic.js',
  './src/modes/countdown.js',
  './src/modes/daily.js',
  './src/modes/nback.js',
  './src/modes/recall.js',
  './src/i18n.js',
  './src/effects.js',
  './src/pools.js',
  './src/timer.js',
  './src/confetti.js',
  './src/ui-events.js',
  './src/ui.js',
  './src/ui/renderer.js',
  './src/pipeline/win-pipeline.js',
  // Manifest and assets
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/app.css',
];

// Install event - precache critical assets
self.addEventListener('install', event => {
  log('Installing...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        log('Precaching static assets...');
        // Use addAll but catch errors for optional assets
        return Promise.all(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(err => {
              warn('Failed to cache:', url, err.message);
            })
          )
        );
      })
      .then(() => {
        log('Precache complete');
        return self.skipWaiting();
      })
      .catch(err => {
        error('Precache failed:', err);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  log('Activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              const isMindGym = name.startsWith('mind-gym-') && !name.includes(CACHE_VERSION);
              const isGoogleFont = name.startsWith('google-fonts-');
              return isMindGym || isGoogleFont;
            })
            .map(name => {
              log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        log('Activation complete');
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

  // Handle external requests (Google Fonts)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleGoogleFonts(request));
    return;
  }

  // Only handle same-origin requests for main content
  // For GitHub Pages, also handle requests from the repo path
  const isGitHubPages = url.hostname === 'lessup.github.io';
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin && !isGitHubPages) return;

  // Route to appropriate strategy based on file type
  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  } else if (/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithExpiration(request, IMAGE_CACHE, 100, 30 * 24 * 60 * 60));
  } else if (/\.(woff2|woff|ttf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithExpiration(request, FONT_CACHE, 20, 365 * 24 * 60 * 60));
  } else if (request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    // For navigation requests, use network-first for up-to-date content
    event.respondWith(networkFirstWithFallback(request, STATIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Stale While Revalidate - good for JS/CSS that updates frequently
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

// Cache First with expiration and limit - good for images
async function cacheFirstWithExpiration(request, cacheName, maxEntries, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Check expiration via custom header
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
      await cleanupCache(cacheName, maxEntries);
    }
    return networkResponse;
  } catch (error) {
    return cached || new Response('Network error', { status: 408 });
  }
}

// Network First with fallback - good for navigation
async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetchWithTimeout(request, 3000);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    log('Network failed, serving from cache');
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

// Message handling for app communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    log('Skip waiting received');
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
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'CACHES_CLEARED' });
          }
        })
    );
  }

  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Trigger update check
    self.registration.update().then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'UPDATE_CHECKED' });
      }
    });
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncContent());
    }
  });
}

async function syncContent() {
  log('Periodic sync executed');
  // Could fetch stats or achievements here
}
