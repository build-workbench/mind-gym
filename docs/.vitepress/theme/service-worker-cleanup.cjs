function normalizeBasePath(baseUrl) {
  const pathname = new URL(baseUrl || '/', 'https://example.invalid').pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function getPathname(url) {
  if (!url) return '';
  return new URL(url, 'https://example.invalid').pathname;
}

async function deleteLegacyMindGymCaches(cacheStorage = globalThis.caches) {
  if (!cacheStorage?.keys || !cacheStorage?.delete) {
    return;
  }

  try {
    const cacheNames = await cacheStorage.keys();
    const legacyCacheNames = cacheNames.filter(name => name.startsWith('mind-gym-'));

    await Promise.all(legacyCacheNames.map(name => cacheStorage.delete(name)));
  } catch {
    // Ignore cache cleanup failures so docs hydration remains unaffected.
  }
}

async function cleanupLegacyRootServiceWorkers(
  baseUrl,
  serviceWorker = globalThis.navigator?.serviceWorker,
  cacheStorage = globalThis.caches
) {
  if (!serviceWorker?.getRegistrations) {
    return 0;
  }

  const basePath = normalizeBasePath(baseUrl);
  const playPath = `${basePath}play/`;

  try {
    const registrations = await serviceWorker.getRegistrations();
    const hasPlayRegistration = registrations.some(registration => {
      const scopePath = getPathname(registration?.scope);
      const scriptPath = getPathname(
        registration?.active?.scriptURL ||
          registration?.waiting?.scriptURL ||
          registration?.installing?.scriptURL
      );

      return scopePath === playPath && scriptPath.startsWith(playPath);
    });
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

    if (cleaned > 0 && !hasPlayRegistration) {
      await deleteLegacyMindGymCaches(cacheStorage);
    }

    return cleaned;
  } catch {
    return 0;
  }
}

module.exports = {
  cleanupLegacyRootServiceWorkers,
};
