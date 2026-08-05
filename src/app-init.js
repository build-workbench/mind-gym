/**
 * App initialization bootstrapper.
 *
 * Runs before app.js: restores SPA redirect paths, removes the initial loader,
 * and registers the service worker with update handling. Extracted from
 * index.html so the markup stays focused on structure.
 */
(function () {
  // SPA redirect handling (from 404.html)
  var redirect = sessionStorage.getItem('spa-redirect');
  if (redirect) {
    sessionStorage.removeItem('spa-redirect');
    // Store the path for app.js to handle routing
    window.__INITIAL_PATH__ = redirect;
    console.log('[SPA] Restored path from redirect:', redirect);
  }

  // Remove loader when app starts
  window.addEventListener('DOMContentLoaded', function () {
    var loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(function () {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
        document.body.classList.remove('loading');
      }, 300);
    }
  });

  // Service Worker Registration with update handling
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js')
        .then(function (registration) {
          console.log('[SW] Registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            console.log('[SW] Update found, installing...');

            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available - show update notification
                console.log('[SW] Update ready');
                showUpdateNotification(newWorker);
              }
            });
          });
        })
        .catch(function (error) {
          console.log('[SW] Registration failed:', error);
        });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', function (event) {
        console.log('[SW] Message:', event.data);
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          showUpdateNotification();
        }
      });
    });

    // Show update notification
    function showUpdateNotification(worker) {
      var notification = document.getElementById('update-notification');
      var updateBtn = document.getElementById('update-btn');

      if (notification && updateBtn) {
        notification.classList.add('show');

        updateBtn.addEventListener('click', function () {
          if (worker) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
          window.location.reload();
        });
      }
    }
  }
})();
