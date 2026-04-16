/**
 * Advanced Service Worker Configuration
 * Maximum performance aggressive caching strategy
 */

const SW_CONFIG = {
  // Cache versioning - change to invalidate all caches
  CACHE_VERSION: 'mind-gym-v3-aggressive',
  
  // Precache configuration
  PRECACHE: {
    // Core HTML and shell
    shell: [
      './',
      './index.html',
      './manifest.webmanifest',
      './robots.txt',
      './sitemap.xml',
    ],
    // Critical CSS and JS
    critical: [
      './assets/app.css',
      './assets/js/main-*.js',
    ],
    // All source modules
    modules: [
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
      './src/ui.js',
      './src/ui-events.js',
    ],
  },
  
  // Runtime caching strategies
  RUNTIME_CACHING: {
    // Images - Cache First with expiration
    images: {
      strategy: 'CacheFirst',
      pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      options: {
        cacheName: 'images-cache',
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }
    },
    
    // Fonts - Cache First, long expiration
    fonts: {
      strategy: 'CacheFirst',
      pattern: /\.(?:woff2?|ttf|otf|eot)$/i,
      options: {
        cacheName: 'fonts-cache',
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }
    },
    
    // Google Fonts stylesheets - Stale While Revalidate
    googleFontsStyles: {
      strategy: 'StaleWhileRevalidate',
      pattern: /^https:\/\/fonts\.googleapis\.com/,
      options: {
        cacheName: 'google-fonts-stylesheets',
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }
    },
    
    // Google Fonts webfonts - Cache First
    googleFontsWebfonts: {
      strategy: 'CacheFirst',
      pattern: /^https:\/\/fonts\.gstatic\.com/,
      options: {
        cacheName: 'google-fonts-webfonts',
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }
    },
    
    // API calls - Network First with timeout
    api: {
      strategy: 'NetworkFirst',
      pattern: /\/api\//,
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3,
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }
    },
    
    // JSON data - Stale While Revalidate
    json: {
      strategy: 'StaleWhileRevalidate',
      pattern: /\.json$/,
      options: {
        cacheName: 'json-cache',
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }
    },
  },
  
  // Background sync configuration
  BACKGROUND_SYNC: {
    enabled: true,
    queueName: 'sync-queue',
    maxRetentionTime: 24 * 60, // 24 hours
  },
  
  // Push notifications (prepared)
  PUSH_NOTIFICATIONS: {
    enabled: false, // Set to true when implementing
    options: {
      // Configuration for push notifications
    }
  },
  
  // Periodic background sync (prepared)
  PERIODIC_SYNC: {
    enabled: false,
    tag: 'content-sync',
    minInterval: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Offline fallback configuration
  OFFLINE_FALLBACK: {
    enabled: true,
    page: './offline.html',
    image: './assets/offline.svg',
  },
  
  // Plugin configuration for workbox
  WORKBOX_PLUGINS: [
    // Clean old caches
    {
      name: 'cleanup-old-caches',
      async cachesDidUpdate({ oldCache, newCache, cacheName }) {
        if (oldCache) {
          const oldKeys = await oldCache.keys();
          const newKeys = await newCache.keys();
          const keysToDelete = oldKeys.filter(
            oldKey => !newKeys.some(newKey => newKey.url === oldKey.url)
          );
          await Promise.all(keysToDelete.map(key => oldCache.delete(key)));
        }
      }
    }
  ],
};

// Export for use in build process
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SW_CONFIG;
}
