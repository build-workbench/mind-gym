function normalizeBasePath(baseUrl) {
  const pathname = new URL(baseUrl || '/', 'https://example.invalid').pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function hasLegacyAppIntent(url, { isStandalone = false, referrer = '' } = {}) {
  if (!url) {
    return false;
  }

  const appIntentParams = ['mode', 'title', 'text', 'url'];
  if (appIntentParams.some((param) => url.searchParams.has(param))) {
    return true;
  }

  if (isStandalone) {
    return true;
  }

  return typeof referrer === 'string' && referrer.startsWith('android-app://');
}

function hasDocsIntent(url) {
  if (!url) {
    return false;
  }

  return url.searchParams.has('docs');
}

function resolveRootVisitTarget({
  href,
  baseUrl = '/',
  isStandalone = false,
  referrer = '',
}) {
  const currentUrl = new URL(href, 'https://example.invalid');
  const basePath = normalizeBasePath(baseUrl);
  const targetPath = hasDocsIntent(currentUrl) ? `${basePath}zh/` : `${basePath}play/`;
  const targetUrl = new URL(targetPath, currentUrl.origin);

  targetUrl.search = currentUrl.search;
  targetUrl.hash = currentUrl.hash;

  return targetUrl.toString();
}

module.exports = {
  hasLegacyAppIntent,
  normalizeBasePath,
  resolveRootVisitTarget,
};
