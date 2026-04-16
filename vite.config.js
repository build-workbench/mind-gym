import { defineConfig } from 'vite';
import { resolve } from 'path';
import { globSync } from 'glob';

// Advanced Vite configuration for maximum performance
export default defineConfig({
  // Modern build target for better optimization
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Aggressive optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        warnings: false
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
        beautify: false,
      },
    },
    
    // Code splitting for optimal caching
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Dynamic entry points for all modules
        ...Object.fromEntries(
          globSync('src/**/*.js').map(file => [
            file.replace(/^src\//, '').replace(/\.js$/, ''),
            resolve(__dirname, file)
          ])
        ),
      },
      output: {
        manualChunks: {
          // Vendor chunks for optimal caching
          'vendor': [],
          // Core game logic
          'game-core': ['./src/storage.js', './src/stats.js', './src/utils.js'],
          // UI components
          'ui': ['./src/ui.js', './src/ui-events.js', './src/effects.js'],
          // Advanced modes
          'modes': ['./src/modes.js', './src/achievements.js'],
          // Visual effects
          'fx': ['./src/confetti.js', './src/timer.js'],
        },
        // Asset optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    
    // Preload optimization
    modulePreload: {
      polyfill: false,
    },
    
    // Report bundle size
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  
  // Development server optimization
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    cors: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 4173,
    strictPort: true,
    open: true,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'assets'),
    },
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: {
      config: './postcss.config.js',
    },
  },
  
  // Plugin configuration
  plugins: [
    // Production optimizations
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Inject critical CSS
        // Preconnect to CDNs
        // Add resource hints
        return html
          .replace(
            '<head>',
            `<head>
    <!-- Critical resource hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://github.com">
    
    <!-- Performance optimizations -->
    <meta http-equiv="x-dns-prefetch-control" content="on">
    
    <!-- Security headers (meta equivalent) -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self';">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">`
          );
      },
    },
  ],
  
  // Optimizations for dependencies
  optimizeDeps: {
    include: [],
    exclude: [],
    force: false,
    esbuildOptions: {
      target: 'es2022',
      treeShaking: true,
    },
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __MODE__: JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  
  // Experimental features for maximum performance
  experimental: {
    // Enable advanced optimizations
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      // CDN URL transformation if needed
      return { relative: true };
    },
  },
  
  // Worker optimization
  worker: {
    format: 'es',
    plugins: [],
  },
});
