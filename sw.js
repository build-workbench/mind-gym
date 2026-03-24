const CACHE_NAME = 'memory-match-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './src/keys.js',
  './src/utils.js',
  './src/storage.js',
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
  console.info('[Remember][SW] installed - cached core assets', { count: ASSETS.length });
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim()),
  );
  console.info('[Remember][SW] activated - cleaned up old caches');
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests beyond this line
  if (url.origin !== self.location.origin) return;

  if (req.method !== 'GET') return;

  if (url.pathname.endsWith('/sw.js')) {
    return;
  }

  if (url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      }),
    );
    return;
  }

  // For navigation requests, use network-first then cache fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch((err) => {
          console.warn('[Remember][SW] navigation fallback triggered', err);
          return caches.match(req).then((res) => res || caches.match('./index.html'));
        }),
    );
    return;
  }

  // For other GET requests, cache-first then network
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      }),
    );
  }
});
