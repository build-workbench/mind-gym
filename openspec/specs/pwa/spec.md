# PWA & Offline

> Progressive Web App with offline support

## Purpose

Mind Gym is a Progressive Web App that works offline after first load, can be installed on desktop and mobile, and uses Service Worker caching for fast loading.

---

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
  "description": "Browser-based memory training",
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

### Service Worker

Located at `sw.js`

---

## Requirements

### REQ-PWA-001: Offline Capability

The system SHALL work offline after first load.

#### Scenario: First visit

- **WHEN** user visits for first time
- **THEN** all assets cached

#### Scenario: Offline use

- **WHEN** user is offline after first visit
- **THEN** app loads and functions normally

### REQ-PWA-002: Caching Strategies

The system SHALL use appropriate caching strategies per resource type.

#### Scenario: Static assets

- **WHEN** loading JS, CSS, SVG
- **THEN** cache-first strategy used

#### Scenario: Navigation

- **WHEN** loading HTML pages
- **THEN** network-first strategy used

### REQ-PWA-003: Installability

The system SHALL be installable as PWA.

#### Scenario: Install prompt

- **WHEN** browser supports install
- **THEN** install prompt available

#### Scenario: Standalone mode

- **WHEN** launched from home screen
- **THEN** opens in standalone mode

### REQ-PWA-004: Cache Versioning

The system SHALL manage cache versions.

#### Scenario: New version

- **WHEN** Service Worker updates
- **THEN** old cache deleted
- **AND** new cache created

---

## Caching Strategies

| Resource Type      | Strategy      | Rationale                        |
| ------------------ | ------------- | -------------------------------- |
| Core HTML          | Network First | Fresh content, fallback to cache |
| JavaScript modules | Cache First   | Rarely changes, fast loading     |
| CSS files          | Cache First   | Static after build               |
| Static assets      | Cache First   | Never changes                    |

### Cache First Implementation

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

### Network First Implementation

```javascript
if (req.mode === 'navigate') {
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req) || caches.match('./index.html'))
  );
}
```

---

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

---

## Offline Capabilities

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

---

## Acceptance Criteria

| ID         | Criterion                      | Status | Verified   |
| ---------- | ------------------------------ | ------ | ---------- |
| AC-PWA-001 | Assets cached on first visit   | DONE   | 2026-04-17 |
| AC-PWA-002 | Works offline after first load | DONE   | 2026-04-17 |
| AC-PWA-003 | Service Worker registered      | DONE   | 2026-04-17 |
| AC-PWA-004 | Install prompt available       | DONE   | 2026-04-17 |
| AC-PWA-005 | Cache versioning works         | DONE   | 2026-04-17 |
| AC-PWA-006 | Old caches cleaned up          | DONE   | 2026-04-17 |

---

## Browser Compatibility

| Browser     | PWA Support | Service Worker | Install Prompt |
| ----------- | ----------- | -------------- | -------------- |
| Chrome 90+  | ✅ Full     | ✅             | ✅             |
| Firefox 90+ | ✅ Full     | ✅             | ✅ (Android)   |
| Safari 14+  | ✅ Partial  | ✅             | ⭐ Manual      |
| Edge 90+    | ✅ Full     | ✅             | ✅             |

### Safari Notes

- No automatic install prompt
- Use "Share → Add to Home Screen"
- Service Worker limited in private mode

---

## Cache Lifecycle

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

---

## Future Considerations

| Priority | Feature                  | Description                  |
| -------- | ------------------------ | ---------------------------- |
| P2       | Background sync          | Sync progress across devices |
| P3       | Push notifications       | Daily reminder notifications |
| P4       | Periodic background sync | Pre-cache daily challenges   |

---

## References

- [Core Architecture](../../rfc/0001-core-architecture.md)
- [Data Layer](../data-layer/spec.md)
