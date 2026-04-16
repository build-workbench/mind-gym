# PWA & Offline Strategy

Complete guide to Progressive Web App implementation and offline capabilities in Mind Gym.

---

## Component Overview

| Component            | File                   | Responsibility                        |
| -------------------- | ---------------------- | ------------------------------------- |
| **Web App Manifest** | `manifest.webmanifest` | Install metadata, icons, theme colors |
| **Service Worker**   | `sw.js`                | Offline caching, request interception |

---

## Web App Manifest

### Configuration

```json
{
  "name": "Mind Gym - Memory Training",
  "short_name": "Mind Gym",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#4f46e5",
  "description": "Browser-based memory training with multiple modes, adaptive difficulty, and progress tracking.",
  "icons": [
    {
      "src": "./assets/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### Field Reference

| Field              | Value        | Description                                 |
| ------------------ | ------------ | ------------------------------------------- |
| `name`             | Full name    | Displayed in app stores and install prompts |
| `short_name`       | Short name   | Shown under the home screen icon            |
| `start_url`        | `./`         | Entry point when launched                   |
| `scope`            | `./`         | PWA scope boundary                          |
| `display`          | `standalone` | Independent window, no browser UI           |
| `background_color` | `#f8fafc`    | Splash screen background                    |
| `theme_color`      | `#4f46e5`    | Address bar/toolbar color                   |
| `icons`            | SVG icon     | Scalable to any size                        |

---

## Service Worker

### Cache Version

```javascript
const CACHE_NAME = 'mind-gym-v3';
```

> ⚠️ **Important**: Increment version when modifying core resources to trigger re-caching.

### Pre-cached Assets

```javascript
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
```

### Caching Strategies

#### 1. CSS Files — Cache First

```javascript
if (url.pathname.endsWith('.css')) {
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
}
```

Returns cached version immediately; fetches and caches only if missing.

#### 2. Navigation Requests — Network First

```javascript
if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => {
        return caches.match(req).then(res => res || caches.match('./index.html'));
      })
  );
}
```

Attempts network first for freshness; falls back to cache on failure.

#### 3. Other GET Requests — Cache First

```javascript
if (req.method === 'GET') {
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
}
```

---

## Service Worker Lifecycle

### Install Phase

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
```

1. Open cache
2. Pre-cache all core assets
3. Skip waiting, activate immediately

### Activate Phase

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});
```

1. Delete old version caches
2. Take control of all clients immediately

### Fetch Interception

```javascript
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Don't cache sw.js itself
  if (url.pathname.endsWith('/sw.js')) return;

  // Apply appropriate strategy...
});
```

---

## Offline Capabilities

### Feature Matrix

| Feature          | Offline Status | Notes                               |
| ---------------- | -------------- | ----------------------------------- |
| Classic Matching | ✅ Full        | Fully offline                       |
| Countdown Mode   | ✅ Full        | Fully offline                       |
| Daily Challenge  | ⚠️ Partial     | Requires online for first-time seed |
| N-back           | ✅ Full        | Fully offline                       |
| Delayed Recall   | ✅ Full        | Fully offline                       |
| Statistics       | ✅ Full        | Local storage                       |
| Achievements     | ✅ Full        | Local storage                       |
| Settings         | ✅ Full        | Local storage                       |
| Import/Export    | ✅ Full        | Local operations                    |

### Offline Limitations

| Limitation      | Explanation                                              |
| --------------- | -------------------------------------------------------- |
| First Visit     | Requires online connection for initial asset download    |
| CDN Resources   | Tailwind CSS CDN cached for offline use after first load |
| Daily Challenge | Seed based on local date; no server validation           |

---

## Update Mechanism

### Automatic Updates

1. New Service Worker detected on page load
2. New assets downloaded in background
3. Update applied on next page visit

### Force Update (User)

1. Clear browser cache
2. Unregister Service Worker in DevTools
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Force Update (Developer)

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  for (let reg of regs) {
    reg.unregister();
  }
});
// Then refresh
```

---

## Browser Compatibility

| Browser     | PWA Support | Service Worker | Install Prompt          |
| ----------- | ----------- | -------------- | ----------------------- |
| Chrome 90+  | ✅ Full     | ✅             | ✅                      |
| Firefox 90+ | ✅ Full     | ✅             | ✅ (Android)            |
| Safari 14+  | ✅ Partial  | ✅             | ⭐ "Add to Home Screen" |
| Edge 90+    | ✅ Full     | ✅             | ✅                      |

### Safari Notes

- No automatic install prompt; use "Share → Add to Home Screen"
- Service Worker persistence limited in private mode
- Some PWA features (like badging) not supported

---

## Debugging Tools

### View Cache Contents

```javascript
// List all cached resources
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        console.log(`Cache: ${name}`);
        keys.forEach(key => console.log('  -', key.url));
      });
    });
  });
});
```

### Clear All Caches

```javascript
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Chrome DevTools

1. **Application** tab → **Service Workers**
   - View registered workers
   - Force update
   - Simulate offline

2. **Application** tab → **Cache Storage**
   - Inspect cached resources
   - Delete individual entries

3. **Network** tab
   - Check "Offline" to simulate
   - Verify assets served from Service Worker

---

## Troubleshooting

### Issue: App won't install

| Check          | Solution                                              |
| -------------- | ----------------------------------------------------- |
| HTTPS          | PWA requires HTTPS (or localhost)                     |
| Manifest       | Validate at [PWABuilder](https://www.pwabuilder.com/) |
| Service Worker | Check DevTools → Application → Service Workers        |

### Issue: Offline mode not working

| Check         | Solution                                    |
| ------------- | ------------------------------------------- |
| First visit   | Must be online for initial cache            |
| Cache version | Increment `CACHE_NAME` after changes        |
| Asset list    | Ensure `ASSETS` includes all required files |

### Issue: Updates not appearing

| Check         | Solution                                              |
| ------------- | ----------------------------------------------------- |
| Hard refresh  | Ctrl+Shift+R / Cmd+Shift+R                            |
| SW unregister | DevTools → Application → Service Workers → Unregister |
| Cache clear   | DevTools → Application → Clear Storage                |

---

## Best Practices

### For Developers

1. **Version Management**: Always update `CACHE_NAME` when modifying cached assets
2. **Asset Completeness**: Ensure `ASSETS` list is comprehensive
3. **Testing**: Test offline mode in Incognito/Private browsing
4. **Gradual Rollout**: Consider shipping Service Worker updates behind feature flags

### For Users

1. **Initial Load**: Keep browser open on first visit until Service Worker installs
2. **Updates**: Close and reopen app to receive updates
3. **Storage**: App uses minimal localStorage (< 50KB typical)

---

_For architecture details, see [Architecture Overview](./architecture.md). For data persistence, see [Storage Model](./storage.md)._
