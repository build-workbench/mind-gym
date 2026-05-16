function normalizeBasePath(baseUrl) {
  const pathname = new URL(baseUrl || '/', 'https://example.invalid').pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function getPathname(url) {
  if (!url) return '';
  return new URL(url, 'https://example.invalid').pathname;
}

async function cleanupLegacyRootServiceWorkers(
  baseUrl,
  serviceWorker = globalThis.navigator?.serviceWorker
) {
  if (!serviceWorker?.getRegistrations) {
    return 0;
  }

  const basePath = normalizeBasePath(baseUrl);
  const playPath = `${basePath}play/`;

  try {
    const registrations = await serviceWorker.getRegistrations();
    let cleaned = 0;

    for (const registration of registrations) {
      const scopePath = getPathname(registration?.scope);
      const scriptPath = getPathname(
        registration?.active?.scriptURL ||
          registration?.waiting?.scriptURL ||
          registration?.installing?.scriptURL
      );

      if (scopePath !== basePath || scriptPath.startsWith(playPath)) {
        continue;
      }

      try {
        const unregistered = await registration.unregister?.();
        if (unregistered) {
          cleaned += 1;
        }
      } catch {
        // Ignore unregister failures so docs hydration remains unaffected.
      }
    }

    return cleaned;
  } catch {
    return 0;
  }
}

module.exports = {
  cleanupLegacyRootServiceWorkers,
};
