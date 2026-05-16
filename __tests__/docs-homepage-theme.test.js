const fs = require('node:fs');
const path = require('node:path');
const repoRoot = path.resolve(__dirname, '..');

function requireCleanupModule() {
  const modulePath = path.join(
    repoRoot,
    'docs',
    '.vitepress',
    'theme',
    'service-worker-cleanup.cjs'
  );
  return require(modulePath);
}

function requireRootCompatModule() {
  const modulePath = path.join(repoRoot, 'docs', '.vitepress', 'theme', 'root-compat.cjs');
  return require(modulePath);
}

describe('docs homepage CTA links', () => {
  test.each([
    ['en', 'docs/en/index.md'],
    ['zh', 'docs/zh/index.md'],
  ])(
    '%s homepage links to the playable build with a base-aware relative path',
    (_, relativePath) => {
      const content = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

      expect(content).toContain('href="../play/index.html"');
      expect(content).not.toContain('href="/play/index.html"');
    }
  );
});

describe('legacy service worker cleanup', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('unregisters only legacy root-scope workers outside the play scope', async () => {
    const unregisterLegacy = jest.fn().mockResolvedValue(true);
    const unregisterNested = jest.fn().mockResolvedValue(false);
    const cacheStorage = {
      keys: jest.fn().mockResolvedValue(['mind-gym-v1.10.0-static', 'other-cache']),
      delete: jest.fn().mockResolvedValue(true),
    };

    const registrations = [
      {
        scope: 'https://lessup.github.io/mind-gym/',
        active: { scriptURL: 'https://lessup.github.io/mind-gym/sw.js' },
        unregister: unregisterLegacy,
      },
      {
        scope: 'https://lessup.github.io/mind-gym/nested/',
        active: { scriptURL: 'https://lessup.github.io/mind-gym/nested/sw.js' },
        unregister: unregisterNested,
      },
    ];

    const serviceWorker = {
      getRegistrations: jest.fn().mockResolvedValue(registrations),
    };

    const { cleanupLegacyRootServiceWorkers } = requireCleanupModule();
    const result = await cleanupLegacyRootServiceWorkers('/mind-gym/', serviceWorker, cacheStorage);

    expect(result).toBe(1);
    expect(unregisterLegacy).toHaveBeenCalledTimes(1);
    expect(unregisterNested).not.toHaveBeenCalled();
    expect(cacheStorage.keys).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith('mind-gym-v1.10.0-static');
    expect(cacheStorage.delete).not.toHaveBeenCalledWith('other-cache');
  });

  test('skips root registrations whose worker script already lives under /play/', async () => {
    const unregister = jest.fn().mockResolvedValue(true);
    const cacheStorage = {
      keys: jest.fn(),
      delete: jest.fn(),
    };

    const serviceWorker = {
      getRegistrations: jest.fn().mockResolvedValue([
        {
          scope: 'https://lessup.github.io/mind-gym/',
          active: { scriptURL: 'https://lessup.github.io/mind-gym/play/sw.js' },
          unregister,
        },
      ]),
    };

    const { cleanupLegacyRootServiceWorkers } = requireCleanupModule();
    const result = await cleanupLegacyRootServiceWorkers('/mind-gym/', serviceWorker, cacheStorage);

    expect(result).toBe(0);
    expect(unregister).not.toHaveBeenCalled();
    expect(cacheStorage.keys).not.toHaveBeenCalled();
  });

  test('preserves shared caches when a /play/ worker is already registered', async () => {
    const unregisterLegacy = jest.fn().mockResolvedValue(true);
    const cacheStorage = {
      keys: jest.fn(),
      delete: jest.fn(),
    };

    const serviceWorker = {
      getRegistrations: jest.fn().mockResolvedValue([
        {
          scope: 'https://lessup.github.io/mind-gym/',
          active: { scriptURL: 'https://lessup.github.io/mind-gym/sw.js' },
          unregister: unregisterLegacy,
        },
        {
          scope: 'https://lessup.github.io/mind-gym/play/',
          active: { scriptURL: 'https://lessup.github.io/mind-gym/play/sw.js' },
          unregister: jest.fn().mockResolvedValue(false),
        },
      ]),
    };

    const { cleanupLegacyRootServiceWorkers } = requireCleanupModule();
    const result = await cleanupLegacyRootServiceWorkers('/mind-gym/', serviceWorker, cacheStorage);

    expect(result).toBe(1);
    expect(unregisterLegacy).toHaveBeenCalledTimes(1);
    expect(cacheStorage.keys).not.toHaveBeenCalled();
  });
});

describe('docs root compatibility redirect', () => {
  test('keeps legacy mode launches on the playable app route', () => {
    const { resolveRootVisitTarget } = requireRootCompatModule();

    expect(
      resolveRootVisitTarget({
        href: 'https://lessup.github.io/mind-gym/?mode=nback#focus',
        language: 'en-US',
        baseUrl: '/mind-gym/',
      })
    ).toBe('https://lessup.github.io/mind-gym/play/?mode=nback#focus');
  });

  test('sends standalone launches to the playable app route', () => {
    const { resolveRootVisitTarget } = requireRootCompatModule();

    expect(
      resolveRootVisitTarget({
        href: 'https://lessup.github.io/mind-gym/',
        language: 'zh-CN',
        baseUrl: '/mind-gym/',
        isStandalone: true,
      })
    ).toBe('https://lessup.github.io/mind-gym/play/');
  });

  test('keeps normal browser visits on locale-aware docs routes', () => {
    const { resolveRootVisitTarget } = requireRootCompatModule();

    expect(
      resolveRootVisitTarget({
        href: 'https://lessup.github.io/mind-gym/?utm_source=docs',
        language: 'zh-CN',
        baseUrl: '/mind-gym/',
      })
    ).toBe('https://lessup.github.io/mind-gym/zh/?utm_source=docs');
  });
});

describe('artifact inspection scripts', () => {
  test('preview and analyze inspect the deployed docs artifact', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

    expect(packageJson.scripts.preview).toContain('docs/.vitepress/dist');
    expect(packageJson.scripts.analyze).toContain('docs/.vitepress/dist');
    expect(packageJson.scripts.preview).not.toContain('serve dist');
  });
});

describe('docs crawl metadata', () => {
  test('root docs robots.txt points crawlers at the docs-first sitemap', () => {
    const robots = fs.readFileSync(path.join(repoRoot, 'docs', 'public', 'robots.txt'), 'utf8');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://lessup.github.io/mind-gym/sitemap.xml');
  });

  test('root docs sitemap enumerates the docs-first entry points and the play demo', () => {
    const sitemap = fs.readFileSync(path.join(repoRoot, 'docs', 'public', 'sitemap.xml'), 'utf8');

    expect(sitemap).toContain('<loc>https://lessup.github.io/mind-gym/</loc>');
    expect(sitemap).toContain('<loc>https://lessup.github.io/mind-gym/en/</loc>');
    expect(sitemap).toContain('<loc>https://lessup.github.io/mind-gym/zh/</loc>');
    expect(sitemap).toContain('<loc>https://lessup.github.io/mind-gym/play/index.html</loc>');
  });
});
