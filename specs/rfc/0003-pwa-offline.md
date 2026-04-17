# RFC-0003: PWA & Offline Strategy

| Status  | Accepted   |
| ------- | ---------- |
| Created | 2025-12-18 |
| Updated | 2026-04-17 |

## Summary

This RFC defines the Progressive Web App implementation for Mind Gym, enabling offline functionality, installability, and fast loading through Service Worker caching strategies.

## Motivation

1. Enable offline use after first load
2. Provide native app-like experience
3. Allow installation on desktop and mobile
4. Ensure fast subsequent loads

## Components

### Web App Manifest

Located at `manifest.webmanifest`

```json
{
  "name": "Mind Gym - Memory Training",
  "short_name": "Mind Gym",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#4f46e5",
  "description": "Browser-based memory training with multiple modes",
  "icons": [
    {
      "src": "./assets/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "New Game",
      "short_name": "New",
      "description": "Start a new memory training game",
      "url": "./?action=new",
      "icons": [{ "src": "./assets/icon.svg", "sizes": "any" }]
    },
    {
      "name": "Daily Challenge",
      "short_name": "Daily",
      "description": "Start today's daily challenge",
      "url": "./?action=daily",
      "icons": [{ "src": "./assets/icon.svg", "sizes": "any" }]
    }
  ]
}
```

### Service Worker

Located at `sw.js`

## Caching Strategies

### Strategy Matrix

| Resource Type            | Strategy      | Rationale                        |
| ------------------------ | ------------- | -------------------------------- |
| Core HTML                | Network First | Fresh content, fallback to cache |
| JavaScript modules       | Cache First   | Rarely changes, fast loading     |
| CSS files                | Cache First   | Static after build               |
| Static assets (icons)    | Cache First   | Never changes                    |
| CDN resources (Tailwind) | Cache First   | Cached by browser                |

### Implementation

#### Cache First (CSS, JS, Assets)

```javascript
if (
  url.pathname.endsWith('.css') ||
  url.pathname.endsWith('.js') ||
  url.pathname.endsWith('.svg')
) {
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

#### Network First (Navigation)

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

## Cache Versioning

### Version Management

```javascript
const CACHE_NAME = 'mind-gym-v3';
```

- Increment version when modifying cached assets
- Old caches deleted on activate

### Cache Lifecycle

```
Install Event
    │
    ├── Open new cache
    │
    ├── Pre-cache all ASSETS
    │
    └── skipWaiting()

Activate Event
    │
    ├── Delete old caches
    │
    └── claim() all clients

Fetch Event
    │
    └── Apply appropriate strategy
```

## Pre-cached Assets

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
  './src/stats.js',
  './src/achievements.js',
  './src/modes.js',
  './src/import-export.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/app.css',
];
```

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

### Limitations

| Limitation      | Explanation                                              |
| --------------- | -------------------------------------------------------- |
| First Visit     | Requires online connection for initial asset download    |
| CDN Resources   | Tailwind CSS CDN cached for offline use after first load |
| Daily Challenge | Seed based on local date; no server validation           |

## Installation

### Desktop (Chrome/Edge)

1. Visit the site
2. Click install icon (➕) in address bar
3. App appears in Applications folder / Start menu

### Mobile

#### iOS Safari

1. Tap Share button
2. Select "Add to Home Screen"
3. App appears on home screen

#### Android Chrome

1. Tap Menu (⋮)
2. Select "Add to Home screen"
3. App appears on home screen

## Update Mechanism

### Automatic Updates

1. Browser checks for new Service Worker on page load
2. New SW downloads and caches updated assets
3. Update applies on next page visit

### User-Triggered Update

1. Clear browser cache
2. Unregister Service Worker in DevTools
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Browser Compatibility

| Browser     | PWA Support | Service Worker | Install Prompt          |
| ----------- | ----------- | -------------- | ----------------------- |
| Chrome 90+  | ✅ Full     | ✅             | ✅                      |
| Firefox 90+ | ✅ Full     | ✅             | ✅ (Android)            |
| Safari 14+  | ✅ Partial  | ✅             | ⭐ "Add to Home Screen" |
| Edge 90+    | ✅ Full     | ✅             | ✅                      |

### Safari Notes

- No automatic install prompt
- Use "Share → Add to Home Screen"
- Service Worker persistence limited in private mode
- Some PWA features (badging) not supported

## Debugging

### Chrome DevTools

1. **Application** tab → **Service Workers**
   - View registered workers
   - Force update
   - Simulate offline

2. **Application** tab → **Cache Storage**
   - Inspect cached resources
   - Delete individual entries

### Console Commands

```javascript
// View all cached resources
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

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Testing Checklist

| Test                       | Expected Result               |
| -------------------------- | ----------------------------- |
| First visit                | Assets cached                 |
| Offline after first visit  | App loads and works           |
| New Service Worker version | Old cache deleted             |
| PWA install prompt         | Appears on supported browsers |
| Launch from home screen    | Opens in standalone mode      |
| Offline gameplay           | All features work             |

## Future Considerations

| Priority | Feature                  | Description                  |
| -------- | ------------------------ | ---------------------------- |
| P2       | Background sync          | Sync progress across devices |
| P3       | Push notifications       | Daily reminder notifications |
| P4       | Periodic background sync | Pre-cache daily challenges   |

## References

- [Core Architecture](./0001-core-architecture.md)
- [Storage Specification](../db/storage-spec.md)
