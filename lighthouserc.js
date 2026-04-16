/**
 * Lighthouse CI Configuration
 * Aggressive performance targets
 */

module.exports = {
  ci: {
    // Upload target
    upload: {
      target: 'filesystem',
      outputDir: './lhci-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
    
    // Collection settings
    collect: {
      // Number of runs to average
      numberOfRuns: 3,
      
      // URL to test
      url: ['http://localhost:3000/'],
      
      // Chrome flags for consistent results
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
      ],
      
      // Settings
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        skipAudits: ['uses-http2'], // GitHub Pages doesn't support HTTP/2
        throttling: {
          // Disable throttling for consistent CI results
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
          rttMs: 0,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    
    // Assertion settings - aggressive targets
    assert: {
      preset: 'lighthouse:no-pwa',
      
      // Performance assertions
      assertions: {
        // Core Web Vitals
        'categories:performance': ['warn', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'categories:pwa': ['warn', { minScore: 0.80 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Resource budgets
        'total-byte-weight': ['warn', { maxNumericValue: 500000 }], // 500KB
        'uses-long-cache-ttl': 'warn',
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        
        // Best practices
        'uses-passive-event-listeners': 'error',
        'no-document-write': 'error',
        'external-anchors-use-rel-noopener': 'warn',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
        'no-vulnerable-libraries': 'error',
        
        // Accessibility
        'accesskeys': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'bypass': 'error',
        'color-contrast': 'warn',
        'definition-list': 'error',
        'dlitem': 'error',
        'document-title': 'error',
        'duplicate-id': 'error',
        'frame-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'label': 'error',
        'layout-table': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-refresh': 'error',
        'meta-viewport': 'error',
        'object-alt': 'error',
        'tabindex': 'error',
        'td-headers-attr': 'error',
        'th-has-data-cells': 'error',
        'valid-lang': 'error',
        'video-caption': 'error',
        'video-description': 'error',
      },
    },
    
    // Server settings
    server: {
      // Don't start a server - we use the collect.url directly
    },
    
    // Wizard settings
    wizard: {
      serverCommand: 'npx serve dist -p 3000',
    },
  },
};
