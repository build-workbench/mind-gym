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
    const unregisterPlay = jest.fn().mockResolvedValue(false);
    const unregisterNested = jest.fn().mockResolvedValue(false);

    const registrations = [
      {
        scope: 'https://lessup.github.io/mind-gym/',
        active: { scriptURL: 'https://lessup.github.io/mind-gym/sw.js' },
        unregister: unregisterLegacy,
      },
      {
        scope: 'https://lessup.github.io/mind-gym/play/',
        active: { scriptURL: 'https://lessup.github.io/mind-gym/play/sw.js' },
        unregister: unregisterPlay,
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
    const result = await cleanupLegacyRootServiceWorkers('/mind-gym/', serviceWorker);

    expect(result).toBe(1);
    expect(unregisterLegacy).toHaveBeenCalledTimes(1);
    expect(unregisterPlay).not.toHaveBeenCalled();
    expect(unregisterNested).not.toHaveBeenCalled();
  });

  test('skips root registrations whose worker script already lives under /play/', async () => {
    const unregister = jest.fn().mockResolvedValue(true);

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
    const result = await cleanupLegacyRootServiceWorkers('/mind-gym/', serviceWorker);

    expect(result).toBe(0);
    expect(unregister).not.toHaveBeenCalled();
  });
});
